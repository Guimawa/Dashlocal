// src/utils/formatters.js
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, access } from "fs/promises";
import { join, dirname } from "path";
import { createHash } from "crypto";

const execAsync = promisify(exec);

class CodeFormatter {
  constructor() {
    this.supportedTools = ["prettier", "eslint"];
    this.cache = new Map();
    this.configCache = new Map();
  }

  /**
   * Détecte les outils de formatage disponibles
   */
  async detectTools(projectRoot = process.cwd()) {
    const availableTools = [];

    for (const tool of this.supportedTools) {
      try {
        const configPath = await this.findConfig(tool, projectRoot);
        if (configPath) {
          availableTools.push({
            name: tool,
            configPath,
            available: true,
          });
        }
      } catch {
        availableTools.push({
          name: tool,
          available: false,
        });
      }
    }

    return availableTools;
  }

  /**
   * Trouve le fichier de configuration d'un outil
   */
  async findConfig(toolName, directory) {
    const configFiles = {
      prettier: [".prettierrc", ".prettierrc.json", "prettier.config.js"],
      eslint: [".eslintrc.js", ".eslintrc.json", ".eslintrc"],
    };

    let currentDir = directory;

    while (currentDir !== "/") {
      for (const configFile of configFiles[toolName] || []) {
        const configPath = join(currentDir, configFile);
        try {
          await access(configPath);
          return configPath;
        } catch {
          continue;
        }
      }

      // Remonter d'un niveau
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Formate le code avec Prettier
   */
  async formatWithPrettier(code, configPath = null) {
    try {
      // Créer un fichier temporaire
      const tempFile = join("/tmp", `temp-${Date.now()}.js`);
      await writeFile(tempFile, code);

      let command = "npx prettier --write";
      if (configPath) {
        command += ` --config ${configPath}`;
      }

      const { stdout, stderr } = await execAsync(`${command} ${tempFile}`);

      if (stderr) {
        console.warn("Prettier stderr:", stderr);
      }

      const formattedCode = await readFile(tempFile, "utf8");

      // Nettoyer
      await execAsync(`rm ${tempFile}`);

      return {
        success: true,
        code: formattedCode,
        tool: "prettier",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: "prettier",
      };
    }
  }

  /**
   * Formate le code avec ESLint
   */
  async formatWithEslint(code, configPath = null) {
    try {
      const tempFile = join("/tmp", `temp-${Date.now()}.js`);
      await writeFile(tempFile, code);

      let command = "npx eslint --fix";
      if (configPath) {
        command += ` --config ${configPath}`;
      }

      const { stdout, stderr } = await execAsync(`${command} ${tempFile}`);

      const formattedCode = await readFile(tempFile, "utf8");

      await execAsync(`rm ${tempFile}`);

      return {
        success: true,
        code: formattedCode,
        warnings: stderr,
        tool: "eslint",
      };
    } catch (error) {
      // ESLint peut échuer mais quand même formater
      try {
        const formattedCode = await readFile(tempFile, "utf8");
        await execAsync(`rm ${tempFile}`);

        return {
          success: true,
          code: formattedCode,
          warnings: error.message,
          tool: "eslint",
        };
      } catch {
        return {
          success: false,
          error: error.message,
          tool: "eslint",
        };
      }
    }
  }

  /**
   * Formate le code intelligemment en choisissant le meilleur outil
   */
  async formatCode(code, language = "javascript", context = {}) {
    const cacheKey = createHash("md5").update(code).digest("hex");
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const availableTools = await this.detectTools(context.projectRoot);
    let result = null;

    // Essayer Prettier en premier s'il est disponible
    const prettier = availableTools.find(
      (t) => t.name === "prettier" && t.available,
    );
    if (prettier) {
      result = await this.formatWithPrettier(code, prettier.configPath);
      if (result.success) {
        this.cache.set(cacheKey, result);
        return result;
      }
    }

    // Fallback sur ESLint
    const eslint = availableTools.find(
      (t) => t.name === "eslint" && t.available,
    );
    if (eslint) {
      result = await this.formatWithEslint(code, eslint.configPath);
      if (result.success) {
        this.cache.set(cacheKey, result);
        return result;
      }
    }

    // Fallback basique si aucun outil n'est disponible
    const basicFormatted = this.basicFormat(code, language);
    result = {
      success: true,
      code: basicFormatted,
      tool: "basic",
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Formatage basique sans outils externes
   */
  basicFormat(code, language) {
    // Implémentation basique pour JavaScript/TypeScript
    let formatted = code;

    // Indentation basique
    formatted = formatted
      .replace(/\t/g, "    ") // Tabs to spaces
      .replace(/\n\s+\n/g, "\n\n") // Remove trailing spaces
      .replace(/\{\s*\n/g, "{\n") // Clean brace formatting
      .replace(/\n\s*\}/g, "\n}");

    // Ajouter une nouvelle ligne à la fin si manquante
    if (!formatted.endsWith("\n")) {
      formatted += "\n";
    }

    return formatted;
  }

  /**
   * Formate et valide le code en une seule opération
   */
  async formatAndValidate(code, context = {}) {
    const formatResult = await this.formatCode(code, context.language, context);

    if (!formatResult.success) {
      return {
        formatted: false,
        validated: false,
        code: code,
        errors: [formatResult.error],
      };
    }

    // Valider le code formaté (implémentation simplifiée)
    const validator = new (await import("./validators.js")).default();
    const validationResult = await validator.validateCode(
      formatResult.code,
      context,
    );

    return {
      formatted: true,
      validated: validationResult.valid,
      code: formatResult.code,
      tool: formatResult.tool,
      validation: validationResult,
      metrics: validationResult.metrics,
    };
  }

  /**
   * Applique un style guide spécifique
   */
  async applyStyleGuide(code, styleGuide = "airbnb", language = "javascript") {
    const styleGuides = {
      airbnb: {
        indent: 2,
        quotes: "single",
        semi: true,
        trailingComma: "es5",
      },
      standard: {
        indent: 2,
        quotes: "single",
        semi: false,
        trailingComma: "none",
      },
      google: {
        indent: 2,
        quotes: "single",
        semi: true,
        trailingComma: "es5",
      },
    };

    const config = styleGuides[styleGuide] || styleGuides.airbnb;

    // Implémentation basique - en production, utiliser Prettier avec config
    let formatted = code;

    if (config.quotes === "single") {
      formatted = formatted.replace(/"/g, "'");
    } else {
      formatted = formatted.replace(/'/g, '"');
    }

    if (!config.semi) {
      formatted = formatted.replace(/;/g, "");
    }

    return formatted;
  }

  /**
   * Génère un rapport de formatage
   */
  async generateFormatReport(code, formattedCode, context = {}) {
    const originalLines = code.split("\n").length;
    const formattedLines = formattedCode.split("\n").length;

    const changes = this.calculateChanges(code, formattedCode);

    return {
      original: {
        lines: originalLines,
        length: code.length,
      },
      formatted: {
        lines: formattedLines,
        length: formattedCode.length,
      },
      changes: changes,
      reduction: {
        lines: originalLines - formattedLines,
        characters: code.length - formattedCode.length,
      },
      timestamp: new Date().toISOString(),
      context: context,
    };
  }

  /**
   * Calcule les changements entre l'original et le formaté
   */
  calculateChanges(original, formatted) {
    // Implémentation simplifiée
    const originalLines = original.split("\n");
    const formattedLines = formatted.split("\n");

    const changes = [];
    const maxLines = Math.max(originalLines.length, formattedLines.length);

    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || "";
      const formattedLine = formattedLines[i] || "";

      if (originalLine.trim() !== formattedLine.trim()) {
        changes.push({
          line: i + 1,
          original: originalLine,
          formatted: formattedLine,
          type:
            originalLine === ""
              ? "added"
              : formattedLine === ""
                ? "removed"
                : "modified",
        });
      }
    }

    return changes;
  }

  /**
   * Nettoie le cache
   */
  clearCache() {
    this.cache.clear();
    this.configCache.clear();
  }
}

export default CodeFormatter;
