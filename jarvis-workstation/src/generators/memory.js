/**
 * @file Système de mémoire des générations
 * @module memory
 */

import chalk from "chalk";

/**
 * @class MemorySystem
 * @description Gère le stockage et la récupération des générations de code précédentes pour améliorer la cohérence et la pertinence.
 */
class MemorySystem {
  /**
   * @private
   * @type {Map<string, Array<object>>}
   * @description Stockage en mémoire des conversations, indexé par un identifiant de session.
   */
  #memoryStore;

  /**
   * Crée une instance de MemorySystem.
   */
  constructor() {
    this.#memoryStore = new Map();
    console.log(chalk.green("MemorySystem initialisé."));
  }

  /**
   * Ajoute une nouvelle entrée à la mémoire pour une session donnée.
   * @param {string} sessionId - L'identifiant unique de la session.
   * @param {object} entry - L'objet à stocker en mémoire (ex: un message de conversation, un résultat de génération).
   * @returns {Promise<void>}
   * @example
   * // Exemple d'utilisation:
   * const memory = new MemorySystem();
   * await memory.addEntry('user-123', { role: 'user', content: 'Generate a button component.' });
   * await memory.addEntry('user-123', { role: 'assistant', content: '```jsx\n<button>Click me</button>\n```' });
   */
  async addEntry(sessionId, entry) {
    if (!sessionId || typeof sessionId !== "string") {
      console.error(
        chalk.red(
          "Erreur: sessionId doit être une chaîne de caractères valide.",
        ),
      );
      throw new Error("Invalid sessionId.");
    }
    if (!entry || typeof entry !== "object") {
      console.error(
        chalk.red("Erreur: L'entrée de mémoire doit être un objet valide."),
      );
      throw new Error("Invalid memory entry.");
    }

    try {
      if (!this.#memoryStore.has(sessionId)) {
        this.#memoryStore.set(sessionId, []);
      }
      this.#memoryStore.get(sessionId).push(entry);
      console.log(
        chalk.blue(
          `Entrée ajoutée à la mémoire pour la session: ${sessionId}.`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red(
          `Erreur lors de l\'ajout à la mémoire pour la session ${sessionId}: ${error.message}`,
        ),
      );
      throw new Error(`Failed to add entry to memory: ${error.message}`);
    }
  }

  /**
   * Récupère toutes les entrées de la mémoire pour une session donnée.
   * @param {string} sessionId - L'identifiant unique de la session.
   * @returns {Promise<Array<object>>} Un tableau des entrées de mémoire pour la session.
   * @example
   * // Exemple d'utilisation:
   * const memory = new MemorySystem();
   * const entries = await memory.getEntries('user-123');
   * console.log('Entrées de la session user-123:', entries);
   */
  async getEntries(sessionId) {
    if (!sessionId || typeof sessionId !== "string") {
      console.error(
        chalk.red(
          "Erreur: sessionId doit être une chaîne de caractères valide.",
        ),
      );
      throw new Error("Invalid sessionId.");
    }

    try {
      const entries = this.#memoryStore.get(sessionId) || [];
      console.log(
        chalk.blue(
          `Récupération de ${entries.length} entrées pour la session: ${sessionId}.`,
        ),
      );
      return entries;
    } catch (error) {
      console.error(
        chalk.red(
          `Erreur lors de la récupération des entrées pour la session ${sessionId}: ${error.message}`,
        ),
      );
      throw new Error(
        `Failed to retrieve entries from memory: ${error.message}`,
      );
    }
  }

  /**
   * Efface toutes les entrées de la mémoire pour une session donnée.
   * @param {string} sessionId - L'identifiant unique de la session.
   * @returns {Promise<void>}
   * @example
   * // Exemple d'utilisation:
   * const memory = new MemorySystem();
   * await memory.clearEntries('user-123');
   * console.log('Mémoire effacée pour la session user-123.');
   */
  async clearEntries(sessionId) {
    if (!sessionId || typeof sessionId !== "string") {
      console.error(
        chalk.red(
          "Erreur: sessionId doit être une chaîne de caractères valide.",
        ),
      );
      throw new Error("Invalid sessionId.");
    }

    try {
      if (this.#memoryStore.has(sessionId)) {
        this.#memoryStore.delete(sessionId);
        console.log(
          chalk.blue(`Mémoire effacée pour la session: ${sessionId}.`),
        );
      } else {
        console.log(
          chalk.yellow(`Aucune entrée trouvée pour la session: ${sessionId}.`),
        );
      }
    } catch (error) {
      console.error(
        chalk.red(
          `Erreur lors de l\'effacement des entrées pour la session ${sessionId}: ${error.message}`,
        ),
      );
      throw new Error(`Failed to clear entries from memory: ${error.message}`);
    }
  }

  /**
   * Récupère un sous-ensemble des dernières entrées de la mémoire pour une session donnée.
   * Utile pour limiter la taille du contexte envoyé aux modèles LLM.
   * @param {string} sessionId - L'identifiant unique de la session.
   * @param {number} count - Le nombre d'entrées les plus récentes à récupérer.
   * @returns {Promise<Array<object>>} Un tableau des dernières entrées de mémoire pour la session.
   * @example
   * // Exemple d'utilisation:
   * const memory = new MemorySystem();
   * await memory.addEntry('user-456', { step: 1 });
   * await memory.addEntry('user-456', { step: 2 });
   * await memory.addEntry('user-456', { step: 3 });
   * const lastTwoEntries = await memory.getLatestEntries('user-456', 2);
   * console.log('Les 2 dernières entrées de la session user-456:', lastTwoEntries);
   */
  async getLatestEntries(sessionId, count) {
    if (!sessionId || typeof sessionId !== "string") {
      console.error(
        chalk.red(
          "Erreur: sessionId doit être une chaîne de caractères valide.",
        ),
      );
      throw new Error("Invalid sessionId.");
    }
    if (typeof count !== "number" || count < 0) {
      console.error(chalk.red("Erreur: count doit être un nombre positif."));
      throw new Error("Invalid count for latest entries.");
    }

    try {
      const entries = this.#memoryStore.get(sessionId) || [];
      const latestEntries = entries.slice(Math.max(entries.length - count, 0));
      console.log(
        chalk.blue(
          `Récupération des ${latestEntries.length} dernières entrées pour la session: ${sessionId}.`,
        ),
      );
      return latestEntries;
    } catch (error) {
      console.error(
        chalk.red(
          `Erreur lors de la récupération des dernières entrées pour la session ${sessionId}: ${error.message}`,
        ),
      );
      throw new Error(
        `Failed to retrieve latest entries from memory: ${error.message}`,
      );
    }
  }
}

export default MemorySystem;
