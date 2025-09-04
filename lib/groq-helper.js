import fetch from 'node-fetch';

class GroqClient {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.model = process.env.GROQ_MODEL || 'llama3-70b-8192';
        this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
        this.timeout = 30000; // 30 seconds timeout
    }

    /**
     * Validate API configuration
     * @returns {boolean} true if valid
     */
    validateConfig() {
        if (!this.apiKey) {
            throw new Error('❌ GROQ_API_KEY non définie dans les variables d\'environnement');
        }
        if (!this.model) {
            throw new Error('❌ Modèle Groq non configuré');
        }
        return true;
    }

    /**
     * Generate code with advanced error handling and retry mechanism
     * @param {string} prompt - The generation prompt
     * @param {string} context - Additional context (file type, framework, etc.)
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<Object>} Generated code and metadata
     */
    async generateCode(prompt, context = '', maxRetries = 2) {
        this.validateConfig();

        const fullPrompt = this.buildPrompt(prompt, context);
        let attempt = 0;

        while (attempt <= maxRetries) {
            try {
                const response = await this.makeApiRequest(fullPrompt);
                const result = this.parseResponse(response);
                
                return {
                    success: true,
                    code: result.code,
                    metadata: result.metadata,
                    model: this.model,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                attempt++;
                
                if (attempt > maxRetries) {
                    console.error(`❌ Échec après ${maxRetries} tentatives`);
                    return {
                        success: false,
                        error: error.message,
                        attempts: attempt
                    };
                }

                console.warn(`⚠️ Tentative ${attempt}/${maxRetries} échouée, réessai...`);
                await this.delay(1000 * attempt); // Exponential backoff
            }
        }
    }

    /**
     * Build optimized prompt for code generation
     * @param {string} prompt - User prompt
     * @param {string} context - Additional context
     * @returns {string} Optimized prompt
     */
    buildPrompt(prompt, context) {
        return `Tu es un expert développeur fullstack. Génère du code ${context} de qualité production.

EXIGENCES STRICTES:
- Code ES6+ moderne et propre
- Commentaires JSDoc pour les fonctions complexes
- Validation des données si nécessaire
- Gestion d'erreurs robuste
- Export/import standards
- Pas de code inutile

CONTEXTE: ${context}

DEMANDE: ${prompt}

FORMAT DE RÉPONSE EXCLUSIF (JSON stricte):
{
    "code": "le code généré ici",
    "language": "javascript|typescript|etc",
    "framework": "react|node|mongodb|etc"
}

Génère UNIQUEMENT le JSON, sans texte additionnel.`;
    }

    /**
     * Make API request with timeout and error handling
     * @param {string} prompt - The prompt to send
     * @returns {Promise<Object>} API response
     */
    async makeApiRequest(prompt) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un assistant codeur expert. Réponds UNIQUEMENT au format JSON demandé.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.2, // Low temperature for deterministic code
                    max_tokens: 4096,
                    response_format: { type: 'json_object' }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Timeout dépassé (${this.timeout}ms)`);
            }
            
            throw error;
        }
    }

    /**
     * Parse and validate API response
     * @param {Object} response - API response
     * @returns {Object} Parsed code and metadata
     */
    parseResponse(response) {
        try {
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Réponse API vide');
            }

            const parsed = JSON.parse(content);
            
            if (!parsed.code) {
                throw new Error('Format de réponse invalide: champ "code" manquant');
            }

            return {
                code: parsed.code,
                metadata: {
                    language: parsed.language || 'javascript',
                    framework: parsed.framework || 'node',
                    model: this.model
                }
            };

        } catch (error) {
            throw new Error(`Erreur parsing réponse: ${error.message}`);
        }
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get available Groq models (static list)
     * @returns {Array} Available models
     */
    static getAvailableModels() {
        return [
            'llama3-70b-8192',
            'llama3-8b-8192', 
            'gemma-7b-it',
            'mixtral-8x7b-32768' // Déprécié mais listé pour info
        ];
    }
}

// Export de la classe
export default GroqClient;