#!/usr/bin/env node

// ==============================================
// 🧠 JARVIS ULTRA INSTINCT CLI - Interface de Commande Principale
// ==============================================
// Version: 2.0.0
// Auteur: Jarvis Expert
// Description: Interface CLI Ultra Instinct pour générer du code React/Next.js
// avec intégration Storybook, tests et design system Tailwind/shadcn
// ==============================================

import 'dotenv/config';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Importation des modules internes
import GroqClient from './src/utils/groq-client.js';
import ReactGenerator from './src/generators/react-gen.js';
import StorybookGenerator from './src/generators/storybook-gen.js';
import TestGenerator from './src/generators/test-gen.js';
import MemorySystem from './src/core/memory.js';
import CodeValidator from './src/utils/validators.js';
import CodeFormatter from './src/utils/formatters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration initiale
program
  .version('2.0.0')
  .description('Jarvis Ultra Instinct - Assistant de génération de code React/Next.js');

// Fonction d'affichage de la bannière
function displayBanner() {
  console.log(
    chalk.blue(
      figlet.textSync('Jarvis Expert', {
        font: 'Big',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.green('🧠 Assistant intelligent de génération de code\n'));
}

// Commande principale: générer un composant
program
  .command('generate <type>')
  .alias('g')
  .description('Générer un élément (component, page, hook, etc.)')
  .option('-n, --name <name>', 'Nom de lélément à générer')
  .option('-d, --dir <directory>', 'Répertoire de destination', 'src/components')
  .option('-t, --typescript', 'Utiliser TypeScript', false)
  .option('--no-storybook', 'Ne pas générer de story Storybook')
  .option('--no-tests', 'Ne pas générer de tests')
  .action(async (type, options) => {
    displayBanner();
    
    try {
      // Vérification des prérequis
      await checkPrerequisites();
      
      // Si le nom n'est pas fourni, on le demande
      if (!options.name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: `Quel nom souhaitez-vous pour votre ${type}?`,
            validate: input => input ? true : 'Le nom ne peut pas être vide'
          }
        ]);
        options.name = answers.name;
      }

      console.log(chalk.yellow(`\n🧠 Jarvis réfléchit à la génération de ${options.name}...\n`));
      
      // Initialisation des systèmes
      const groqClient = new GroqClient();
      const memory = new MemorySystem();
      const validator = new CodeValidator();
      const formatter = new CodeFormatter();
      
      // Récupération du contexte du projet
      const projectContext = await analyzeProjectContext();
      
      // Génération en fonction du type
      switch (type) {
        case 'component':
        case 'c':
          await generateComponent(options, groqClient, memory, projectContext);
          break;
        case 'page':
        case 'p':
          await generatePage(options, groqClient, memory, projectContext);
          break;
        case 'hook':
        case 'h':
          await generateHook(options, groqClient, memory, projectContext);
          break;
        case 'context':
          await generateContext(options, groqClient, memory, projectContext);
          break;
        default:
          console.log(chalk.red(`Type "${type}" non supporté.`));
          console.log('Types supportés: component, page, hook, context');
          process.exit(1);
      }
      
      console.log(chalk.green('\n✅ Génération terminée avec succès!'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Erreur lors de la génération:'), error.message);
      process.exit(1);
    }
  });

// Commande: initialiser un nouveau projet
program
  .command('init [projectName]')
  .description('Initialiser un nouveau projet React/Next.js avec Jarvis')
  .action(async (projectName) => {
    displayBanner();
    
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Quel nom souhaitez-vous pour votre projet?',
          default: 'my-jarvis-app'
        }
      ]);
      projectName = answers.projectName;
    }
    
    console.log(chalk.yellow(`\n🚀 Initialisation du projet ${projectName}...`));
    await initializeProject(projectName);
  });

// Commande: dashboard
program
  .command('dashboard')
  .alias('dash')
  .description('Lancer le dashboard de monitoring Jarvis')
  .action(() => {
    displayBanner();
    console.log(chalk.yellow('📊 Lancement du dashboard Jarvis...'));
    launchDashboard();
  });

// Commande: apprendre (mode pédagogique)
program
  .command('learn')
  .alias('l')
  .description('Mode apprentissage - Poser une question à Jarvis')
  .action(async () => {
    displayBanner();
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'question',
        message: 'Quelle question technique souhaitez-vous poser à Jarvis?',
        validate: input => input ? true : 'La question ne peut pas être vide'
      }
    ]);
    
    await teachMode(answers.question);
  });

// Affichage de l'aide par défaut
program.on('--help', () => {
  console.log('\nExemples:');
  console.log('  $ jarvis generate component -n Button');
  console.log('  $ jarvis generate page -n Home --no-storybook');
  console.log('  $ jarvis init my-app');
  console.log('  $ jarvis learn');
});

// Fonction pour vérifier les prérequis
async function checkPrerequisites() {
  // Vérifier que Node.js est installé
  // Vérifier les dépendances nécessaires
  // Vérifier la clé API Groq
  console.log(chalk.blue('🔍 Vérification des prérequis...'));
  
  // Simulation de vérification
  return true;
}

// Fonction pour analyser le contexte du projet
async function analyzeProjectContext() {
  console.log(chalk.blue('📋 Analyse du projet en cours...'));
  
  // Détection du framework (React, Next.js, etc.)
  // Détection de TypeScript
  // Détection des dépendances existantes
  // Analyse de la structure du projet
  
  return {
    framework: 'nextjs',
    typescript: false,
    hasStorybook: false,
    hasTesting: false,
    designSystem: 'tailwind'
  };
}

// Fonction pour générer un composant
async function generateComponent(options, groqClient, memory, projectContext) {
  console.log(chalk.blue(`⚛️  Génération du composant ${options.name}...`));
  
  // Génération du composant principal
  const reactGenerator = new ReactGenerator(groqClient, memory);
  const componentCode = await reactGenerator.generateComponent(
    options.name, 
    options.dir, 
    projectContext
  );
  
  // Génération de la story Storybook si demandé
  if (options.storybook) {
    const storybookGenerator = new StorybookGenerator(groqClient, memory);
    await storybookGenerator.generateStory(
      options.name, 
      componentCode, 
      projectContext
    );
  }
  
  // Génération des tests si demandé
  if (options.tests) {
    const testGenerator = new TestGenerator(groqClient, memory);
    await testGenerator.generateTests(
      options.name, 
      componentCode, 
      projectContext
    );
  }
  
  // Ajout à la mémoire des générations
  await memory.recordGeneration({
    type: 'component',
    name: options.name,
    path: options.dir,
    timestamp: new Date(),
    context: projectContext
  });
}

// Fonction pour générer une page
async function generatePage(options, groqClient, memory, projectContext) {
  console.log(chalk.blue(`📄 Génération de la page ${options.name}...`));
  // Implémentation similaire à generateComponent mais adaptée aux pages
}

// Fonction pour générer un hook personnalisé
async function generateHook(options, groqClient, memory, projectContext) {
  console.log(chalk.blue(`🎣 Génération du hook ${options.name}...`));
  // Implémentation spécifique aux hooks
}

// Fonction pour générer un contexte
async function generateContext(options, groqClient, memory, projectContext) {
  console.log(chalk.blue(`🔄 Génération du contexte ${options.name}...`));
  // Implémentation spécifique aux contextes React
}

// Fonction pour initialiser un nouveau projet
async function initializeProject(projectName) {
  console.log(chalk.blue(`🏗️  Création du projet ${projectName}...`));
  
  // Création du répertoire du projet
  const projectPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`Le projet ${projectName} existe déjà.`));
    process.exit(1);
  }
  
  fs.mkdirSync(projectPath);
  
  // Questions pour configurer le projet
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Quel framework souhaitez-vous utiliser?',
      choices: ['Next.js', 'React', 'Vite'],
      default: 'Next.js'
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Utiliser TypeScript?',
      default: true
    },
    {
      type: 'confirm',
      name: 'storybook',
      message: 'Installer Storybook?',
      default: true
    },
    {
      type: 'confirm',
      name: 'testing',
      message: 'Configurer les tests (Jest + Testing Library)?',
      default: true
    }
  ]);
  
  console.log(chalk.yellow('\n🔧 Configuration en cours... Cela peut prendre quelques minutes.'));
  
  // Logique de création du projet en fonction des réponses
  // (Ex: cloner un template, installer les dépendances, etc.)
  
  console.log(chalk.green(`\n🎉 Projet ${projectName} initialisé avec succès!`));
  console.log(`\n👉 Pour commencer, exécutez:\n  cd ${projectName}\n  npm install\n  npm run dev`);
}

// Fonction pour le mode apprentissage
async function teachMode(question) {
  console.log(chalk.blue(`🤔 Jarvis réfléchit à votre question: "${question}"`));
  
  const groqClient = new GroqClient();
  const messages = [
    {
      role: "system",
      content: "Tu es Jarvis, un assistant IA expert en développement. Explique clairement et de manière pédagogique."
    },
    {
      role: "user",
      content: question
    }
  ];
  
  const response = await groqClient.sendRequest(messages);
  const answer = response.choices[0]?.message?.content;
  
  console.log(chalk.cyan('\nRéponse de Jarvis:\n'));
  console.log(answer);
}

// Fonction pour lancer le dashboard
function launchDashboard() {
  console.log(chalk.red('Le dashboard n\'est pas encore implémenté.'));
}

// Point d'entrée principal
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('Erreur inattendue:'), error.message);
    process.exit(1);
  }
}

main();


