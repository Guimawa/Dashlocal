// ==============================================
// 📚 STORYBOOK GENERATOR - Générateur Storybook Ultra Instinct
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Générateur intelligent de stories Storybook
// avec controls, actions, docs et variantes automatiques
// ==============================================

import fs from "fs/promises";
import path from "path";
import Logger from "../core/logger.js";
import CodeFormatter from "../utils/formatters.js";

/**
 * Générateur de stories Storybook avec IA
 */
export default class StorybookGenerator {
  constructor(groqClient, memorySystem) {
    this.groqClient = groqClient;
    this.memory = memorySystem;
    this.logger = new Logger("StorybookGenerator");

    // Configuration par défaut
    this.defaultConfig = {
      version: "7.0", // Version de Storybook
      addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-controls",
        "@storybook/addon-actions",
        "@storybook/addon-docs",
        "@storybook/addon-a11y",
      ],
      generateVariants: true,
      generateDocs: true,
      generateControls: true,
      generateActions: true,
      includeAccessibility: true,
    };

    // Templates de stories
    this.storyTemplates = {
      basic: "basic-story.template",
      advanced: "advanced-story.template",
      interactive: "interactive-story.template",
    };
  }

  /**
   * Génération principale d'une story Storybook
   */
  async generateStory(componentSpec, componentCode, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(
        `📚 Génération de la story Storybook: ${componentSpec.name}`,
      );

      // Analyse du composant pour extraire les props
      const componentAnalysis = await this.analyzeComponent(
        componentCode,
        componentSpec,
      );

      // Génération des variantes de story
      const variants = config.generateVariants
        ? await this.generateStoryVariants(componentSpec, componentAnalysis)
        : ["Default"];

      // Génération du code de la story
      const storyCode = await this.generateStoryCode(
        componentSpec,
        componentAnalysis,
        variants,
        config,
      );

      // Formatage du code
      const formattedCode = await formatCode(storyCode, "javascript");

      // Génération de la documentation
      const docs = config.generateDocs
        ? await this.generateStoryDocs(componentSpec, componentAnalysis)
        : null;

      // Sauvegarde en mémoire
      await this.saveToMemory(componentSpec, formattedCode, componentAnalysis);

      const result = {
        success: true,
        story: {
          name: componentSpec.name,
          code: formattedCode,
          variants,
          docs,
          analysis: componentAnalysis,
        },
        metadata: {
          timestamp: Date.now(),
          config,
          addons: config.addons,
        },
      };

      this.logger.info(`✅ Story ${componentSpec.name} générée avec succès`);

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Erreur génération story ${componentSpec.name}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        story: null,
      };
    }
  }

  /**
   * Génération de configuration Storybook
   */
  async generateStorybookConfig(projectPath, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info("⚙️ Génération de la configuration Storybook...");

      // Génération du fichier main.js
      const mainConfig = await this.generateMainConfig(config);

      // Génération du fichier preview.js
      const previewConfig = await this.generatePreviewConfig(config);

      // Génération du fichier manager.js (optionnel)
      const managerConfig = await this.generateManagerConfig(config);

      // Écriture des fichiers de configuration
      const storybookDir = path.join(projectPath, ".storybook");
      await fs.mkdir(storybookDir, { recursive: true });

      await fs.writeFile(path.join(storybookDir, "main.js"), mainConfig);
      await fs.writeFile(path.join(storybookDir, "preview.js"), previewConfig);

      if (managerConfig) {
        await fs.writeFile(
          path.join(storybookDir, "manager.js"),
          managerConfig,
        );
      }

      this.logger.info("✅ Configuration Storybook générée");

      return {
        success: true,
        configPath: storybookDir,
        files: [
          "main.js",
          "preview.js",
          managerConfig ? "manager.js" : null,
        ].filter(Boolean),
      };
    } catch (error) {
      this.logger.error("❌ Erreur génération config Storybook:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse du composant pour extraire les informations
   */
  async analyzeComponent(componentCode, componentSpec) {
    const prompt = `
Analyse ce composant React pour générer une story Storybook optimale:

Code du composant:
${componentCode}

Spécification:
${JSON.stringify(componentSpec, null, 2)}

Extrais et analyse:
1. Props du composant avec leurs types et valeurs par défaut
2. Événements/callbacks disponibles
3. États internes observables
4. Variantes visuelles possibles
5. Cas d'usage typiques
6. Considérations d'accessibilité
7. Dépendances externes
8. Exemples de données de test

Retourne un JSON structuré avec ces informations.
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Génération des variantes de story
   */
  async generateStoryVariants(componentSpec, analysis) {
    const prompt = `
Génère des variantes de story Storybook pour ce composant:

Composant: ${componentSpec.name}
Analyse: ${JSON.stringify(analysis, null, 2)}

Génère des variantes qui montrent:
1. État par défaut
2. États avec différentes props
3. États d'interaction (hover, focus, active)
4. États d'erreur ou de chargement
5. Variantes de taille/responsive
6. Variantes de thème (si applicable)
7. Cas limites

Retourne un tableau de noms de variantes descriptifs.
`;

    const response = await this.groqClient.generateCode({
      type: "story-variants",
      name: `${componentSpec.name}Variants`,
      prompt,
    });

    try {
      return JSON.parse(response.code);
    } catch {
      return ["Default", "WithProps", "Interactive", "Loading", "Error"];
    }
  }

  /**
   * Génération du code de la story
   */
  async generateStoryCode(componentSpec, analysis, variants, config) {
    const prompt = `
Génère une story Storybook complète pour ce composant React:

Composant: ${componentSpec.name}
Analyse: ${JSON.stringify(analysis, null, 2)}
Variantes: ${JSON.stringify(variants)}

Configuration Storybook:
- Version: ${config.version}
- Controls: ${config.generateControls}
- Actions: ${config.generateActions}
- Docs: ${config.generateDocs}
- A11y: ${config.includeAccessibility}

La story doit inclure:
1. Import du composant
2. Export par défaut avec metadata
3. Template de base réutilisable
4. Toutes les variantes demandées
5. Controls configurés pour les props
6. Actions pour les événements
7. Documentation inline si demandée
8. Paramètres d'accessibilité
9. Decorators si nécessaires

Utilise la syntaxe Storybook ${config.version} (Component Story Format 3.0).

Retourne uniquement le code de la story.
`;

    const response = await this.groqClient.generateCode(
      {
        type: "storybook-story",
        name: `${componentSpec.name}.stories.js`,
        prompt,
      },
      {
        temperature: 0.6,
        maxTokens: 2048,
      },
    );

    return response.code;
  }

  /**
   * Génération de la documentation de story
   */
  async generateStoryDocs(componentSpec, analysis) {
    const prompt = `
Génère une documentation MDX pour la story Storybook:

Composant: ${componentSpec.name}
Analyse: ${JSON.stringify(analysis, null, 2)}

La documentation doit inclure:
1. Description du composant
2. Cas d'usage principaux
3. Guide des props avec exemples
4. Exemples d'intégration
5. Bonnes pratiques
6. Considérations d'accessibilité
7. Notes de design

Format: MDX (Markdown + JSX)

Retourne uniquement le contenu MDX.
`;

    const response = await this.groqClient.generateCode({
      type: "storybook-docs",
      name: `${componentSpec.name}.stories.mdx`,
      prompt,
    });

    return response.code;
  }

  /**
   * Génération du fichier main.js
   */
  async generateMainConfig(config) {
    const mainConfig = `
module.exports = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    ${config.addons.map((addon) => `'${addon}'`).join(",\n    ")}
  ],
  
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  
  features: {
    storyStoreV7: true,
    buildStoriesJson: true
  },
  
  docs: {
    autodocs: ${config.generateDocs ? "true" : "false"}
  },
  
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  
  viteFinal: async (config) => {
    // Personnalisations Vite si nécessaires
    return config;
  }
};
`;

    return await formatCode(mainConfig, "javascript");
  }

  /**
   * Génération du fichier preview.js
   */
  async generatePreviewConfig(config) {
    const previewConfig = `
import { configure } from '@storybook/react';

// Configuration globale des paramètres
export const parameters = {
  actions: { 
    argTypesRegex: '^on[A-Z].*' 
  },
  
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
    sort: 'requiredFirst'
  },
  
  docs: {
    extractComponentDescription: (component, { notes }) => {
      if (notes) {
        return typeof notes === 'string' ? notes : notes.markdown || notes.text;
      }
      return null;
    },
  },
  
  ${
    config.includeAccessibility
      ? `
  a11y: {
    element: '#root',
    config: {},
    options: {},
    manual: true,
  },
  `
      : ""
  }
  
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#333333',
      },
      {
        name: 'gray',
        value: '#f5f5f5',
      },
    ],
  },
  
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1200px',
          height: '800px',
        },
      },
    },
  },
};

// Decorators globaux
export const decorators = [
  (Story) => (
    <div style={{ padding: '1rem' }}>
      <Story />
    </div>
  ),
];

// Configuration des types d'arguments globaux
export const argTypes = {
  // Configuration globale des controls
};
`;

    return await formatCode(previewConfig, "javascript");
  }

  /**
   * Génération du fichier manager.js (optionnel)
   */
  async generateManagerConfig(config) {
    if (!config.customManager) return null;

    const managerConfig = `
import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: themes.light,
  panelPosition: 'bottom',
  selectedPanel: 'controls',
  showNav: true,
  showPanel: true,
  showToolbar: true,
});
`;

    return await formatCode(managerConfig, "javascript");
  }

  /**
   * Génération de stories pour plusieurs composants
   */
  async generateMultipleStories(components, options = {}) {
    const results = [];

    for (const component of components) {
      try {
        const result = await this.generateStory(
          component.spec,
          component.code,
          options,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(
          `❌ Erreur génération story ${component.spec.name}:`,
          error,
        );
        results.push({
          success: false,
          error: error.message,
          component: component.spec.name,
        });
      }
    }

    return results;
  }

  /**
   * Génération d'une story interactive avec contrôles avancés
   */
  async generateInteractiveStory(
    componentSpec,
    componentCode,
    interactions,
    options = {},
  ) {
    const prompt = `
Génère une story Storybook interactive avec des contrôles avancés:

Composant: ${componentSpec.name}
Code: ${componentCode}
Interactions: ${JSON.stringify(interactions, null, 2)}

La story doit inclure:
1. Contrôles interactifs pour toutes les props
2. Actions pour tous les événements
3. Simulation d'interactions utilisateur
4. Tests d'accessibilité intégrés
5. Variantes d'état dynamiques
6. Playground interactif

Utilise @storybook/addon-interactions pour les tests d'interaction.

Retourne uniquement le code de la story interactive.
`;

    const response = await this.groqClient.generateCode({
      type: "interactive-story",
      name: `${componentSpec.name}.interactive.stories.js`,
      prompt,
    });

    return response.code;
  }

  /**
   * Sauvegarde en mémoire
   */
  async saveToMemory(componentSpec, storyCode, analysis) {
    if (!this.memory.isInitialized) {
      return;
    }

    await this.memory.recordGeneration({
      type: "storybook-story",
      name: componentSpec.name,
      code: storyCode,
      analysis,
      domain: "storybook",
      timestamp: Date.now(),
      success: true,
      quality: 0.9, // Les stories sont généralement de bonne qualité
    });
  }

  /**
   * Écriture des fichiers de story
   */
  async writeStoryFiles(storyResult, outputDir) {
    try {
      // Création du répertoire des stories
      const storiesDir = path.join(outputDir, "stories");
      await fs.mkdir(storiesDir, { recursive: true });

      // Écriture du fichier de story principal
      const storyFile = `${storyResult.story.name}.stories.js`;
      await fs.writeFile(
        path.join(storiesDir, storyFile),
        storyResult.story.code,
      );

      // Écriture de la documentation si présente
      if (storyResult.story.docs) {
        const docsFile = `${storyResult.story.name}.stories.mdx`;
        await fs.writeFile(
          path.join(storiesDir, docsFile),
          storyResult.story.docs,
        );
      }

      this.logger.info(`📁 Stories écrites dans: ${storiesDir}`);

      return {
        success: true,
        path: storiesDir,
        files: [
          storyFile,
          storyResult.story.docs
            ? `${storyResult.story.name}.stories.mdx`
            : null,
        ].filter(Boolean),
      };
    } catch (error) {
      this.logger.error("❌ Erreur écriture stories:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validation d'une story Storybook
   */
  async validateStory(storyCode) {
    // Vérifications basiques de la structure Storybook
    const checks = [
      {
        test: /export default.*{/,
        message: "Export par défaut avec metadata présent",
      },
      {
        test: /export const \w+/,
        message: "Au moins une story exportée",
      },
      {
        test: /args:|argTypes:/,
        message: "Configuration des arguments présente",
      },
    ];

    const issues = [];

    for (const check of checks) {
      if (!check.test.test(storyCode)) {
        issues.push({
          type: "warning",
          message: `Manquant: ${check.message}`,
        });
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - issues.length * 20),
    };
  }

  /**
   * Obtention des statistiques du générateur
   */
  async getStats() {
    if (!this.memory.isInitialized) {
      return { stories: 0, components: 0 };
    }

    const storybookGenerations = await this.memory.search("", {
      type: "generation",
      tags: ["storybook"],
    });

    return {
      totalStories: storybookGenerations.length,
      componentsWithStories: new Set(
        storybookGenerations.map((g) => g.data.name),
      ).size,
      averageQuality:
        storybookGenerations.reduce(
          (sum, g) => sum + (g.data.quality || 0),
          0,
        ) / storybookGenerations.length || 0,
    };
  }
}
