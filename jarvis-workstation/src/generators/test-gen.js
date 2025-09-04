// ==============================================
// 🧪 TEST GENERATOR - Générateur de Tests Ultra Instinct
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Générateur intelligent de tests Jest + React Testing Library
// avec couverture complète, tests d'accessibilité et mocking automatique
// ==============================================

import fs from "fs/promises";
import path from "path";
import Logger from "../core/logger.js";
import CodeFormatter from "../utils/formatters.js";

/**
 * Générateur de tests avec IA
 */
export default class TestGenerator {
  constructor(groqClient, memorySystem) {
    this.groqClient = groqClient;
    this.memory = memorySystem;
    this.logger = new Logger("TestGenerator");

    // Configuration par défaut
    this.defaultConfig = {
      framework: "jest", // jest, vitest
      testingLibrary: "@testing-library/react",
      coverage: true,
      accessibility: true,
      integration: true,
      e2e: false,
      mocking: true,
      snapshots: false,
      performance: false,
    };

    // Types de tests supportés
    this.testTypes = {
      unit: "Tests unitaires",
      integration: "Tests d'intégration",
      accessibility: "Tests d'accessibilité",
      performance: "Tests de performance",
      e2e: "Tests end-to-end",
      visual: "Tests visuels",
    };

    // Patterns de test
    this.testPatterns = {
      component: "component-test.pattern",
      hook: "hook-test.pattern",
      utility: "utility-test.pattern",
      api: "api-test.pattern",
    };
  }

  /**
   * Génération principale de tests
   */
  async generateTests(spec, sourceCode, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(`🧪 Génération des tests: ${spec.name}`);

      // Analyse du code source pour comprendre la structure
      const codeAnalysis = await this.analyzeSourceCode(sourceCode, spec);

      // Génération des différents types de tests
      const testSuites = await this.generateTestSuites(
        spec,
        codeAnalysis,
        config,
      );

      // Génération des mocks si nécessaire
      const mocks = config.mocking
        ? await this.generateMocks(codeAnalysis)
        : null;

      // Génération de la configuration de test
      const testConfig = await this.generateTestConfig(spec, config);

      // Formatage de tous les fichiers de test
      const formattedTests = await this.formatTestFiles(testSuites);

      // Sauvegarde en mémoire
      await this.saveToMemory(spec, testSuites, codeAnalysis);

      const result = {
        success: true,
        tests: {
          name: spec.name,
          suites: formattedTests,
          mocks,
          config: testConfig,
          analysis: codeAnalysis,
        },
        metadata: {
          timestamp: Date.now(),
          config,
          coverage: this.estimateCoverage(testSuites, codeAnalysis),
        },
      };

      this.logger.info(`✅ Tests ${spec.name} générés avec succès`);

      return result;
    } catch (error) {
      this.logger.error(`❌ Erreur génération tests ${spec.name}:`, error);
      return {
        success: false,
        error: error.message,
        tests: null,
      };
    }
  }

  /**
   * Génération de tests pour composant React
   */
  async generateComponentTests(componentSpec, componentCode, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(
        `⚛️ Génération des tests de composant: ${componentSpec.name}`,
      );

      // Analyse spécifique au composant React
      const componentAnalysis = await this.analyzeReactComponent(
        componentCode,
        componentSpec,
      );

      // Génération des tests unitaires
      const unitTests = await this.generateUnitTests(
        componentSpec,
        componentAnalysis,
        config,
      );

      // Génération des tests d'intégration
      const integrationTests = config.integration
        ? await this.generateIntegrationTests(
            componentSpec,
            componentAnalysis,
            config,
          )
        : null;

      // Génération des tests d'accessibilité
      const a11yTests = config.accessibility
        ? await this.generateAccessibilityTests(
            componentSpec,
            componentAnalysis,
            config,
          )
        : null;

      // Génération des tests de performance
      const performanceTests = config.performance
        ? await this.generatePerformanceTests(
            componentSpec,
            componentAnalysis,
            config,
          )
        : null;

      return {
        success: true,
        tests: {
          unit: unitTests,
          integration: integrationTests,
          accessibility: a11yTests,
          performance: performanceTests,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Erreur génération tests composant:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Génération de tests pour hook React
   */
  async generateHookTests(hookSpec, hookCode, options = {}) {
    try {
      const config = { ...this.defaultConfig, ...options };

      this.logger.info(`🪝 Génération des tests de hook: ${hookSpec.name}`);

      // Analyse du hook
      const hookAnalysis = await this.analyzeReactHook(hookCode, hookSpec);

      // Génération des tests de hook
      const hookTests = await this.generateHookTestCode(
        hookSpec,
        hookAnalysis,
        config,
      );

      return {
        success: true,
        tests: hookTests,
      };
    } catch (error) {
      this.logger.error(`❌ Erreur génération tests hook:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyse du code source
   */
  async analyzeSourceCode(sourceCode, spec) {
    const prompt = `
Analyse ce code source pour générer des tests complets:

Code:
${sourceCode}

Spécification:
${JSON.stringify(spec, null, 2)}

Analyse et extrais:
1. Fonctions/méthodes à tester
2. Props/paramètres d'entrée
3. Valeurs de retour attendues
4. Effets de bord
5. Dépendances externes
6. États internes
7. Cas limites à tester
8. Scénarios d'erreur
9. Interactions utilisateur
10. Assertions nécessaires

Retourne un JSON structuré avec ces informations.
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Analyse spécifique d'un composant React
   */
  async analyzeReactComponent(componentCode, componentSpec) {
    const prompt = `
Analyse ce composant React pour générer des tests complets:

Code du composant:
${componentCode}

Spécification:
${JSON.stringify(componentSpec, null, 2)}

Analyse spécifiquement:
1. Props du composant et leurs types
2. État local (useState, useReducer)
3. Effets (useEffect, useLayoutEffect)
4. Événements et callbacks
5. Rendu conditionnel
6. Boucles et listes
7. Refs et DOM
8. Contextes utilisés
9. Hooks personnalisés
10. Accessibilité (ARIA, rôles)
11. Interactions clavier/souris
12. Cas d'erreur et loading

Retourne un JSON avec les éléments à tester.
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Analyse d'un hook React
   */
  async analyzeReactHook(hookCode, hookSpec) {
    const prompt = `
Analyse ce hook React personnalisé:

Code du hook:
${hookCode}

Spécification:
${JSON.stringify(hookSpec, null, 2)}

Analyse:
1. Paramètres d'entrée
2. Valeurs de retour
3. État interne
4. Effets et nettoyage
5. Dépendances
6. Optimisations (useMemo, useCallback)
7. Cas d'erreur
8. Cycles de vie

Retourne un JSON avec les éléments à tester.
`;

    const response = await this.groqClient.analyzeContext({ prompt });
    return response;
  }

  /**
   * Génération des suites de tests
   */
  async generateTestSuites(spec, analysis, config) {
    const suites = {};

    // Tests unitaires (toujours générés)
    suites.unit = await this.generateUnitTests(spec, analysis, config);

    // Tests d'intégration
    if (config.integration) {
      suites.integration = await this.generateIntegrationTests(
        spec,
        analysis,
        config,
      );
    }

    // Tests d'accessibilité
    if (config.accessibility) {
      suites.accessibility = await this.generateAccessibilityTests(
        spec,
        analysis,
        config,
      );
    }

    // Tests de performance
    if (config.performance) {
      suites.performance = await this.generatePerformanceTests(
        spec,
        analysis,
        config,
      );
    }

    return suites;
  }

  /**
   * Génération des tests unitaires
   */
  async generateUnitTests(spec, analysis, config) {
    const prompt = `
Génère des tests unitaires complets avec Jest et React Testing Library:

Élément à tester: ${spec.name}
Type: ${spec.type}
Analyse: ${JSON.stringify(analysis, null, 2)}

Configuration:
- Framework: ${config.framework}
- Testing Library: ${config.testingLibrary}
- Mocking: ${config.mocking}
- Snapshots: ${config.snapshots}

Les tests doivent couvrir:
1. Rendu par défaut
2. Props et leur impact
3. Interactions utilisateur
4. États et transitions
5. Événements et callbacks
6. Cas limites
7. Gestion d'erreurs
8. Nettoyage et unmount

Utilise les bonnes pratiques:
- Arrange, Act, Assert
- Tests descriptifs et lisibles
- Mocking approprié
- Assertions précises
- Nettoyage après chaque test

Retourne uniquement le code des tests.
`;

    const response = await this.groqClient.generateCode(
      {
        type: "unit-tests",
        name: `${spec.name}.test.js`,
        prompt,
      },
      {
        temperature: 0.5,
        maxTokens: 3072,
      },
    );

    return {
      filename: `${spec.name}.test.js`,
      content: response.code,
      type: "unit",
    };
  }

  /**
   * Génération des tests d'intégration
   */
  async generateIntegrationTests(spec, analysis, config) {
    const prompt = `
Génère des tests d'intégration pour ${spec.name}:

Analyse: ${JSON.stringify(analysis, null, 2)}

Les tests d'intégration doivent couvrir:
1. Interaction avec d'autres composants
2. Flux de données complets
3. Intégration avec les contextes
4. Appels API et gestion des réponses
5. Navigation et routing
6. Gestion d'état globale
7. Effets de bord complexes

Utilise des scénarios réalistes d'utilisation.

Retourne uniquement le code des tests d'intégration.
`;

    const response = await this.groqClient.generateCode({
      type: "integration-tests",
      name: `${spec.name}.integration.test.js`,
      prompt,
    });

    return {
      filename: `${spec.name}.integration.test.js`,
      content: response.code,
      type: "integration",
    };
  }

  /**
   * Génération des tests d'accessibilité
   */
  async generateAccessibilityTests(spec, analysis, config) {
    const prompt = `
Génère des tests d'accessibilité avec jest-axe et Testing Library:

Élément: ${spec.name}
Analyse: ${JSON.stringify(analysis, null, 2)}

Les tests d'accessibilité doivent vérifier:
1. Conformité WCAG 2.1
2. Navigation au clavier
3. Lecteurs d'écran (ARIA)
4. Contraste et visibilité
5. Focus management
6. Rôles et propriétés ARIA
7. Textes alternatifs
8. Ordre de tabulation

Utilise:
- jest-axe pour les règles automatiques
- user-event pour les interactions clavier
- screen reader testing utilities

Retourne uniquement le code des tests d'accessibilité.
`;

    const response = await this.groqClient.generateCode({
      type: "accessibility-tests",
      name: `${spec.name}.a11y.test.js`,
      prompt,
    });

    return {
      filename: `${spec.name}.a11y.test.js`,
      content: response.code,
      type: "accessibility",
    };
  }

  /**
   * Génération des tests de performance
   */
  async generatePerformanceTests(spec, analysis, config) {
    const prompt = `
Génère des tests de performance pour ${spec.name}:

Analyse: ${JSON.stringify(analysis, null, 2)}

Les tests de performance doivent mesurer:
1. Temps de rendu initial
2. Temps de re-rendu
3. Utilisation mémoire
4. Nombre de re-renders
5. Performance des interactions
6. Lazy loading et code splitting
7. Bundle size impact

Utilise:
- React Profiler API
- Performance measurement APIs
- Memory usage tracking
- Render counting

Retourne uniquement le code des tests de performance.
`;

    const response = await this.groqClient.generateCode({
      type: "performance-tests",
      name: `${spec.name}.perf.test.js`,
      prompt,
    });

    return {
      filename: `${spec.name}.perf.test.js`,
      content: response.code,
      type: "performance",
    };
  }

  /**
   * Génération du code de test pour hook
   */
  async generateHookTestCode(hookSpec, analysis, config) {
    const prompt = `
Génère des tests complets pour ce hook React:

Hook: ${hookSpec.name}
Analyse: ${JSON.stringify(analysis, null, 2)}

Les tests doivent couvrir:
1. Valeurs initiales
2. Mise à jour de l'état
3. Effets et nettoyage
4. Paramètres d'entrée
5. Valeurs de retour
6. Optimisations
7. Cas d'erreur
8. Cycles de vie

Utilise @testing-library/react-hooks pour tester les hooks.

Structure:
- describe() pour grouper les tests
- test() pour chaque cas
- renderHook() pour tester le hook
- act() pour les mises à jour
- waitFor() pour les effets asynchrones

Retourne uniquement le code des tests.
`;

    const response = await this.groqClient.generateCode({
      type: "hook-tests",
      name: `${hookSpec.name}.test.js`,
      prompt,
    });

    return {
      filename: `${hookSpec.name}.test.js`,
      content: response.code,
      type: "hook",
    };
  }

  /**
   * Génération des mocks
   */
  async generateMocks(analysis) {
    if (!analysis.dependencies || analysis.dependencies.length === 0) {
      return null;
    }

    const prompt = `
Génère des mocks Jest pour ces dépendances:

Dépendances: ${JSON.stringify(analysis.dependencies, null, 2)}

Génère des mocks pour:
1. Modules externes
2. APIs et services
3. Hooks personnalisés
4. Utilitaires
5. Composants enfants

Les mocks doivent:
- Simuler le comportement réel
- Permettre la vérification des appels
- Être configurables pour différents scénarios
- Gérer les cas d'erreur

Retourne le code des mocks.
`;

    const response = await this.groqClient.generateCode({
      type: "mocks",
      name: "__mocks__",
      prompt,
    });

    return {
      filename: "__mocks__/index.js",
      content: response.code,
      type: "mocks",
    };
  }

  /**
   * Génération de la configuration de test
   */
  async generateTestConfig(spec, config) {
    const jestConfig = {
      testEnvironment: "jsdom",
      setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
      moduleNameMapping: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
      collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/index.js",
        "!src/reportWebVitals.js",
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      testMatch: [
        "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
      ],
    };

    if (config.accessibility) {
      jestConfig.setupFilesAfterEnv.push("<rootDir>/src/setupA11yTests.js");
    }

    return {
      filename: "jest.config.js",
      content: `module.exports = ${JSON.stringify(jestConfig, null, 2)};`,
      type: "config",
    };
  }

  /**
   * Formatage des fichiers de test
   */
  async formatTestFiles(testSuites) {
    const formatted = {};

    for (const [type, suite] of Object.entries(testSuites)) {
      if (suite && suite.content) {
        formatted[type] = {
          ...suite,
          content: await formatCode(suite.content, "javascript"),
        };
      }
    }

    return formatted;
  }

  /**
   * Estimation de la couverture de code
   */
  estimateCoverage(testSuites, analysis) {
    let coverage = 0;
    let totalElements = 0;

    // Calcul basé sur les éléments analysés et les tests générés
    if (analysis.functions) {
      totalElements += analysis.functions.length;
      coverage += analysis.functions.length * 0.8; // Estimation 80% de couverture
    }

    if (analysis.props) {
      totalElements += analysis.props.length;
      coverage += analysis.props.length * 0.9; // Props généralement bien testées
    }

    if (analysis.events) {
      totalElements += analysis.events.length;
      coverage += analysis.events.length * 0.7; // Événements parfois complexes
    }

    return totalElements > 0 ? Math.round((coverage / totalElements) * 100) : 0;
  }

  /**
   * Sauvegarde en mémoire
   */
  async saveToMemory(spec, testSuites, analysis) {
    if (!this.memory.isInitialized) {
      return;
    }

    await this.memory.recordGeneration({
      type: "tests",
      name: spec.name,
      code: JSON.stringify(testSuites),
      analysis,
      domain: "testing",
      timestamp: Date.now(),
      success: true,
      quality: 0.85, // Tests généralement de bonne qualité
    });
  }

  /**
   * Écriture des fichiers de test
   */
  async writeTestFiles(testResult, outputDir) {
    try {
      // Création du répertoire de tests
      const testsDir = path.join(outputDir, "__tests__");
      await fs.mkdir(testsDir, { recursive: true });

      const writtenFiles = [];

      // Écriture de chaque suite de tests
      for (const [type, suite] of Object.entries(testResult.tests.suites)) {
        if (suite && suite.content) {
          const filePath = path.join(testsDir, suite.filename);
          await fs.writeFile(filePath, suite.content);
          writtenFiles.push(suite.filename);
        }
      }

      // Écriture des mocks
      if (testResult.tests.mocks) {
        const mocksDir = path.join(outputDir, "__mocks__");
        await fs.mkdir(mocksDir, { recursive: true });

        await fs.writeFile(
          path.join(mocksDir, testResult.tests.mocks.filename),
          testResult.tests.mocks.content,
        );
        writtenFiles.push(`__mocks__/${testResult.tests.mocks.filename}`);
      }

      // Écriture de la configuration
      if (testResult.tests.config) {
        await fs.writeFile(
          path.join(outputDir, testResult.tests.config.filename),
          testResult.tests.config.content,
        );
        writtenFiles.push(testResult.tests.config.filename);
      }

      this.logger.info(`📁 Tests écrits dans: ${testsDir}`);

      return {
        success: true,
        path: testsDir,
        files: writtenFiles,
      };
    } catch (error) {
      this.logger.error("❌ Erreur écriture tests:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Exécution des tests générés
   */
  async runTests(testPath, options = {}) {
    try {
      const { spawn } = await import("child_process");

      const testCommand = options.framework === "vitest" ? "vitest" : "jest";
      const args = [testPath];

      if (options.coverage) {
        args.push("--coverage");
      }

      if (options.watch) {
        args.push("--watch");
      }

      return new Promise((resolve, reject) => {
        const testProcess = spawn(testCommand, args, {
          stdio: "pipe",
          cwd: process.cwd(),
        });

        let output = "";
        let errorOutput = "";

        testProcess.stdout.on("data", (data) => {
          output += data.toString();
        });

        testProcess.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });

        testProcess.on("close", (code) => {
          if (code === 0) {
            resolve({
              success: true,
              output,
              coverage: this.parseCoverageOutput(output),
            });
          } else {
            reject(new Error(`Tests failed with code ${code}: ${errorOutput}`));
          }
        });
      });
    } catch (error) {
      this.logger.error("❌ Erreur exécution tests:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Parsing de la sortie de couverture
   */
  parseCoverageOutput(output) {
    // Extraction des métriques de couverture depuis la sortie Jest
    const coverageMatch = output.match(
      /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/,
    );

    if (coverageMatch) {
      return {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      };
    }

    return null;
  }

  /**
   * Obtention des statistiques du générateur
   */
  async getStats() {
    if (!this.memory.isInitialized) {
      return { tests: 0, coverage: 0 };
    }

    const testGenerations = await this.memory.search("", {
      type: "generation",
      tags: ["testing"],
    });

    return {
      totalTests: testGenerations.length,
      averageCoverage:
        testGenerations.reduce((sum, g) => sum + (g.data.coverage || 0), 0) /
          testGenerations.length || 0,
      testTypes: {
        unit: testGenerations.filter((g) =>
          g.data.analysis?.testTypes?.includes("unit"),
        ).length,
        integration: testGenerations.filter((g) =>
          g.data.analysis?.testTypes?.includes("integration"),
        ).length,
        accessibility: testGenerations.filter((g) =>
          g.data.analysis?.testTypes?.includes("accessibility"),
        ).length,
        performance: testGenerations.filter((g) =>
          g.data.analysis?.testTypes?.includes("performance"),
        ).length,
      },
    };
  }
}

// Fonctions utilitaires pour l'API
let tests = [
  {
    id: "btn-1",
    name: "Button renders correctly",
    status: "passed",
    content: `test('Button renders correctly', () => { render(<Button />); })`,
  },
  {
    id: "input-2",
    name: "Input handles change",
    status: "failed",
    content: `test('Input handles change', () => { ... })`,
  },
  {
    id: "form-3",
    name: "Form validation works",
    status: "passed",
    content: `test('Form validation works', () => { ... })`,
  },
  {
    id: "modal-4",
    name: "Modal opens and closes",
    status: "pending",
    content: `test('Modal opens and closes', () => { ... })`,
  },
];

export function getAllTests() {
  return tests;
}

export function rerunTestById(id) {
  const test = tests.find((t) => t.id === id);
  if (test) test.status = Math.random() > 0.5 ? "passed" : "failed";
}
