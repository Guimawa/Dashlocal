// src/utils/groq-client.js
import fetch from "node-fetch";
import { createHash } from "crypto";
import { promisify } from "util";
import { writeFile, readFile, access } from "fs/promises";
import { join } from "path";

// Configuration avancée
const GROQ_CONFIG = {
  baseURL: "https://api.groq.com/openai/v1",
  defaultModel: "llama3-70b-8192",
  fallbackModels: ["llama3-8b-8192", "mixtral-8x7b-32768"],
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  rateLimit: {
    requests: 50,
    interval: 60000, // 1 minute
  },
};

class GroqClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }

    this.apiKey = apiKey;
    this.cache = new Map();
    this.rateLimit = {
      count: 0,
      resetTime: Date.now() + GROQ_CONFIG.rateLimit.interval,
    };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      totalTokens: 0,
      totalTime: 0,
    };

    this.cacheFile = join(process.cwd(), ".groq-cache.json");
    this.loadCache().catch(console.error);
  }

  /**
   * Génère une signature de cache pour une requête
   */
  generateCacheKey(messages, model, temperature = 0.7) {
    const content = JSON.stringify({ messages, model, temperature });
    return createHash("md5").update(content).digest("hex");
  }

  /**
   * Charge le cache depuis le disque
   */
  async loadCache() {
    try {
      await access(this.cacheFile);
      const data = await readFile(this.cacheFile, "utf8");
      const cacheData = JSON.parse(data);

      // Nettoyer le cache expiré
      const now = Date.now();
      for (const [key, entry] of Object.entries(cacheData)) {
        if (now - entry.timestamp < GROQ_CONFIG.cacheTTL) {
          this.cache.set(key, entry);
        }
      }
    } catch (error) {
      // Fichier de cache n'existe pas, c'est normal
    }
  }

  /**
   * Sauvegarde le cache sur le disque
   */
  async saveCache() {
    try {
      const cacheData = Object.fromEntries(this.cache);
      await writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn("Could not save cache:", error.message);
    }
  }

  /**
   * Vérifie et gère les limites de taux
   */
  checkRateLimit() {
    const now = Date.now();

    if (now > this.rateLimit.resetTime) {
      this.rateLimit.count = 0;
      this.rateLimit.resetTime = now + GROQ_CONFIG.rateLimit.interval;
    }

    if (this.rateLimit.count >= GROQ_CONFIG.rateLimit.requests) {
      const waitTime = this.rateLimit.resetTime - now;
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`,
      );
    }

    this.rateLimit.count++;
  }

  /**
   * Envoie une requête à l'API Groq avec retry automatique
   */
  async sendRequest(
    messages,
    model = GROQ_CONFIG.defaultModel,
    temperature = 0.7,
  ) {
    const cacheKey = this.generateCacheKey(messages, model, temperature);
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.metrics.cacheHits++;
      return cached.response;
    }

    this.checkRateLimit();
    this.metrics.totalRequests++;

    let lastError;
    for (let attempt = 1; attempt <= GROQ_CONFIG.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          GROQ_CONFIG.timeout,
        );

        const startTime = Date.now();
        const response = await fetch(
          `${GROQ_CONFIG.baseURL}/chat/completions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages,
              temperature,
              max_tokens: 4000,
              stream: false,
            }),
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP ${response.status}: ${errorData.error?.message || response.statusText}`,
          );
        }

        const data = await response.json();
        const endTime = Date.now();

        // Mise à jour des métriques
        this.metrics.successfulRequests++;
        this.metrics.totalTime += endTime - startTime;
        this.metrics.totalTokens += data.usage?.total_tokens || 0;

        // Cache la réponse
        const cacheEntry = {
          response: data,
          timestamp: Date.now(),
          model,
          tokenCount: data.usage?.total_tokens,
        };

        this.cache.set(cacheKey, cacheEntry);
        await this.saveCache();

        return data;
      } catch (error) {
        lastError = error;

        if (attempt === GROQ_CONFIG.maxRetries) break;

        // Backoff exponentiel
        const delay = GROQ_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        await promisify(setTimeout)(delay);

        // Essayer un modèle de fallback si disponible
        if (
          error.message.includes("model") &&
          GROQ_CONFIG.fallbackModels.length > 0
        ) {
          model = GROQ_CONFIG.fallbackModels.shift();
          console.warn(`Switching to fallback model: ${model}`);
        }
      }
    }

    this.metrics.failedRequests++;
    throw lastError;
  }

  /**
   * Génère du code avec l'IA
   */
  async generateCode(prompt, context = "", maxAttempts = 2) {
    const messages = [
      {
        role: "system",
        content: `Tu es un expert en développement fullstack. Génère du code JavaScript/TypeScript de haute qualité.
${context ? `Contexte: ${context}` : ""}
Règles:
- Code propre et bien documenté
- Utilise les meilleures pratiques
- Inclure des commentaires JSDoc
- Gestion d'erreurs robuste
- Optimisé pour les performances`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    try {
      const response = await this.sendRequest(messages);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content generated");
      }

      return {
        success: true,
        code: content.trim(),
        model: response.model,
        tokens: response.usage?.total_tokens,
        metadata: {
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          totalTokens: response.usage?.total_tokens,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        attempts: maxAttempts,
      };
    }
  }

  /**
   * Récupère les métriques d'utilisation
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageTime:
        this.metrics.successfulRequests > 0
          ? this.metrics.totalTime / this.metrics.successfulRequests
          : 0,
      cacheSize: this.cache.size,
      cacheHitRate:
        this.metrics.totalRequests > 0
          ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100
          : 0,
    };
  }

  /**
   * Nettoie le cache expiré
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > GROQ_CONFIG.cacheTTL) {
        this.cache.delete(key);
      }
    }
    this.saveCache();
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      totalTokens: 0,
      totalTime: 0,
    };
  }
}

// Singleton pour une utilisation globale
let globalInstance = null;

export function getGroqClient(apiKey = process.env.GROQ_API_KEY) {
  if (!globalInstance) {
    globalInstance = new GroqClient(apiKey);
  }
  return globalInstance;
}

export default GroqClient;
