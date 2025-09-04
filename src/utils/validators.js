// src/utils/validators.js
import { parse } from "@babel/parser";
import { readFile } from "fs/promises";
import { join } from "path";

class CodeValidator {
  constructor() {
    this.rules = {
      complexity: {
        maxCyclomatic: 10,
        maxLines: 100,
        maxDepth: 4,
      },
      security: {
        disallowedPatterns: [
          /eval\(/,
          /Function\(/,
          /\.innerHTML\s*=/,
          /\.outerHTML\s*=/,
          /document\.write/,
          /setTimeout\(.*\)/,
          /setInterval\(.*\)/,
        ],
      },
      quality: {
        requireComments: true,
        minCommentRatio: 0.1,
        disallowedPatterns: [/console\.log/, /debugger/, /alert\(/],
      },
    };
  }

  /**
   * Valide la syntaxe JavaScript/TypeScript
   */
  validateSyntax(code, filename = "unknown.js") {
    try {
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx", "decorators", "classProperties"],
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
      });

      return {
        valid: true,
        ast: ast,
        errors: [],
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            line: error.loc?.line,
            column: error.loc?.column,
            message: error.message,
            severity: "error",
          },
        ],
      };
    }
  }

  /**
   * Analyse la complexité cognitive
   */
  analyzeComplexity(code) {
    const lines = code.split("\n");
    const issues = [];

    // Analyse basique de complexité
    const cyclomatic = this.calculateCyclomaticComplexity(code);
    if (cyclomatic > this.rules.complexity.maxCyclomatic) {
      issues.push({
        type: "complexity",
        message: `Complexité cyclomatique élevée: ${cyclomatic} (max: ${this.rules.complexity.maxCyclomatic})`,
        severity: "warning",
      });
    }

    if (lines.length > this.rules.complexity.maxLines) {
      issues.push({
        type: "size",
        message: `Fichier trop long: ${lines.length} lignes (max: ${this.rules.complexity.maxLines})`,
        severity: "warning",
      });
    }

    // Détection de patterns complexes
    const nestedDepth = this.calculateNestedDepth(code);
    if (nestedDepth > this.rules.complexity.maxDepth) {
      issues.push({
        type: "nesting",
        message: `Nesting trop profond: ${nestedDepth} niveaux (max: ${this.rules.complexity.maxDepth})`,
        severity: "warning",
      });
    }

    return {
      score: Math.max(0, 100 - (cyclomatic * 2 + nestedDepth * 5)),
      issues,
      metrics: {
        lines: lines.length,
        cyclomaticComplexity: cyclomatic,
        nestedDepth: nestedDepth,
      },
    };
  }

  /**
   * Calcule la complexité cyclomatique
   */
  calculateCyclomaticComplexity(code) {
    const patterns = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s*:/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g, // Ternary operator
      /&&/g,
      /\|\|/g,
    ];

    let complexity = 1; // Base complexity
    patterns.forEach((pattern) => {
      const matches = code.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  /**
   * Calcule la profondeur d'imbrication
   */
  calculateNestedDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    const stack = [];

    const tokens = code.split(/([{}()\[\]])/);

    for (const token of tokens) {
      if (["{", "(", "["].includes(token)) {
        stack.push(token);
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (["}", ")", "]"].includes(token)) {
        if (stack.length > 0) {
          stack.pop();
          currentDepth--;
        }
      }
    }

    return maxDepth;
  }

  /**
   * Vérifie la sécurité du code
   */
  checkSecurity(code) {
    const issues = [];

    this.rules.security.disallowedPatterns.forEach((pattern, index) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: "security",
          message: `Pattern de sécurité détecté: ${pattern.toString()}`,
          severity: "high",
          pattern: pattern.toString(),
        });
      }
    });

    return issues;
  }

  /**
   * Vérifie la qualité du code
   */
  checkQuality(code) {
    const issues = [];
    const lines = code.split("\n");

    // Vérification des commentaires
    const commentLines = lines.filter(
      (line) =>
        line.trim().startsWith("//") ||
        line.trim().startsWith("/*") ||
        line.trim().includes("/**"),
    ).length;

    const commentRatio = commentLines / lines.length;
    if (commentRatio < this.rules.quality.minCommentRatio) {
      issues.push({
        type: "documentation",
        message: `Ratio de commentaires faible: ${(commentRatio * 100).toFixed(1)}% (min: ${this.rules.quality.minCommentRatio * 100}%)`,
        severity: "info",
      });
    }

    // Vérification des patterns indésirables
    this.rules.quality.disallowedPatterns.forEach((pattern) => {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: "quality",
          message: `Pattern de développement détecté: ${pattern.toString()}`,
          severity: "low",
          pattern: pattern.toString(),
        });
      }
    });

    return {
      issues,
      metrics: {
        totalLines: lines.length,
        commentLines: commentLines,
        commentRatio: commentRatio,
      },
    };
  }

  /**
   * Validation complète du code
   */
  async validateCode(code, context = {}) {
    const syntaxResult = this.validateSyntax(code);

    if (!syntaxResult.valid) {
      return {
        valid: false,
        severity: "error",
        issues: syntaxResult.errors,
        metrics: null,
      };
    }

    const complexity = this.analyzeComplexity(code);
    const securityIssues = this.checkSecurity(code);
    const qualityResult = this.checkQuality(code);

    const allIssues = [
      ...complexity.issues,
      ...securityIssues,
      ...qualityResult.issues,
    ];

    const hasErrors = allIssues.some((issue) => issue.severity === "error");
    const hasWarnings = allIssues.some((issue) => issue.severity === "warning");

    return {
      valid: !hasErrors,
      severity: hasErrors ? "error" : hasWarnings ? "warning" : "info",
      issues: allIssues,
      metrics: {
        ...complexity.metrics,
        ...qualityResult.metrics,
        complexityScore: complexity.score,
      },
      suggestions: this.generateSuggestions(allIssues),
    };
  }

  /**
   * Génère des suggestions d'amélioration
   */
  generateSuggestions(issues) {
    return issues.map((issue) => {
      switch (issue.type) {
        case "complexity":
          return "Considérez de diviser cette fonction en plusieurs fonctions plus petites";
        case "security":
          return "Évitez les patterns potentiellement dangereux pour la sécurité";
        case "documentation":
          return "Ajoutez plus de commentaires pour améliorer la maintenabilité";
        default:
          return "Revoyez cette partie du code pour l'améliorer";
      }
    });
  }

  /**
   * Valide un fichier existant
   */
  async validateFile(filepath) {
    try {
      const code = await readFile(filepath, "utf8");
      return await this.validateCode(code, { filepath });
    } catch (error) {
      return {
        valid: false,
        severity: "error",
        issues: [
          {
            message: `Impossible de lire le fichier: ${error.message}`,
            severity: "error",
          },
        ],
        metrics: null,
      };
    }
  }
}

export default CodeValidator;
