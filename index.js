#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import fs from "fs/promises";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

// Charger les variables d'environnement
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Imports locaux
import { getGroqClient } from "./src/utils/groq-client.js";
import CodeValidator from "./src/utils/validators.js";
import CodeFormatter from "./src/utils/formatters.js";

// Initialisation des instances
const groqClient = getGroqClient();
const validator = new CodeValidator();
const formatter = new CodeFormatter();

// Configuration
const CONFIG = {
  srcPath: "./src",
  logFile: "./generation-log.json",
  maxFileSize: process.env.MAX_FILE_SIZE || 10000,
  cacheTTL: process.env.CACHE_TTL || 300000,
};

class DashboardCLI {
  constructor() {
    this.generationCount = 0;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  /**
   * Initialize the CLI application
   */
  async init() {
    try {
      await this.clearScreen();
      await this.showWelcome();
      await this.checkEnvironment();
      await this.mainMenu();
    } catch (error) {
      this.handleFatalError(error);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear terminal screen
   */
  async clearScreen() {
    console.clear();
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "cls"]);
    } else {
      process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
    }
  }

  /**
   * Show welcome banner
   */
  async showWelcome() {
    console.log(
      chalk.blueBright(figlet.textSync("IA COPILOT", { font: "Slant" })),
    );

    console.log(
      chalk.greenBright("🚀 Dashboard IA - Génération de code assistée\n"),
    );
    console.log(chalk.gray(`Session: ${this.sessionId}`));
    console.log(chalk.gray("━".repeat(50)));
  }

  /**
   * Check environment requirements
   */
  async checkEnvironment() {
    const checks = [
      {
        name: "Dossier src/",
        check: async () => {
          try {
            await fs.access(CONFIG.srcPath);
            return true;
          } catch {
            await fs.mkdir(CONFIG.srcPath, { recursive: true });
            return true;
          }
        },
      },
      {
        name: "Clé API Groq",
        check: () => {
          return !!process.env.GROQ_API_KEY;
        },
      },
    ];

    for (const check of checks) {
      const result = await check.check();
      if (!result) {
        throw new Error(`❌ Échec vérification: ${check.name}`);
      }
    }
  }

  /**
   * Main interactive menu
   */
  async mainMenu() {
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "🎯 Que veux-tu générer ?",
          choices: [
            { name: "📊 Modèle de données MongoDB", value: "model" },
            { name: "⚛️ Composant React", value: "component" },
            { name: "🔌 Service API", value: "service" },
            { name: "🎨 Hook personnalisé", value: "hook" },
            { name: "📝 Utilitaire/Helper", value: "utility" },
            { name: "⚙️ Configuration", value: "config" },
            { name: "📊 Stats de génération", value: "stats" },
            { name: "🧹 Nettoyer le dossier src/", value: "clean" },
            { name: "🚪 Quitter", value: "exit" },
          ],
          pageSize: 10,
        },
      ]);

      if (action === "exit") {
        await this.exitApp();
        break;
      }

      await this.handleAction(action);
    }
  }

  /**
   * Handle menu actions
   */
  async handleAction(action) {
    switch (action) {
      case "model":
        await this.generateCode("model", "Modèle MongoDB");
        break;
      case "component":
        await this.generateCode("component", "Composant React");
        break;
      case "service":
        await this.generateCode("service", "Service API");
        break;
      case "hook":
        await this.generateCode("hook", "Hook React personnalisé");
        break;
      case "utility":
        await this.generateCode("utility", "Utilitaire JavaScript");
        break;
      case "config":
        await this.showConfig();
        break;
      case "stats":
        await this.showStats();
        break;
      case "clean":
        await this.cleanSourceFolder();
        break;
    }
  }

  /**
   * Generate code based on type
   */
  async generateCode(type, displayName) {
    try {
      const { name } = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: `📝 Nom du ${displayName.toLowerCase()} :`,
          validate: (input) => {
            if (!input.trim()) return "Le nom ne peut pas être vide";
            if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
              return "Utilise seulement lettres, chiffres, underscores et tirets";
            }
            return true;
          },
        },
      ]);

      const prompt = await this.buildPrompt(type, name);
      console.log(chalk.blueBright("\n⚡ Génération en cours..."));

      const result = await groqClient.generateCode(
        prompt,
        `${displayName} ${name}`,
        2,
      );

      if (result.success) {
        // 🔥 NOUVEAU : Validation et formatage
        console.log(chalk.blueBright("🔍 Validation du code..."));

        // Validation
        const validationResult = await validator.validateCode(result.code);
        if (!validationResult.valid) {
          console.log(chalk.yellow("⚠️  Avertissements de validation:"));
          validationResult.issues.forEach((issue) => {
            console.log(chalk.gray(`  - ${issue.message}`));
          });
        }

        // Formatage
        console.log(chalk.blueBright("🎨 Formatage du code..."));
        const formatResult = await formatter.formatCode(result.code);
        if (formatResult.success) {
          result.code = formatResult.code;
          console.log(chalk.gray(`✅ Formaté avec ${formatResult.tool}`));
        } else {
          console.log(
            chalk.yellow("⚠️  Échec du formatage, utilisation du code brut"),
          );
        }

        await this.writeGeneratedFile(type, name, result);
        await this.logGeneration(result, true);

        // Afficher les métriques
        if (validationResult.metrics) {
          console.log(
            chalk.gray(
              `📊 Complexité: ${validationResult.metrics.complexityScore}/100`,
            ),
          );
          console.log(
            chalk.gray(`📏 Lignes: ${validationResult.metrics.totalLines}`),
          );
        }

        console.log(
          chalk.greenBright(`✅ ${displayName} généré avec succès !`),
        );
      } else {
        await this.logGeneration(result, false);
        console.log(chalk.redBright(`❌ Erreur: ${result.error}`));
      }
    } catch (error) {
      console.log(chalk.redBright(`❌ Erreur: ${error.message}`));
    }

    await this.pause();
  }

  /**
   * Build prompt based on type
   */
  async buildPrompt(type, name) {
    const prompts = {
      model: `Génère un modèle MongoDB Mongoose pour "${name}" avec validation, hooks et méthodes statiques si nécessaire.`,
      component: `Crée un composant React fonctionnel "${name}" avec TypeScript, hooks modernes et props typées.`,
      service: `Développe un service API "${name}" avec gestion d'erreurs, intercepteurs et méthodes CRUD complètes.`,
      hook: `Écris un hook React personnalisé "${name}" avec gestion d'état, effets et retour typé.`,
      utility: `Crée une utilitaire "${name}" avec fonctions pures, tests unitaires et documentation JSDoc.`,
    };

    return prompts[type] || `Génère du code pour ${name}`;
  }

  /**
   * Write generated file to appropriate location
   */
  async writeGeneratedFile(type, name, result) {
    const extensions = {
      model: ".js",
      component: ".tsx",
      service: ".ts",
      hook: ".ts",
      utility: ".ts",
    };

    const directories = {
      model: "models",
      component: "components",
      service: "services",
      hook: "hooks",
      utility: "utils",
    };

    const dirPath = path.join(CONFIG.srcPath, directories[type]);
    await fs.mkdir(dirPath, { recursive: true });

    const fileName = `${name}${extensions[type]}`;
    const filePath = path.join(dirPath, fileName);

    // Vérifier la taille du fichier
    if (result.code.length > CONFIG.maxFileSize) {
      throw new Error(
        `Fichier trop volumineux (${result.code.length} caractères)`,
      );
    }

    await fs.writeFile(filePath, result.code, "utf-8");
    console.log(chalk.gray(`📁 Fichier créé: ${filePath}`));
  }

  /**
   * Log generation results
   */
  async logGeneration(result, success) {
    const logEntry = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      success,
      model: result.model,
      metadata: result.metadata,
      error: result.error,
      attempts: result.attempts,
    };

    this.generationCount++;

    try {
      let logs = [];
      try {
        const data = await fs.readFile(CONFIG.logFile, "utf-8");
        logs = JSON.parse(data);
      } catch {
        logs = [];
      }

      logs.push(logEntry);
      await fs.writeFile(CONFIG.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.warn("⚠️ Impossible d'écrire dans le log");
    }
  }

  /**
   * Show configuration
   */
  async showConfig() {
    console.log("\n⚙️  Configuration actuelle:");
    console.log(chalk.gray("━".repeat(30)));
    console.log(`Modèle Groq: ${chalk.cyan(groqClient.model)}`);
    console.log(`Dossier source: ${chalk.cyan(CONFIG.srcPath)}`);
    console.log(
      `Clé API: ${chalk.cyan(process.env.GROQ_API_KEY ? "✅ Définie" : "❌ Manquante")}`,
    );
    console.log(`Session: ${chalk.cyan(this.sessionId)}`);
    console.log(chalk.gray("━".repeat(30)));
    await this.pause();
  }

  /**
   * Show generation statistics
   */
  async showStats() {
    try {
      const data = await fs.readFile(CONFIG.logFile, "utf-8");
      const logs = JSON.parse(data);

      const successCount = logs.filter((log) => log.success).length;
      const totalCount = logs.length;

      console.log("\n📊 Statistiques de génération:");
      console.log(chalk.gray("━".repeat(40)));
      console.log(`Total générations: ${chalk.cyan(totalCount)}`);
      console.log(`Succès: ${chalk.green(successCount)}`);
      console.log(`Échecs: ${chalk.red(totalCount - successCount)}`);
      console.log(
        `Taux de succès: ${chalk.cyan(((successCount / totalCount) * 100).toFixed(1))}%`,
      );

      if (logs.length > 0) {
        const lastGen = logs[logs.length - 1];
        console.log(`Dernier modèle utilisé: ${chalk.cyan(lastGen.model)}`);
      }
    } catch {
      console.log("\n📊 Aucune donnée statistique disponible");
    }

    await this.pause();
  }

  /**
   * Clean source folder
   */
  async cleanSourceFolder() {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "⚠️  Es-tu sûr de vouloir vider le dossier src/?",
        default: false,
      },
    ]);

    if (confirm) {
      try {
        await fs.rm(CONFIG.srcPath, { recursive: true, force: true });
        await fs.mkdir(CONFIG.srcPath, { recursive: true });
        console.log(chalk.green("✅ Dossier src/ nettoyé avec succès"));
      } catch (error) {
        console.log(chalk.red("❌ Erreur lors du nettoyage"));
      }
    }

    await this.pause();
  }
  /**
   * Attend que l'utilisateur appuie sur Entrée
   */
  async pause() {
    console.log("\n");
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Appuyez sur Entrée pour continuer...",
      },
    ]);
  }
  /**
   * Gère les erreurs fatales
   */
  handleFatalError(error) {
    console.error(chalk.redBright(`\n💥 ERREUR FATALE: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
  /**
   * Quitte l'application proprement
   */
  async exitApp() {
    console.log(
      chalk.blueBright("\n👋 Merci d'avoir utilisé le Dashboard IA !"),
    );
    console.log(
      chalk.gray(`Générations cette session: ${this.generationCount}`),
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(0);
  }
}
// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error(chalk.redBright("\n💥 ERREUR NON GÉRÉE:"), error.message);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(chalk.redBright("\n💥 PROMESSE REJETÉE:"), reason);
  process.exit(1);
});
// Start the application
new DashboardCLI();
