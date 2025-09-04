import GroqHelper from "./lib/groq-helper.js";
import fs from "fs";
import readline from "readline";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Configuration
const CONFIG = {
  memoryFile: "./memory.json",
  systemPrompt: `Tu es Jarvis, un assistant IA personnel et loyal. 
    Tu parles comme un Maître Jedi sage mais moderne. 
    Sois concis, utile et un peu humoristique quand c'est approprié.`,
};

class JarvisLocal {
  constructor(apiKey) {
    this.groq = new GroqHelper(apiKey);
    this.memory = this.loadMemory();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  loadMemory() {
    try {
      if (fs.existsSync(CONFIG.memoryFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.memoryFile, "utf8"));
      }
    } catch (error) {
      console.log("Création d'une nouvelle mémoire...");
    }
    return { conversations: [] };
  }

  saveMemory() {
    fs.writeFileSync(CONFIG.memoryFile, JSON.stringify(this.memory, null, 2));
  }

  async chatLoop() {
    console.log('\n🔮 Jarvis Local activé. Tape "quit" pour partir.\n');

    while (true) {
      const userInput = await this.question("Vous: ");

      if (userInput.toLowerCase() === "quit") {
        console.log("À la prochaine, Maître ! 🫡");
        this.saveMemory();
        break;
      }

      // Préparer l'historique de conversation
      const messages = [
        { role: "system", content: CONFIG.systemPrompt },
        ...this.memory.conversations.slice(-10), // Garder les 10 derniers messages
        { role: "user", content: userInput },
      ];

      process.stdout.write("Jarvis: ");
      const response = await this.groq.sendMessage(messages);
      console.log(response);

      // Sauvegarder dans la mémoire
      this.memory.conversations.push(
        { role: "user", content: userInput },
        { role: "assistant", content: response },
      );

      // Garder une limite raisonnable en mémoire
      if (this.memory.conversations.length > 100) {
        this.memory.conversations = this.memory.conversations.slice(-50);
      }
    }
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Lancement
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("❌ Configure ta clé Groq API:");
  console.error("1. Copie env.example vers .env");
  console.error("2. Ajoute ta clé API dans .env: GROQ_API_KEY=ta_cle_ici");
  console.error("3. Ou exporte-la: export GROQ_API_KEY=ta_cle_ici");
  process.exit(1);
}

const jarvis = new JarvisLocal(apiKey);
jarvis.chatLoop();

// Gérer proprement la fermeture
process.on("SIGINT", () => {
  jarvis.saveMemory();
  console.log("\n💾 Mémoire sauvegardée. À bientôt !");
  process.exit(0);
});
