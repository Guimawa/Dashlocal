// ==============================================
// ⚛️ REACT GENERATOR - Générateur React Ultra Instinct
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Générateur intelligent de composants React
// avec hooks, TypeScript, Storybook et tests automatiques
// ==============================================

import fs from "fs/promises";
import path from "path";
import Logger from "../core/logger.js";
import CodeFormatter from "../utils/formatters.js";
import CodeValidator from "../utils/validators.js";

/**
 * Générateur de composants React avec IA
 */
export default class ReactGenerator {
  constructor(groqClient, memorySystem) {
    this.groqClient = groqClient;
    this.memory = memorySystem;
    this.logger = new Logger("ReactGenerator");

    // Templates de base
    this.templates = {
      component: {
        functional: "functional-component.template",
        class: "class-component.template",
        hook: "custom-hook.template",
      },
      styles: {
        css: "component.css.template",
        scss: "component.scss.template",
        styled: "styled-component.template",
        tailwind: "tailwind-component.template",
      },
    };

    // Configuration par défaut
    this.defaultConfig = {
      typescript: false,
      storybook: true,
      tests: true,
      styling: "tailwind",
      hooks: true,
      proptypes: false,
      accessibility: true,
      responsive: true,
    };
  }

  /**
   * Génération principale d'un composant React
   */
  async generateComponent(spec, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(`⚛️ Génération du composant React: ${spec.name}`);

      // Analyse de la spécification avec l'IA
      const analysis = await this.analyzeComponentSpec(spec, config);

      // Recherche de composants similaires en mémoire
      const similarComponents = await this.findSimilarComponents(spec);

      // Génération du code avec l'IA
      const componentCode = await this.generateComponentCode(
        spec,
        analysis,
        config,
      );

      // Validation du code généré
      const validation = await this.validator.validateCode(componentCode);

      // Formatage du code
      const formatResult = await this.formatter.formatCode(componentCode);
      const formattedCode = formatResult.success
        ? formatResult.code
        : componentCode;

      // Génération des fichiers associés
      const files = await this.generateAssociatedFiles(
        spec,
        formattedCode,
        config,
      );

      // Sauvegarde en mémoire
      await this.saveToMemory(spec, formattedCode, analysis, validation);

      const result = {
        success: true,
        component: {
          name: spec.name,
          code: formattedCode,
          files,
          validation,
          analysis,
        },
        metadata: {
          timestamp: Date.now(),
          config,
          similarComponents: similarComponents.length,
        },
      };

      this.logger.info(`✅ Composant ${spec.name} généré avec succès`);

      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur génération composant ${spec.name}:`, error);
      return {
        success: false,
        error: error.message,
        component: null,
      };
    }
  }

  /**
   * Génération d'un hook personnalisé
   */
  async generateHook(spec, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(`🪝 Génération du hook: ${spec.name}`);

      // Analyse de la spécification
      const analysis = await this.analyzeHookSpec(spec, config);

      // Génération du code du hook
      const hookCode = await this.generateHookCode(spec, analysis, config);

      // Validation et formatage
      const validation = await this.validator.validateCode(hookCode);
      const formatResult = await this.formatter.formatCode(hookCode);
      const formattedCode = formatResult.success ? formatResult.code : hookCode;

      // Génération des tests
      const testCode = config.tests
        ? await this.generateHookTests(spec, formattedCode)
        : null;

      // Sauvegarde
      await this.saveToMemory(spec, formattedCode, analysis, validation);

      return {
        success: true,
        hook: {
          name: spec.name,
          code: formattedCode,
          tests: testCode,
          validation,
          analysis,
        },
        metadata: {
          timestamp: Date.now(),
          config,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Erreur génération hook ${spec.name}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Génération d'un contexte React
   */
  async generateContext(spec, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(`🌐 Génération du contexte: ${spec.name}`);

      // Analyse de la spécification
      const analysis = await this.analyzeContextSpec(spec, config);

      // Génération du code du contexte
      const contextCode = await this.generateContextCode(
        spec,
        analysis,
        config,
      );

      // Génération du provider
      const providerCode = await this.generateProviderCode(
        spec,
        analysis,
        config,
      );

      // Génération du hook d'utilisation
      const hookCode = await this.generateContextHookCode(
        spec,
        analysis,
        config,
      );

      // Validation et formatage
      const validation = await this.validator.validateCode(contextCode);
      const formatContext = await this.formatter.formatCode(contextCode);
      const formatProvider = await this.formatter.formatCode(providerCode);
      const formatHook = await this.formatter.formatCode(hookCode);

      const formattedContext = formatContext.success
        ? formatContext.code
        : contextCode;
      const formattedProvider = formatProvider.success
        ? formatProvider.code
        : providerCode;
      const formattedHook = formatHook.success ? formatHook.code : hookCode;

      return {
        success: true,
        context: {
          name: spec.name,
          context: formattedContext,
          provider: formattedProvider,
          hook: formattedHook,
          validation,
          analysis,
        },
        metadata: {
          timestamp: Date.now(),
          config,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Erreur génération contexte ${spec.name}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse de spécification de composant avec l'IA
   */
  async analyzeComponentSpec(spec, config) {
    const prompt = `
Analyse cette spécification de composant React et fournis des insights:

Spécification:
${JSON.stringify(spec, null, 2)}

Configuration:
${JSON.stringify(config, null, 2)}

Analyse et retourne:
- Type de composant recommandé (functional, class)
- Props nécessaires avec leurs types
- État local requis
- Hooks à utiliser
- Patterns React applicables
- Considérations d'accessibilité
- Optimisations possibles
- Complexité estimée (1-10)

Format: JSON structuré
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Analyse de spécification de hook
   */
  async analyzeHookSpec(spec, config) {
    const prompt = `
Analyse cette spécification de hook React personnalisé:

Spécification:
${JSON.stringify(spec, null, 2)}

Analyse et retourne:
- Paramètres d'entrée
- Valeurs de retour
- Hooks React à utiliser
- Gestion des effets de bord
- Optimisations (useMemo, useCallback)
- Cas d'usage typiques
- Complexité estimée

Format: JSON structuré
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Analyse de spécification de contexte
   */
  async analyzeContextSpec(spec, config) {
    const prompt = `
Analyse cette spécification de contexte React:

Spécification:
${JSON.stringify(spec, null, 2)}

Analyse et retourne:
- Structure de l'état global
- Actions disponibles
- Méthodes de mise à jour
- Optimisations de performance
- Patterns de consommation
- Gestion des erreurs

Format: JSON structuré
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Génération du code de composant avec l'IA
   */
  async generateComponentCode(spec, analysis, config) {
    const prompt = `
Génère un composant React moderne et optimisé:

Nom: ${spec.name}
Description: ${spec.description || "Composant React"}
Type: ${analysis.componentType || "functional"}

Spécifications:
${JSON.stringify(spec, null, 2)}

Analyse IA:
${JSON.stringify(analysis, null, 2)}

Configuration:
- TypeScript: ${config.typescript}
- Styling: ${config.styling}
- Accessibilité: ${config.accessibility}
- Responsive: ${config.responsive}

Génère un composant qui:
1. Utilise les hooks modernes appropriés
2. Respecte les bonnes pratiques React
3. Inclut la gestion d'erreurs
4. Est optimisé pour les performances
5. Respecte l'accessibilité
6. Est responsive si demandé
7. Inclut PropTypes ou TypeScript selon config
8. Utilise le système de styling configuré

Retourne uniquement le code du composant.
`;

    const response = await this.groqClient.generateCode(
      {
        type: "component",
        name: spec.name,
        prompt,
      },
      {
        temperature: 0.7,
        maxTokens: 2048,
      },
    );

    return response.code;
  }

  /**
   * Génération du code de hook avec l'IA
   */
  async generateHookCode(spec, analysis, config) {
    const prompt = `
Génère un hook React personnalisé:

Nom: ${spec.name}
Description: ${spec.description || "Hook personnalisé"}

Spécifications:
${JSON.stringify(spec, null, 2)}

Analyse IA:
${JSON.stringify(analysis, null, 2)}

Le hook doit:
1. Commencer par "use" (convention React)
2. Gérer les effets de bord appropriés
3. Inclure le nettoyage nécessaire
4. Être optimisé avec useMemo/useCallback si nécessaire
5. Retourner une interface claire
6. Gérer les cas d'erreur
7. Être réutilisable

TypeScript: ${config.typescript}

Retourne uniquement le code du hook.
`;

    const response = await this.groqClient.generateCode({
      type: "hook",
      name: spec.name,
      prompt,
    });

    return response.code;
  }

  /**
   * Génération du code de contexte
   */
  async generateContextCode(spec, analysis, config) {
    const prompt = `
Génère un contexte React avec son état et ses types:

Nom: ${spec.name}Context
Description: ${spec.description || "Contexte React"}

Spécifications:
${JSON.stringify(spec, null, 2)}

Analyse:
${JSON.stringify(analysis, null, 2)}

Génère:
1. Interface TypeScript pour l'état (si TypeScript activé)
2. Interface pour les actions
3. Création du contexte avec createContext
4. Valeurs par défaut appropriées
5. Types d'export

TypeScript: ${config.typescript}

Retourne uniquement le code du contexte.
`;

    const response = await this.groqClient.generateCode({
      type: "context",
      name: spec.name,
      prompt,
    });

    return response.code;
  }

  /**
   * Génération du code de provider
   */
  async generateProviderCode(spec, analysis, config) {
    const prompt = `
Génère un Provider React pour le contexte ${spec.name}:

Spécifications:
${JSON.stringify(spec, null, 2)}

Le Provider doit:
1. Gérer l'état avec useReducer ou useState
2. Implémenter les actions définies
3. Optimiser les re-renders avec useMemo
4. Gérer les erreurs
5. Fournir une interface claire

TypeScript: ${config.typescript}

Retourne uniquement le code du Provider.
`;

    const response = await this.groqClient.generateCode({
      type: "provider",
      name: `${spec.name}Provider`,
      prompt,
    });

    return response.code;
  }

  /**
   * Génération du hook d'utilisation du contexte
   */
  async generateContextHookCode(spec, analysis, config) {
    const prompt = `
Génère un hook pour utiliser le contexte ${spec.name}:

Le hook doit:
1. S'appeler use${spec.name}
2. Utiliser useContext
3. Vérifier que le contexte est utilisé dans un Provider
4. Retourner l'état et les actions
5. Inclure la gestion d'erreurs

TypeScript: ${config.typescript}

Retourne uniquement le code du hook.
`;

    const response = await this.groqClient.generateCode({
      type: "context-hook",
      name: `use${spec.name}`,
      prompt,
    });

    return response.code;
  }

  /**
   * Génération des fichiers associés
   */
  async generateAssociatedFiles(spec, componentCode, config) {
    const files = {};

    // Fichier de styles
    if (config.styling !== "styled" && config.styling !== "tailwind") {
      files.styles = await this.generateStylesFile(spec, config);
    }

    // Fichier de types TypeScript
    if (config.typescript) {
      files.types = await this.generateTypesFile(spec, componentCode);
    }

    // Fichier d'index pour l'export
    files.index = await this.generateIndexFile(spec);

    return files;
  }

  /**
   * Génération du fichier de styles
   */
  async generateStylesFile(spec, config) {
    const extension = config.styling === "scss" ? "scss" : "css";

    const prompt = `
Génère un fichier de styles ${extension.toUpperCase()} pour le composant ${spec.name}:

Le fichier doit inclure:
1. Styles de base du composant
2. Styles responsive si demandé
3. Variables CSS personnalisées
4. Animations/transitions appropriées
5. Respect des bonnes pratiques CSS

Format: ${extension.toUpperCase()}
Responsive: ${config.responsive}

Retourne uniquement le code CSS/SCSS.
`;

    const response = await this.groqClient.generateCode({
      type: "styles",
      name: `${spec.name}.${extension}`,
      prompt,
    });

    return {
      filename: `${spec.name}.${extension}`,
      content: response.code,
    };
  }

  /**
   * Génération du fichier de types
   */
  async generateTypesFile(spec, componentCode) {
    const prompt = `
Génère un fichier de types TypeScript pour le composant ${spec.name}:

Code du composant:
${componentCode}

Génère:
1. Interface pour les props
2. Types pour l'état local si applicable
3. Types pour les callbacks
4. Types utilitaires si nécessaire
5. Exports appropriés

Retourne uniquement les définitions de types.
`;

    const response = await this.groqClient.generateCode({
      type: "types",
      name: `${spec.name}.types.ts`,
      prompt,
    });

    return {
      filename: `${spec.name}.types.ts`,
      content: response.code,
    };
  }

  /**
   * Génération du fichier d'index
   */
  async generateIndexFile(spec) {
    const content = `export { default } from './${spec.name}';
export * from './${spec.name}';
`;

    return {
      filename: "index.js",
      content,
    };
  }

  /**
   * Génération des tests de hook
   */
  async generateHookTests(spec, hookCode) {
    const prompt = `
Génère des tests Jest + React Testing Library pour ce hook:

Code du hook:
${hookCode}

Les tests doivent couvrir:
1. Comportement initial
2. Mise à jour de l'état
3. Effets de bord
4. Nettoyage
5. Cas d'erreur
6. Cas limites

Utilise @testing-library/react-hooks pour les tests de hooks.

Retourne uniquement le code des tests.
`;

    const response = await this.groqClient.generateCode({
      type: "test",
      name: `${spec.name}.test.js`,
      prompt,
    });

    return response.code;
  }

  /**
   * Recherche de composants similaires
   */
  async findSimilarComponents(spec) {
    if (!this.memory.isInitialized) {
      return [];
    }

    const similar = await this.memory.findSimilar({
      type: "component",
      name: spec.name,
      description: spec.description,
      domain: "react",
    });

    return similar;
  }

  /**
   * Sauvegarde en mémoire
   */
  async saveToMemory(spec, code, analysis, validation) {
    if (!this.memory.isInitialized) {
      return;
    }

    await this.memory.recordGeneration({
      type: "component",
      name: spec.name,
      code,
      analysis,
      validation,
      domain: "react",
      timestamp: Date.now(),
      success: validation.isValid,
      quality: validation.score / 100,
    });
  }

  /**
   * Écriture des fichiers sur le disque
   */
  async writeFiles(componentResult, outputDir) {
    try {
      // Création du répertoire du composant
      const componentDir = path.join(outputDir, componentResult.component.name);
      await fs.mkdir(componentDir, { recursive: true });

      // Écriture du fichier principal
      const mainFile = componentResult.component.name + ".jsx";
      await fs.writeFile(
        path.join(componentDir, mainFile),
        componentResult.component.code,
      );

      // Écriture des fichiers associés
      for (const [type, file] of Object.entries(
        componentResult.component.files,
      )) {
        if (file && file.content) {
          await fs.writeFile(
            path.join(componentDir, file.filename),
            file.content,
          );
        }
      }

      this.logger.info(`📁 Fichiers écrits dans: ${componentDir}`);

      return {
        success: true,
        path: componentDir,
        files: [
          mainFile,
          ...Object.values(componentResult.component.files).map(
            (f) => f.filename,
          ),
        ],
      };
    } catch (error) {
      this.logger.error("❌ Erreur écriture fichiers:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtention des statistiques du générateur
   */
  async getStats() {
    if (!this.memory.isInitialized) {
      return { components: 0, hooks: 0, contexts: 0 };
    }

    const stats = await this.memory.getStats();
    const reactGenerations = await this.memory.search("", {
      type: "generation",
      tags: ["react"],
    });

    return {
      totalGenerations: reactGenerations.length,
      components: reactGenerations.filter((g) => g.data.type === "component")
        .length,
      hooks: reactGenerations.filter((g) => g.data.type === "hook").length,
      contexts: reactGenerations.filter((g) => g.data.type === "context")
        .length,
      averageQuality:
        reactGenerations.reduce((sum, g) => sum + (g.data.quality || 0), 0) /
          reactGenerations.length || 0,
    };
  }
}
