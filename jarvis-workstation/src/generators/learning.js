// ==============================================
// 🎓 JARVIS LEARNING - Système d'Apprentissage
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Système d'apprentissage automatique pour améliorer
// les performances et la précision de Jarvis au fil du temps
// ==============================================

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import Logger from '../utils/logger.js';

/**
 * Système d'apprentissage automatique de Jarvis
 * Analyse les patterns, apprend des succès/échecs et optimise les stratégies
 */
export default class LearningSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      learningRate: 0.1,
      memoryWindow: 1000, // Nombre d'expériences à retenir
      adaptationThreshold: 0.8,
      patternMinOccurrence: 5,
      dataPath: './data/learning',
      ...config
    };
    
    this.logger = new Logger('LearningSystem');
    
    // Base de connaissances
    this.knowledge = {
      patterns: new Map(), // Patterns identifiés
      strategies: new Map(), // Efficacité des stratégies
      contexts: new Map(), // Contextes d'utilisation
      failures: new Map(), // Analyse des échecs
      optimizations: new Map() // Optimisations découvertes
    };
    
    // Historique d'apprentissage
    this.history = {
      experiences: [],
      adaptations: [],
      improvements: []
    };
    
    // Métriques d'apprentissage
    this.metrics = {
      totalLearningEvents: 0,
      successfulAdaptations: 0,
      patternsDiscovered: 0,
      averageImprovement: 0
    };
    
    this.isInitialized = false;
  }
  
  /**
   * Initialisation du système d'apprentissage
   */
  async initialize() {
    try {
      this.logger.info('🎓 Initialisation du système d\'apprentissage...');
      
      // Création du répertoire de données
      await this.ensureDataDirectory();
      
      // Chargement des connaissances existantes
      await this.loadKnowledge();
      
      // Chargement de l'historique
      await this.loadHistory();
      
      // Analyse des patterns existants
      await this.analyzeExistingPatterns();
      
      this.isInitialized = true;
      this.logger.info('✅ Système d\'apprentissage initialisé');
      
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }
  
  /**
   * Apprentissage à partir d'une exécution réussie
   */
  async learnFromExecution(request, result, analysis) {
    try {
      this.logger.debug('📚 Apprentissage à partir de l\'exécution...');
      
      const experience = {
        id: this.generateExperienceId(),
        timestamp: Date.now(),
        request,
        result,
        analysis,
        success: true,
        quality: result.validation?.quality || 0.8,
        responseTime: result.metadata?.responseTime || 0,
        strategy: result.strategy
      };
      
      // Ajout à l'historique
      this.addExperience(experience);
      
      // Analyse des patterns
      await this.analyzePatterns(experience);
      
      // Mise à jour de l'efficacité des stratégies
      await this.updateStrategyEffectiveness(experience);
      
      // Identification d'optimisations potentielles
      await this.identifyOptimizations(experience);
      
      // Adaptation si nécessaire
      await this.adaptBehavior(experience);
      
      this.metrics.totalLearningEvents++;
      
      this.emit('learned', { experience, type: 'success' });
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'apprentissage:', error);
    }
  }
  
  /**
   * Apprentissage à partir d'un échec
   */
  async learnFromFailure(request, error) {
    try {
      this.logger.debug('🔍 Apprentissage à partir de l\'échec...');
      
      const experience = {
        id: this.generateExperienceId(),
        timestamp: Date.now(),
        request,
        error: {
          message: error.message,
          type: error.constructor.name,
          stack: error.stack
        },
        success: false,
        quality: 0
      };
      
      // Ajout à l'historique
      this.addExperience(experience);
      
      // Analyse de l'échec
      await this.analyzeFailure(experience);
      
      // Identification des causes
      await this.identifyFailureCauses(experience);
      
      // Proposition de solutions
      await this.proposeSolutions(experience);
      
      this.metrics.totalLearningEvents++;
      
      this.emit('learned', { experience, type: 'failure' });
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'apprentissage d\'échec:', error);
    }
  }
  
  /**
   * Sélection de la meilleure stratégie basée sur l'apprentissage
   */
  async selectBestStrategy(strategies, analysis) {
    try {
      const scores = new Map();
      
      for (const strategy of strategies) {
        const score = await this.calculateStrategyScore(strategy, analysis);
        scores.set(strategy.name, { strategy, score });
      }
      
      // Tri par score décroissant
      const sortedStrategies = Array.from(scores.values())
        .sort((a, b) => b.score - a.score);
      
      const bestStrategy = sortedStrategies[0]?.strategy;
      
      if (bestStrategy) {
        this.logger.debug(`🎯 Meilleure stratégie sélectionnée: ${bestStrategy.name}`);
      }
      
      return bestStrategy;
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de la sélection de stratégie:', error);
      return strategies[0]; // Stratégie par défaut
    }
  }
  
  /**
   * Calcul du score d'une stratégie
   */
  async calculateStrategyScore(strategy, analysis) {
    const strategyData = this.knowledge.strategies.get(strategy.name) || {
      successRate: 0.5,
      averageQuality: 0.5,
      averageTime: 5000,
      usageCount: 0
    };
    
    // Score basé sur le taux de succès
    let score = strategyData.successRate * 0.4;
    
    // Score basé sur la qualité moyenne
    score += strategyData.averageQuality * 0.3;
    
    // Score basé sur la vitesse (inversé)
    const timeScore = Math.max(0, 1 - (strategyData.averageTime / 10000));
    score += timeScore * 0.2;
    
    // Bonus pour l'expérience
    const experienceBonus = Math.min(0.1, strategyData.usageCount / 100);
    score += experienceBonus;
    
    // Adaptation contextuelle
    const contextScore = await this.calculateContextualScore(strategy, analysis);
    score += contextScore * 0.1;
    
    return Math.min(1.0, score);
  }
  
  /**
   * Calcul du score contextuel
   */
  async calculateContextualScore(strategy, analysis) {
    const contextKey = `${strategy.name}_${analysis.domain}_${Math.floor(analysis.complexity * 10)}`;
    const contextData = this.knowledge.contexts.get(contextKey);
    
    if (!contextData) return 0.5;
    
    return contextData.successRate || 0.5;
  }
  
  /**
   * Analyse des patterns dans les expériences
   */
  async analyzePatterns(experience) {
    try {
      // Pattern basé sur le type de requête
      const requestPattern = this.extractRequestPattern(experience.request);
      this.updatePattern('request', requestPattern, experience);
      
      // Pattern basé sur le contexte
      const contextPattern = this.extractContextPattern(experience.analysis);
      this.updatePattern('context', contextPattern, experience);
      
      // Pattern basé sur la stratégie utilisée
      const strategyPattern = this.extractStrategyPattern(experience);
      this.updatePattern('strategy', strategyPattern, experience);
      
      // Pattern temporel
      const temporalPattern = this.extractTemporalPattern(experience);
      this.updatePattern('temporal', temporalPattern, experience);
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'analyse des patterns:', error);
    }
  }
  
  /**
   * Extraction du pattern de requête
   */
  extractRequestPattern(request) {
    return {
      type: request.type,
      complexity: request.complexity || 'medium',
      domain: request.domain || 'general',
      hasCustomRequirements: !!(request.customRequirements?.length),
      dependencyCount: request.dependencies?.length || 0
    };
  }
  
  /**
   * Extraction du pattern de contexte
   */
  extractContextPattern(analysis) {
    return {
      domain: analysis.domain,
      complexity: Math.floor(analysis.complexity * 10) / 10,
      hasSimular: analysis.similar?.length > 0,
      confidence: Math.floor(analysis.confidence * 10) / 10
    };
  }
  
  /**
   * Extraction du pattern de stratégie
   */
  extractStrategyPattern(experience) {
    return {
      strategy: experience.strategy,
      success: experience.success,
      quality: Math.floor(experience.quality * 10) / 10,
      responseTime: Math.floor(experience.responseTime / 1000) * 1000 // Arrondi à la seconde
    };
  }
  
  /**
   * Extraction du pattern temporel
   */
  extractTemporalPattern(experience) {
    const date = new Date(experience.timestamp);
    return {
      hour: date.getHours(),
      dayOfWeek: date.getDay(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    };
  }
  
  /**
   * Mise à jour d'un pattern
   */
  updatePattern(category, pattern, experience) {
    const patternKey = `${category}_${JSON.stringify(pattern)}`;
    
    if (!this.knowledge.patterns.has(patternKey)) {
      this.knowledge.patterns.set(patternKey, {
        pattern,
        category,
        occurrences: 0,
        successRate: 0,
        averageQuality: 0,
        averageTime: 0,
        firstSeen: experience.timestamp,
        lastSeen: experience.timestamp
      });
    }
    
    const patternData = this.knowledge.patterns.get(patternKey);
    patternData.occurrences++;
    patternData.lastSeen = experience.timestamp;
    
    if (experience.success) {
      patternData.successRate = ((patternData.successRate * (patternData.occurrences - 1)) + 1) / patternData.occurrences;
      patternData.averageQuality = ((patternData.averageQuality * (patternData.occurrences - 1)) + experience.quality) / patternData.occurrences;
      patternData.averageTime = ((patternData.averageTime * (patternData.occurrences - 1)) + experience.responseTime) / patternData.occurrences;
    } else {
      patternData.successRate = (patternData.successRate * (patternData.occurrences - 1)) / patternData.occurrences;
    }
    
    // Découverte de nouveau pattern significatif
    if (patternData.occurrences === this.config.patternMinOccurrence) {
      this.metrics.patternsDiscovered++;
      this.emit('patternDiscovered', { pattern: patternData });
    }
  }
  
  /**
   * Mise à jour de l'efficacité des stratégies
   */
  async updateStrategyEffectiveness(experience) {
    const strategyName = experience.strategy;
    
    if (!this.knowledge.strategies.has(strategyName)) {
      this.knowledge.strategies.set(strategyName, {
        successRate: 0,
        averageQuality: 0,
        averageTime: 0,
        usageCount: 0,
        lastUsed: experience.timestamp
      });
    }
    
    const strategyData = this.knowledge.strategies.get(strategyName);
    strategyData.usageCount++;
    strategyData.lastUsed = experience.timestamp;
    
    // Mise à jour des métriques avec moyenne mobile
    const alpha = this.config.learningRate;
    
    if (experience.success) {
      strategyData.successRate = (1 - alpha) * strategyData.successRate + alpha * 1;
      strategyData.averageQuality = (1 - alpha) * strategyData.averageQuality + alpha * experience.quality;
    } else {
      strategyData.successRate = (1 - alpha) * strategyData.successRate + alpha * 0;
    }
    
    strategyData.averageTime = (1 - alpha) * strategyData.averageTime + alpha * experience.responseTime;
  }
  
  /**
   * Identification d'optimisations potentielles
   */
  async identifyOptimizations(experience) {
    // Optimisation basée sur la vitesse
    if (experience.responseTime > 5000 && experience.quality > 0.8) {
      const optimizationKey = `speed_${experience.strategy}`;
      this.recordOptimization(optimizationKey, {
        type: 'speed',
        strategy: experience.strategy,
        suggestion: 'Considérer une approche plus directe pour ce type de requête',
        impact: 'high'
      });
    }
    
    // Optimisation basée sur la qualité
    if (experience.quality < 0.6 && experience.success) {
      const optimizationKey = `quality_${experience.strategy}`;
      this.recordOptimization(optimizationKey, {
        type: 'quality',
        strategy: experience.strategy,
        suggestion: 'Ajouter une étape de validation supplémentaire',
        impact: 'medium'
      });
    }
    
    // Optimisation basée sur les patterns
    await this.identifyPatternOptimizations(experience);
  }
  
  /**
   * Identification d'optimisations basées sur les patterns
   */
  async identifyPatternOptimizations(experience) {
    const similarExperiences = this.findSimilarExperiences(experience, 10);
    
    if (similarExperiences.length >= 5) {
      const averageQuality = similarExperiences.reduce((sum, exp) => sum + exp.quality, 0) / similarExperiences.length;
      const averageTime = similarExperiences.reduce((sum, exp) => sum + exp.responseTime, 0) / similarExperiences.length;
      
      if (averageQuality > 0.9 && averageTime < 3000) {
        const optimizationKey = `pattern_${experience.request.type}`;
        this.recordOptimization(optimizationKey, {
          type: 'pattern',
          pattern: experience.request.type,
          suggestion: 'Ce pattern est très efficace, le prioriser',
          impact: 'high'
        });
      }
    }
  }
  
  /**
   * Enregistrement d'une optimisation
   */
  recordOptimization(key, optimization) {
    if (!this.knowledge.optimizations.has(key)) {
      this.knowledge.optimizations.set(key, {
        ...optimization,
        discovered: Date.now(),
        confidence: 0.1,
        applied: false
      });
    } else {
      const existing = this.knowledge.optimizations.get(key);
      existing.confidence = Math.min(1.0, existing.confidence + 0.1);
    }
  }
  
  /**
   * Analyse d'un échec
   */
  async analyzeFailure(experience) {
    const failureKey = `${experience.error.type}_${experience.request.type}`;
    
    if (!this.knowledge.failures.has(failureKey)) {
      this.knowledge.failures.set(failureKey, {
        errorType: experience.error.type,
        requestType: experience.request.type,
        occurrences: 0,
        patterns: [],
        solutions: []
      });
    }
    
    const failureData = this.knowledge.failures.get(failureKey);
    failureData.occurrences++;
    
    // Analyse du pattern d'échec
    const failurePattern = {
      message: experience.error.message,
      timestamp: experience.timestamp,
      request: experience.request
    };
    
    failureData.patterns.push(failurePattern);
    
    // Limitation de l'historique
    if (failureData.patterns.length > 50) {
      failureData.patterns = failureData.patterns.slice(-50);
    }
  }
  
  /**
   * Identification des causes d'échec
   */
  async identifyFailureCauses(experience) {
    const causes = [];
    
    // Analyse du message d'erreur
    const errorMessage = experience.error.message.toLowerCase();
    
    if (errorMessage.includes('timeout')) {
      causes.push({
        type: 'timeout',
        probability: 0.9,
        suggestion: 'Augmenter le timeout ou optimiser la requête'
      });
    }
    
    if (errorMessage.includes('syntax')) {
      causes.push({
        type: 'syntax',
        probability: 0.8,
        suggestion: 'Améliorer la validation syntaxique'
      });
    }
    
    if (errorMessage.includes('api') || errorMessage.includes('network')) {
      causes.push({
        type: 'network',
        probability: 0.7,
        suggestion: 'Implémenter un mécanisme de retry'
      });
    }
    
    // Stockage des causes identifiées
    const failureKey = `${experience.error.type}_${experience.request.type}`;
    const failureData = this.knowledge.failures.get(failureKey);
    if (failureData) {
      failureData.causes = causes;
    }
    
    return causes;
  }
  
  /**
   * Proposition de solutions
   */
  async proposeSolutions(experience) {
    const causes = await this.identifyFailureCauses(experience);
    const solutions = [];
    
    for (const cause of causes) {
      switch (cause.type) {
        case 'timeout':
          solutions.push({
            type: 'configuration',
            action: 'increase_timeout',
            priority: 'high'
          });
          break;
        case 'syntax':
          solutions.push({
            type: 'validation',
            action: 'enhance_syntax_check',
            priority: 'medium'
          });
          break;
        case 'network':
          solutions.push({
            type: 'resilience',
            action: 'implement_retry',
            priority: 'high'
          });
          break;
      }
    }
    
    return solutions;
  }
  
  /**
   * Adaptation du comportement
   */
  async adaptBehavior(experience) {
    // Adaptation basée sur les optimisations découvertes
    const applicableOptimizations = Array.from(this.knowledge.optimizations.values())
      .filter(opt => opt.confidence > this.config.adaptationThreshold && !opt.applied);
    
    for (const optimization of applicableOptimizations) {
      await this.applyOptimization(optimization);
    }
  }
  
  /**
   * Application d'une optimisation
   */
  async applyOptimization(optimization) {
    this.logger.info(`🔧 Application de l'optimisation: ${optimization.type}`);
    
    // Marquer comme appliquée
    optimization.applied = true;
    optimization.appliedAt = Date.now();
    
    // Enregistrer l'adaptation
    this.history.adaptations.push({
      timestamp: Date.now(),
      optimization,
      success: true // Sera mis à jour lors de l'évaluation
    });
    
    this.metrics.successfulAdaptations++;
    
    this.emit('optimizationApplied', { optimization });
  }
  
  /**
   * Recherche d'expériences similaires
   */
  findSimilarExperiences(targetExperience, limit = 5) {
    return this.history.experiences
      .filter(exp => exp.id !== targetExperience.id)
      .map(exp => ({
        ...exp,
        similarity: this.calculateSimilarity(targetExperience, exp)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  /**
   * Calcul de similarité entre expériences
   */
  calculateSimilarity(exp1, exp2) {
    let similarity = 0;
    
    // Similarité du type de requête
    if (exp1.request.type === exp2.request.type) similarity += 0.3;
    
    // Similarité du domaine
    if (exp1.analysis?.domain === exp2.analysis?.domain) similarity += 0.2;
    
    // Similarité de la complexité
    const complexityDiff = Math.abs((exp1.analysis?.complexity || 0) - (exp2.analysis?.complexity || 0));
    similarity += (1 - complexityDiff) * 0.2;
    
    // Similarité de la stratégie
    if (exp1.strategy === exp2.strategy) similarity += 0.2;
    
    // Similarité temporelle (bonus pour les expériences récentes)
    const timeDiff = Math.abs(exp1.timestamp - exp2.timestamp);
    const timeBonus = Math.max(0, 1 - (timeDiff / (7 * 24 * 60 * 60 * 1000))); // 7 jours
    similarity += timeBonus * 0.1;
    
    return similarity;
  }
  
  /**
   * Ajout d'une expérience à l'historique
   */
  addExperience(experience) {
    this.history.experiences.push(experience);
    
    // Limitation de la taille de l'historique
    if (this.history.experiences.length > this.config.memoryWindow) {
      this.history.experiences = this.history.experiences.slice(-this.config.memoryWindow);
    }
  }
  
  /**
   * Génération d'un ID d'expérience
   */
  generateExperienceId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Sauvegarde de l'état d'apprentissage
   */
  async saveState() {
    try {
      await this.saveKnowledge();
      await this.saveHistory();
      await this.saveMetrics();
      
      this.logger.debug('💾 État d\'apprentissage sauvegardé');
      
    } catch (error) {
      this.logger.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }
  
  /**
   * Sauvegarde des connaissances
   */
  async saveKnowledge() {
    const knowledgeData = {
      patterns: Array.from(this.knowledge.patterns.entries()),
      strategies: Array.from(this.knowledge.strategies.entries()),
      contexts: Array.from(this.knowledge.contexts.entries()),
      failures: Array.from(this.knowledge.failures.entries()),
      optimizations: Array.from(this.knowledge.optimizations.entries())
    };
    
    const filePath = path.join(this.config.dataPath, 'knowledge.json');
    await fs.writeFile(filePath, JSON.stringify(knowledgeData, null, 2));
  }
  
  /**
   * Sauvegarde de l'historique
   */
  async saveHistory() {
    const filePath = path.join(this.config.dataPath, 'history.json');
    await fs.writeFile(filePath, JSON.stringify(this.history, null, 2));
  }
  
  /**
   * Sauvegarde des métriques
   */
  async saveMetrics() {
    const filePath = path.join(this.config.dataPath, 'metrics.json');
    await fs.writeFile(filePath, JSON.stringify(this.metrics, null, 2));
  }
  
  /**
   * Chargement des connaissances
   */
  async loadKnowledge() {
    try {
      const filePath = path.join(this.config.dataPath, 'knowledge.json');
      const data = await fs.readFile(filePath, 'utf8');
      const knowledgeData = JSON.parse(data);
      
      this.knowledge.patterns = new Map(knowledgeData.patterns || []);
      this.knowledge.strategies = new Map(knowledgeData.strategies || []);
      this.knowledge.contexts = new Map(knowledgeData.contexts || []);
      this.knowledge.failures = new Map(knowledgeData.failures || []);
      this.knowledge.optimizations = new Map(knowledgeData.optimizations || []);
      
    } catch (error) {
      // Fichier n'existe pas encore, c'est normal pour la première utilisation
      this.logger.debug('Aucune connaissance existante trouvée, démarrage à zéro');
    }
  }
  
  /**
   * Chargement de l'historique
   */
  async loadHistory() {
    try {
      const filePath = path.join(this.config.dataPath, 'history.json');
      const data = await fs.readFile(filePath, 'utf8');
      this.history = JSON.parse(data);
      
    } catch (error) {
      this.logger.debug('Aucun historique existant trouvé, démarrage à zéro');
    }
  }
  
  /**
   * Analyse des patterns existants
   */
  async analyzeExistingPatterns() {
    const significantPatterns = Array.from(this.knowledge.patterns.values())
      .filter(pattern => pattern.occurrences >= this.config.patternMinOccurrence)
      .sort((a, b) => b.successRate - a.successRate);
    
    this.logger.info(`📊 ${significantPatterns.length} patterns significatifs identifiés`);
    
    // Émission des patterns les plus performants
    significantPatterns.slice(0, 5).forEach(pattern => {
      this.emit('significantPattern', { pattern });
    });
  }
  
  /**
   * Assurance de l'existence du répertoire de données
   */
  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.config.dataPath, { recursive: true });
    } catch (error) {
      // Le répertoire existe déjà
    }
  }
  
  /**
   * Obtention des statistiques d'apprentissage
   */
  getStats() {
    return {
      metrics: this.metrics,
      knowledge: {
        patterns: this.knowledge.patterns.size,
        strategies: this.knowledge.strategies.size,
        contexts: this.knowledge.contexts.size,
        failures: this.knowledge.failures.size,
        optimizations: this.knowledge.optimizations.size
      },
      history: {
        experiences: this.history.experiences.length,
        adaptations: this.history.adaptations.length,
        improvements: this.history.improvements.length
      }
    };
  }
  
  /**
   * Réinitialisation de l'apprentissage
   */
  async reset() {
    this.logger.warn('🔄 Réinitialisation du système d\'apprentissage...');
    
    this.knowledge = {
      patterns: new Map(),
      strategies: new Map(),
      contexts: new Map(),
      failures: new Map(),
      optimizations: new Map()
    };
    
    this.history = {
      experiences: [],
      adaptations: [],
      improvements: []
    };
    
    this.metrics = {
      totalLearningEvents: 0,
      successfulAdaptations: 0,
      patternsDiscovered: 0,
      averageImprovement: 0
    };
    
    await this.saveState();
    
    this.emit('reset');
  }
}

