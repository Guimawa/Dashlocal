// src/core/memory.js
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * @class MemorySystem
 * @description Système de mémoire pour Jarvis Ultra Instinct
 */
class MemorySystem {
    constructor() {
        this.memoryFile = './jarvis-memory.json';
        this.cache = new Map();
        this.memory = null;
        this.init();
    }

    async init() {
        this.memory = await this.loadMemory();
    }

    /**
     * Charge la mémoire depuis le fichier
     */
    async loadMemory() {
        try {
            const data = await fs.readFile(this.memoryFile, 'utf-8');
            const parsedData = JSON.parse(data);
            return {
                conversations: parsedData.conversations || [],
                generations: parsedData.generations || [],
                preferences: parsedData.preferences || {},
                context: parsedData.context || {},
                stats: parsedData.stats || {
                    totalGenerations: 0,
                    successfulGenerations: 0,
                    failedGenerations: 0,
                    totalTokens: 0,
                    averageResponseTime: 0
                }
            };
        } catch (error) {
            console.log('Création d\'une nouvelle mémoire...');
            return {
                conversations: [],
                generations: [],
                preferences: {},
                context: {},
                stats: {
                    totalGenerations: 0,
                    successfulGenerations: 0,
                    failedGenerations: 0,
                    totalTokens: 0,
                    averageResponseTime: 0
                }
            };
        }
    }

    /**
     * Sauvegarde la mémoire
     */
    async saveMemory() {
        try {
            await fs.writeFile(this.memoryFile, JSON.stringify(this.memory, null, 2));
        } catch (error) {
            console.warn('Impossible de sauvegarder la mémoire:', error.message);
        }
    }

    /**
     * Enregistre une génération
     */
    async recordGeneration(generationData) {
        const generation = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...generationData
        };

        this.memory.generations.push(generation);
        this.memory.stats.totalGenerations++;

        if (generationData.success !== false) {
            this.memory.stats.successfulGenerations++;
        } else {
            this.memory.stats.failedGenerations++;
        }

        await this.saveMemory();
        return generation;
    }

    /**
     * Enregistre une conversation
     */
    async recordConversation(userMessage, assistantResponse, metadata = {}) {
        const conversation = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            user: userMessage,
            assistant: assistantResponse,
            metadata
        };

        this.memory.conversations.push(conversation);

        // Garder seulement les 100 dernières conversations
        if (this.memory.conversations.length > 100) {
            this.memory.conversations = this.memory.conversations.slice(-50);
        }

        await this.saveMemory();
        return conversation;
    }

    /**
     * Met à jour les préférences
     */
    async updatePreferences(preferences) {
        this.memory.preferences = {
            ...this.memory.preferences,
            ...preferences
        };
        await this.saveMemory();
    }

    /**
     * Met à jour le contexte
     */
    async updateContext(context) {
        this.memory.context = {
            ...this.memory.context,
            ...context
        };
        await this.saveMemory();
    }

    /**
     * Récupère l'historique des générations
     */
    getGenerationHistory(limit = 10) {
        return this.memory.generations.slice(-limit);
    }

    /**
     * Récupère l'historique des conversations
     */
    getConversationHistory(limit = 10) {
        return this.memory.conversations.slice(-limit);
    }

    /**
     * Récupère les statistiques
     */
    getStats() {
        return this.memory.stats;
    }

    /**
     * Récupère les préférences
     */
    getPreferences() {
        return this.memory.preferences;
    }

    /**
     * Récupère le contexte
     */
    getContext() {
        return this.memory.context;
    }

    /**
     * Met à jour les statistiques
     */
    async updateStats(stats) {
        this.memory.stats = {
            ...this.memory.stats,
            ...stats
        };
        await this.saveMemory();
    }

    /**
     * Recherche dans la mémoire
     */
    searchMemory(query, type = 'all') {
        const results = [];

        if (type === 'all' || type === 'conversations') {
            this.memory.conversations.forEach(conv => {
                if (conv.user.toLowerCase().includes(query.toLowerCase()) ||
                    conv.assistant.toLowerCase().includes(query.toLowerCase())) {
                    results.push({ type: 'conversation', ...conv });
                }
            });
        }

        if (type === 'all' || type === 'generations') {
            this.memory.generations.forEach(gen => {
                if (gen.name?.toLowerCase().includes(query.toLowerCase()) ||
                    gen.type?.toLowerCase().includes(query.toLowerCase())) {
                    results.push({ type: 'generation', ...gen });
                }
            });
        }

        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Nettoie la mémoire
     */
    async cleanupMemory() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Nettoyer les conversations anciennes
        this.memory.conversations = this.memory.conversations.filter(
            conv => new Date(conv.timestamp) > thirtyDaysAgo
        );

        // Nettoyer les générations anciennes
        this.memory.generations = this.memory.generations.filter(
            gen => new Date(gen.timestamp) > thirtyDaysAgo
        );

        await this.saveMemory();
    }

    /**
     * Exporte la mémoire
     */
    async exportMemory() {
        const exportData = {
            ...this.memory,
            exportedAt: new Date().toISOString(),
            version: '2.0.0'
        };

        const fileName = `jarvis-memory-export-${Date.now()}.json`;
        await fs.writeFile(fileName, JSON.stringify(exportData, null, 2));
        
        return fileName;
    }

    /**
     * Importe la mémoire
     */
    async importMemory(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const importedMemory = JSON.parse(data);
            
            this.memory = {
                ...this.memory,
                ...importedMemory
            };

            await this.saveMemory();
            return true;
        } catch (error) {
            throw new Error(`Erreur import mémoire: ${error.message}`);
        }
    }

    /**
     * Génère un ID unique
     */
    generateId() {
        return createHash('md5')
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .substring(0, 12);
    }

    /**
     * Enrichit l'analyse avec les générations passées
     */
    async enrichWithPastGenerations(analysis) {
        try {
            const similarGenerations = this.searchMemory(analysis.type || 'component', 'generations');
            if (similarGenerations.length > 0) {
                analysis.similar = similarGenerations.slice(0, 3);
                analysis.confidence = Math.min(0.9, analysis.confidence + 0.1);
            }
            return analysis;
        } catch (error) {
            console.warn('Erreur enrichissement mémoire:', error.message);
            return analysis;
        }
    }

    /**
     * Vérifie si une dépendance est installée
     */
    async checkDependency(dependency) {
        try {
            const packageJson = await fs.readFile('./package.json', 'utf8');
            const pkg = JSON.parse(packageJson);
            return !!(pkg.dependencies?.[dependency] || pkg.devDependencies?.[dependency]);
        } catch {
            return false;
        }
    }

    /**
     * Récupère l'état du projet
     */
    async getProjectState(projectType, techStack) {
        return {
            type: projectType,
            stack: techStack,
            components: [],
            dependencies: {},
            structure: {}
        };
    }

    /**
     * Cache une valeur
     */
    setCache(key, value, ttl = 300000) { // 5 minutes par défaut
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }

    /**
     * Récupère une valeur du cache
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.value;
        }
        this.cache.delete(key);
        return null;
    }

    /**
     * Nettoie le cache expiré
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.expires <= now) {
                this.cache.delete(key);
            }
        }
    }
}

export default MemorySystem;

// Fonctions utilitaires pour l'API
const memoryStore = [];

export function saveToMemory({ prompt, code, title }) {
  const date = new Date().toISOString();
  memoryStore.unshift({ prompt, code, title, date });
}

export function getMemoryHistory() {
  return memoryStore;
}