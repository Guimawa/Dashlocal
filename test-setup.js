#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration du projet
 */

import dotenv from "dotenv";
import { getGroqClient } from "./src/utils/groq-client.js";
import JarvisBrain from "./src/core/brain.js";
import MemorySystem from "./src/core/memory.js";
import LearningSystem from "./src/core/learning.js";
import Logger from "./src/core/logger.js";

// Charger les variables d'environnement
dotenv.config();

async function testConfiguration() {
  console.log("🔍 Test de configuration du projet Dashboard IA...\n");

  // Test 1: Variables d'environnement
  console.log("1. Test des variables d'environnement:");
  const hasApiKey = !!process.env.GROQ_API_KEY;
  console.log(
    `   - GROQ_API_KEY: ${hasApiKey ? "✅ Définie" : "❌ Manquante"}`,
  );
  console.log(`   - PORT: ${process.env.PORT || "3000 (défaut)"}`);
  console.log(`   - LOG_LEVEL: ${process.env.LOG_LEVEL || "info (défaut)"}\n`);

  if (!hasApiKey) {
    console.log("⚠️  ATTENTION: Clé API Groq manquante!");
    console.log("   Copiez env.example vers .env et ajoutez votre clé API\n");
    return false;
  }

  // Test 2: Groq Client
  console.log("2. Test du client Groq:");
  try {
    const groqClient = getGroqClient();
    console.log("   ✅ Client Groq initialisé");

    // Test simple de l'API
    const testResponse = await groqClient.sendRequest([
      { role: "user", content: 'Test de connexion - réponds juste "OK"' },
    ]);

    if (testResponse.choices?.[0]?.message?.content) {
      console.log("   ✅ API Groq fonctionnelle");
    } else {
      console.log("   ❌ Réponse API invalide");
    }
  } catch (error) {
    console.log(`   ❌ Erreur client Groq: ${error.message}`);
  }
  console.log("");

  // Test 3: Systèmes core
  console.log("3. Test des systèmes core:");

  try {
    const memory = new MemorySystem();
    console.log("   ✅ MemorySystem initialisé");

    const learning = new LearningSystem();
    await learning.initialize();
    console.log("   ✅ LearningSystem initialisé");

    const logger = new Logger("Test");
    console.log("   ✅ Logger initialisé");

    const brain = new JarvisBrain();
    console.log("   ✅ JarvisBrain initialisé");
  } catch (error) {
    console.log(`   ❌ Erreur système core: ${error.message}`);
  }
  console.log("");

  // Test 4: Générateurs
  console.log("4. Test des générateurs:");
  try {
    const { default: ReactGenerator } = await import(
      "./src/generators/react-gen.js"
    );
    console.log("   ✅ ReactGenerator importé");

    const { default: CodeValidator } = await import(
      "./src/utils/validators.js"
    );
    console.log("   ✅ CodeValidator importé");

    const { default: CodeFormatter } = await import(
      "./src/utils/formatters.js"
    );
    console.log("   ✅ CodeFormatter importé");
  } catch (error) {
    console.log(`   ❌ Erreur générateurs: ${error.message}`);
  }
  console.log("");

  console.log("🎉 Tests de configuration terminés!");
  return true;
}

// Exécution des tests
testConfiguration().catch(console.error);
