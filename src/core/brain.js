// src/core/brain.js
import { getGroqClient } from "../utils/groq-client.js";
import CodeValidator from "../utils/validators.js";
import CodeFormatter from "../utils/formatters.js";
import MemorySystem from "./memory.js";
import LearningSystem from "./learning.js";

class JarvisBrain {
  constructor() {
    this.memory = new MemorySystem();
    this.learning = new LearningSystem();
    this.groqClient = getGroqClient();
    this.validator = new CodeValidator();
    this.formatter = new CodeFormatter();
    this.currentContext = {};
    this.projectState = {};
    this.isInitialized = false;
  }

  /**
   * Processus principal de génération de code
   * @param {string} prompt - La demande utilisateur
   * @param {Object} context - Le contexte du projet
   * @returns {Promise<Object>} - Le résultat de la génération
   */
  async processRequest(prompt, context = {}) {
    try {
      // 1. Étape d'écoute et compréhension
      const analyzedReq = await this.understandRequest(prompt, context);

      // 2. Contextualisation avec le projet existant
      await this.loadProjectContext(analyzedReq);

      // 3. Prise de décision sur ce qui doit être généré
      const generationPlan = this.decideGenerationStrategy(analyzedReq);

      // 4. Exécution de la génération
      const generationResults = await this.executeGeneration(generationPlan);

      // 5. Validation de la qualité
      const validatedResults = await this.validateOutput(generationResults);

      // 6. Intégration au projet
      const integrationResult = await this.integrateToProject(validatedResults);

      // 7. Documentation et apprentissage
      await this.documentAndLearn(integrationResult, prompt);

      return {
        success: true,
        results: integrationResult,
        message: "Génération terminée avec succès",
      };
    } catch (error) {
      await this.handleError(error, prompt, context);
      throw error;
    }
  }

  /**
   * Comprendre la demande utilisateur avec Groq
   */
  async understandRequest(prompt, context) {
    console.log("🧠 Analyse de la demande...");

    // Optimiser la prompt basée sur l'apprentissage
    const optimizedPrompt = await this.learning.optimizePrompt(prompt);

    const analysis = await this.analyzeRequirements(optimizedPrompt, context);

    // Enrichir avec le contexte de mémoire
    const enrichedAnalysis =
      await this.memory.enrichWithPastGenerations(analysis);

    this.currentContext = {
      prompt: optimizedPrompt, // ← Correction : ajout de la virgule
      originalPrompt: prompt, // Garder la originale pour référence
      analysis: enrichedAnalysis,
      timestamp: new Date().toISOString(),
    };

    return enrichedAnalysis;
  }

  /**
   * Charger le contexte du projet existant
   */
  async loadProjectContext(analysis) {
    console.log("📁 Chargement du contexte projet...");

    const { projectType, techStack } = analysis;

    // Charger l'état actuel du projet (structure, composants existants, etc.)
    this.projectState = await this.memory.getProjectState(
      projectType,
      techStack,
    );

    // Vérifier les dépendances et compatibilités
    this.projectState.dependencies = await this.checkDependencies(analysis);

    return this.projectState;
  }

  /**
   * Décider de la stratégie de génération
   */
  decideGenerationStrategy(analysis) {
    console.log("🎯 Planification de la génération...");

    const { components, tests, stories, apis } = analysis;

    const strategy = {
      components: [],
      tests: [],
      stories: [],
      apis: [],
      priority: "medium",
      estimatedTime: 0,
    };

    // Déterminer quels générateurs utiliser en fonction de l'analyse
    if (components && components.length > 0) {
      strategy.components = this.prioritizeComponents(components);
      strategy.estimatedTime += components.length * 2; // 2min par composant
    }

    if (tests && tests.length > 0) {
      strategy.tests = tests;
      strategy.estimatedTime += tests.length * 1; // 1min par test
    }

    if (stories && stories.length > 0) {
      strategy.stories = stories;
      strategy.estimatedTime += stories.length * 1.5; // 1.5min par story
    }

    if (apis && apis.length > 0) {
      strategy.apis = apis;
      strategy.estimatedTime += apis.length * 3; // 3min par API
    }

    // Ajuster la priorité en fonction de la complexité
    strategy.priority = strategy.estimatedTime > 10 ? "high" : "medium";

    return strategy;
  }

  /**
   * Exécuter la génération selon le plan
   */
  async executeGeneration(generationPlan) {
    console.log("⚡ Exécution de la génération...");

    const results = {
      components: [],
      tests: [],
      stories: [],
      apis: [],
      errors: [],
    };

    // Générer les composants React
    if (generationPlan.components.length > 0) {
      try {
        const { default: ReactGenerator } = await import(
          "../generators/react-gen.js"
        );
        const reactGen = new ReactGenerator();
        for (const component of generationPlan.components) {
          try {
            const componentCode = await reactGen.generateComponent(
              component,
              this.projectState,
            );
            results.components.push({
              name: component.name,
              code: componentCode,
              path: component.path,
            });
          } catch (error) {
            results.errors.push(
              `Composant ${component.name}: ${error.message}`,
            );
          }
        }
      } catch (error) {
        results.errors.push(`Erreur import ReactGenerator: ${error.message}`);
      }
    }

    // Générer les tests (similaire pattern pour les autres générateurs)
    // ... code pour tests, stories, APIs

    return results;
  }

  /**
   * Valider la qualité du code généré
   */
  async validateOutput(generationResults) {
    console.log("✅ Validation de la qualité...");

    const validatedResults = {
      components: [],
      tests: [],
      stories: [],
      apis: [],
      warnings: [],
    };

    // Valider chaque composant généré
    for (const component of generationResults.components) {
      const validation = await this.validator.validateCode(component.code);
      if (validation.valid) {
        const formatResult = await this.formatter.formatCode(component.code);
        validatedResults.components.push({
          ...component,
          code: formatResult.success ? formatResult.code : component.code,
        });
      } else {
        validatedResults.warnings.push({
          type: "component",
          name: component.name,
          issues: validation.issues,
        });
      }
    }

    // Valider les autres éléments (tests, stories, APIs)
    // ...

    return validatedResults;
  }

  /**
   * Intégrer les éléments générés au projet
   */
  async integrateToProject(validatedResults) {
    console.log("🔗 Intégration au projet...");

    const integrationResult = {
      added: [],
      updated: [],
      skipped: [],
    };

    // Intégrer les composants
    for (const component of validatedResults.components) {
      try {
        const filePath = await this.writeToProject(
          component.path,
          component.code,
        );
        integrationResult.added.push(filePath);

        // Mettre à jour l'index barrel si nécessaire
        await this.updateBarrelExports(component);
      } catch (error) {
        integrationResult.skipped.push({
          path: component.path,
          reason: error.message,
        });
      }
    }

    // Mettre à jour package.json si nouvelles dépendances
    if (this.projectState.newDependencies) {
      await this.updatePackageJson(this.projectState.newDependencies);
    }

    return integrationResult;
  }

  /**
   * Documenter et apprendre de cette génération
   */
  async documentAndLearn(integrationResult, originalPrompt) {
    console.log("📚 Documentation et apprentissage...");

    // Sauvegarder dans la mémoire
    await this.memory.saveGeneration({
      prompt: originalPrompt,
      context: this.currentContext,
      results: integrationResult,
      timestamp: new Date().toISOString(),
    });

    // Mettre à jour le modèle d'apprentissage
    await this.learning.recordGenerationResult(
      originalPrompt,
      integrationResult,
    );

    // Générer la documentation si nécessaire
    if (integrationResult.added.length > 0) {
      await this.generateDocumentation(integrationResult);
    }
  }

  /**
   * Gérer les erreurs et apprendre d'elles
   */
  async handleError(error, prompt, context) {
    console.error("❌ Erreur traitée par le cerveau:", error.message);

    // Enregistrer l'erreur pour apprentissage futur
    await this.learning.recordError({
      error: error.message,
      prompt,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Tentative de récupération ou suggestion d'alternative
    return await this.attemptRecovery(error, prompt);
  }

  /**
   * Analyse des exigences avec l'IA
   */
  async analyzeRequirements(prompt, context) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "Tu es un expert en analyse de spécifications techniques. Analyse cette demande et retourne une structure JSON détaillée.",
        },
        {
          role: "user",
          content: `Analyse cette demande de génération de code: ${prompt}\n\nContexte: ${JSON.stringify(context, null, 2)}`,
        },
      ];

      const response = await this.groqClient.sendRequest(messages);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No analysis generated");
      }

      // Essayer de parser le JSON, sinon retourner une structure par défaut
      try {
        return JSON.parse(content);
      } catch {
        return {
          type: "component",
          complexity: "medium",
          domain: "react",
          confidence: 0.7,
          components: [{ name: "Component", type: "functional" }],
          tests: [],
          stories: [],
          apis: [],
        };
      }
    } catch (error) {
      console.warn(
        "Erreur analyse IA, utilisation de l'analyse par défaut:",
        error.message,
      );
      return {
        type: "component",
        complexity: "medium",
        domain: "react",
        confidence: 0.5,
        components: [{ name: "Component", type: "functional" }],
        tests: [],
        stories: [],
        apis: [],
      };
    }
  }

  /**
   * Méthodes helper (implémentations simplifiées)
   */
  prioritizeComponents(components) {
    // Logique de priorisation basée sur l'analyse
    return components.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async checkDependencies(analysis) {
    // Vérifier les dépendances nécessaires
    const requiredDeps = analysis.requiredDependencies || [];
    const missingDeps = [];

    for (const dep of requiredDeps) {
      const isInstalled = await this.memory.checkDependency(dep);
      if (!isInstalled) missingDeps.push(dep);
    }

    return { required: requiredDeps, missing: missingDeps };
  }

  async writeToProject(path, content) {
    // Écrire le fichier dans le projet (implémentation réelle)
    const fs = require("fs").promises;
    const fullPath = `projects/${path}`;

    // Assurer que le dossier existe
    await fs.mkdir(fullPath.split("/").slice(0, -1).join("/"), {
      recursive: true,
    });
    await fs.writeFile(fullPath, content);

    return fullPath;
  }

  async attemptRecovery(error, prompt) {
    // Stratégies de récupération basiques
    const recoveryStrategies = {
      timeout: "Réessayer avec un timeout plus long",
      memory: "Nettoyer la mémoire et réessayer",
      api: "Utiliser une alternative à Groq",
    };

    let strategy = "Analyse de l'erreur en cours...";
    if (error.message.includes("timeout")) {
      strategy = recoveryStrategies["timeout"];
    } else if (error.message.includes("memory")) {
      strategy = recoveryStrategies["memory"];
    } else if (
      error.message.includes("api") ||
      error.message.includes("Groq")
    ) {
      strategy = recoveryStrategies["api"];
    }

    console.log("⚠️ Tentative de récupération:", strategy);
    // Exemple d'action selon la stratégie
    switch (strategy) {
      case recoveryStrategies["timeout"]:
        // Ici, on pourrait relancer la requête avec un timeout augmenté
        // return await retryWithLongerTimeout(prompt);
        break;
      case recoveryStrategies["memory"]:
        // Ici, on pourrait nettoyer la mémoire ou réinitialiser des variables
        // await cleanMemory();
        break;
      case recoveryStrategies["api"]:
        // Ici, on pourrait basculer vers une autre API
        // return await useAlternativeApi(prompt);
        break;
      default:
        // Log de l'erreur et retour
        console.error("Erreur non reconnue:", error);
    }
    // Retourne une indication de la stratégie utilisée
    return strategy;
  }

  async updateBarrelExports(component) {
    // Implémentation simplifiée
    console.log("📦 Mise à jour des exports barrel pour", component.name);
  }

  async updatePackageJson(dependencies) {
    // Implémentation simplifiée
    console.log("📝 Mise à jour package.json avec", dependencies);
  }

  async generateDocumentation(results) {
    // Implémentation simplifiée
    console.log(
      "📚 Génération documentation pour",
      results.added.length,
      "fichiers",
    );
  }
}

export default JarvisBrain;
