// ==============================================
// 📝 LOGGER - Système de Logging Avancé
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Système de logging intelligent avec niveaux,
// rotation, formatage et intégration monitoring
// ==============================================

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { EventEmitter } from 'events';

/**
 * Système de logging avancé pour Jarvis
 */
export default class Logger extends EventEmitter {
  constructor(context = 'Jarvis', options = {}) {
    super();
    
    this.context = context;
    this.config = {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json', // json, text, structured
      output: ['console', 'file'], // console, file, remote
      logDir: './logs',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enableColors: true,
      enableTimestamp: true,
      enableContext: true,
      enableMetadata: true,
      remoteEndpoint: null,
      ...options
    };
    
    // Niveaux de log avec priorités
    this.levels = {
      error: { priority: 0, color: '\x1b[31m', emoji: '❌' },
      warn: { priority: 1, color: '\x1b[33m', emoji: '⚠️' },
      info: { priority: 2, color: '\x1b[36m', emoji: 'ℹ️' },
      debug: { priority: 3, color: '\x1b[35m', emoji: '🔍' },
      trace: { priority: 4, color: '\x1b[37m', emoji: '🔬' }
    };
    
    // État interne
    this.state = {
      isInitialized: false,
      fileStream: null,
      buffer: [],
      stats: {
        totalLogs: 0,
        errorCount: 0,
        warnCount: 0,
        lastError: null,
        startTime: Date.now()
      }
    };
    
    this.initialize();
  }
  
  /**
   * Initialisation du logger
   */
  async initialize() {
    try {
      // Création du répertoire de logs
      await this.ensureLogDirectory();
      
      // Configuration du stream de fichier
      if (this.config.output.includes('file')) {
        await this.setupFileLogging();
      }
      
      // Configuration du logging distant
      if (this.config.remoteEndpoint) {
        await this.setupRemoteLogging();
      }
      
      this.state.isInitialized = true;
      this.info('Logger initialisé', { context: this.context, config: this.config });
      
    } catch (error) {
      console.error('❌ Erreur initialisation logger:', error);
    }
  }
  
  /**
   * Log niveau ERROR
   */
  error(message, metadata = {}, error = null) {
    this.log('error', message, { ...metadata, error: error?.stack || error });
    this.state.stats.errorCount++;
    this.state.stats.lastError = { message, timestamp: Date.now(), error };
  }
  
  /**
   * Log niveau WARN
   */
  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
    this.state.stats.warnCount++;
  }
  
  /**
   * Log niveau INFO
   */
  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }
  
  /**
   * Log niveau DEBUG
   */
  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
  }
  
  /**
   * Log niveau TRACE
   */
  trace(message, metadata = {}) {
    this.log('trace', message, metadata);
  }
  
  /**
   * Méthode de log principale
   */
  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = this.createLogEntry(level, message, metadata);
    
    // Mise à jour des statistiques
    this.state.stats.totalLogs++;
    
    // Sortie vers les différents outputs
    if (this.config.output.includes('console')) {
      this.logToConsole(logEntry);
    }
    
    if (this.config.output.includes('file') && this.state.fileStream) {
      this.logToFile(logEntry);
    }
    
    if (this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }
    
    // Émission d'événement pour les listeners
    this.emit('log', logEntry);
    
    // Émission d'événement spécifique au niveau
    this.emit(level, logEntry);
  }
  
  /**
   * Vérification si le niveau doit être loggé
   */
  shouldLog(level) {
    const currentLevelPriority = this.levels[this.config.level]?.priority ?? 2;
    const logLevelPriority = this.levels[level]?.priority ?? 2;
    
    return logLevelPriority <= currentLevelPriority;
  }
  
  /**
   * Création d'une entrée de log
   */
  createLogEntry(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const levelInfo = this.levels[level] || this.levels.info;
    
    const baseEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      message,
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'localhost'
    };
    
    // Ajout des métadonnées si activé
    if (this.config.enableMetadata && Object.keys(metadata).length > 0) {
      baseEntry.metadata = metadata;
    }
    
    // Ajout d'informations système
    if (level === 'error' || level === 'warn') {
      baseEntry.system = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        version: process.version
      };
    }
    
    return baseEntry;
  }
  
  /**
   * Log vers la console
   */
  logToConsole(logEntry) {
    const levelInfo = this.levels[logEntry.level.toLowerCase()];
    const color = this.config.enableColors ? levelInfo.color : '';
    const reset = this.config.enableColors ? '\x1b[0m' : '';
    const emoji = levelInfo.emoji;
    
    let output = '';
    
    if (this.config.format === 'json') {
      output = JSON.stringify(logEntry);
    } else if (this.config.format === 'structured') {
      output = this.formatStructured(logEntry);
    } else {
      // Format texte simple
      output = `${emoji} [${logEntry.timestamp}] ${logEntry.level} [${logEntry.context}]: ${logEntry.message}`;
      
      if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
        output += ` ${JSON.stringify(logEntry.metadata)}`;
      }
    }
    
    console.log(`${color}${output}${reset}`);
  }
  
  /**
   * Log vers fichier
   */
  logToFile(logEntry) {
    if (!this.state.fileStream) return;
    
    const logLine = JSON.stringify(logEntry) + '\n';
    this.state.fileStream.write(logLine);
    
    // Vérification de la taille du fichier pour rotation
    this.checkFileRotation();
  }
  
  /**
   * Log vers endpoint distant
   */
  async logToRemote(logEntry) {
    try {
      // Buffer pour éviter de surcharger l'endpoint
      this.state.buffer.push(logEntry);
      
      // Envoi par batch
      if (this.state.buffer.length >= 10) {
        await this.flushRemoteBuffer();
      }
      
    } catch (error) {
      // Éviter la récursion infinie en cas d'erreur de logging
      console.error('Erreur logging distant:', error.message);
    }
  }
  
  /**
   * Formatage structuré
   */
  formatStructured(logEntry) {
    const parts = [
      `[${logEntry.timestamp}]`,
      `${logEntry.level.padEnd(5)}`,
      `[${logEntry.context}]`,
      logEntry.message
    ];
    
    let formatted = parts.join(' ');
    
    if (logEntry.metadata) {
      const metadataStr = Object.entries(logEntry.metadata)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');
      
      if (metadataStr) {
        formatted += ` | ${metadataStr}`;
      }
    }
    
    return formatted;
  }
  
  /**
   * Configuration du logging vers fichier
   */
  async setupFileLogging() {
    const logFile = path.join(this.config.logDir, `${this.context.toLowerCase()}.log`);
    
    this.state.fileStream = createWriteStream(logFile, { flags: 'a' });
    
    this.state.fileStream.on('error', (error) => {
      console.error('❌ Erreur stream de log:', error);
    });
  }
  
  /**
   * Vérification et rotation des fichiers de log
   */
  async checkFileRotation() {
    try {
      const logFile = path.join(this.config.logDir, `${this.context.toLowerCase()}.log`);
      const stats = await fs.stat(logFile);
      
      if (stats.size > this.config.maxFileSize) {
        await this.rotateLogFile();
      }
      
    } catch (error) {
      // Fichier n'existe pas encore
    }
  }
  
  /**
   * Rotation des fichiers de log
   */
  async rotateLogFile() {
    try {
      const logFile = path.join(this.config.logDir, `${this.context.toLowerCase()}.log`);
      
      // Fermeture du stream actuel
      if (this.state.fileStream) {
        this.state.fileStream.end();
      }
      
      // Rotation des fichiers existants
      for (let i = this.config.maxFiles - 1; i > 0; i--) {
        const oldFile = `${logFile}.${i}`;
        const newFile = `${logFile}.${i + 1}`;
        
        try {
          await fs.rename(oldFile, newFile);
        } catch (error) {
          // Fichier n'existe pas, c'est normal
        }
      }
      
      // Déplacement du fichier actuel
      await fs.rename(logFile, `${logFile}.1`);
      
      // Création d'un nouveau stream
      await this.setupFileLogging();
      
      this.info('Rotation des logs effectuée', { 
        maxSize: this.config.maxFileSize,
        maxFiles: this.config.maxFiles 
      });
      
    } catch (error) {
      console.error('❌ Erreur rotation logs:', error);
    }
  }
  
  /**
   * Configuration du logging distant
   */
  async setupRemoteLogging() {
    // Configuration pour envoyer les logs vers un service externe
    // (Elasticsearch, Logstash, service cloud, etc.)
    
    // Flush périodique du buffer
    setInterval(() => {
      if (this.state.buffer.length > 0) {
        this.flushRemoteBuffer();
      }
    }, 30000); // Toutes les 30 secondes
  }
  
  /**
   * Vidage du buffer distant
   */
  async flushRemoteBuffer() {
    if (this.state.buffer.length === 0) return;
    
    const logs = [...this.state.buffer];
    this.state.buffer = [];
    
    try {
      // Envoi vers l'endpoint distant
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOG_TOKEN || ''}`
        },
        body: JSON.stringify({ logs })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      // Remettre les logs dans le buffer en cas d'erreur
      this.state.buffer.unshift(...logs);
      console.error('❌ Erreur envoi logs distants:', error.message);
    }
  }
  
  /**
   * Création du répertoire de logs
   */
  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.config.logDir, { recursive: true });
    } catch (error) {
      console.error('❌ Erreur création répertoire logs:', error);
    }
  }
  
  /**
   * Méthodes utilitaires
   */
  
  /**
   * Changement du niveau de log à chaud
   */
  setLevel(level) {
    if (this.levels[level]) {
      this.config.level = level;
      this.info(`Niveau de log changé: ${level}`);
    } else {
      this.warn(`Niveau de log invalide: ${level}`);
    }
  }
  
  /**
   * Ajout d'un output
   */
  addOutput(output) {
    if (!this.config.output.includes(output)) {
      this.config.output.push(output);
      this.info(`Output ajouté: ${output}`);
    }
  }
  
  /**
   * Suppression d'un output
   */
  removeOutput(output) {
    const index = this.config.output.indexOf(output);
    if (index > -1) {
      this.config.output.splice(index, 1);
      this.info(`Output supprimé: ${output}`);
    }
  }
  
  /**
   * Obtention des statistiques
   */
  getStats() {
    return {
      ...this.state.stats,
      uptime: Date.now() - this.state.stats.startTime,
      level: this.config.level,
      outputs: this.config.output,
      bufferSize: this.state.buffer.length
    };
  }
  
  /**
   * Nettoyage des logs anciens
   */
  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 jours par défaut
    try {
      const files = await fs.readdir(this.config.logDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.config.logDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          this.info(`Fichier de log supprimé: ${file}`, { age: now - stats.mtime.getTime() });
        }
      }
      
    } catch (error) {
      this.error('Erreur nettoyage logs', {}, error);
    }
  }
  
  /**
   * Recherche dans les logs
   */
  async search(query, options = {}) {
    const {
      level = null,
      startDate = null,
      endDate = null,
      limit = 100
    } = options;
    
    try {
      const logFile = path.join(this.config.logDir, `${this.context.toLowerCase()}.log`);
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      let results = [];
      
      for (const line of lines) {
        try {
          const logEntry = JSON.parse(line);
          
          // Filtrage par niveau
          if (level && logEntry.level.toLowerCase() !== level.toLowerCase()) {
            continue;
          }
          
          // Filtrage par date
          const logDate = new Date(logEntry.timestamp);
          if (startDate && logDate < startDate) continue;
          if (endDate && logDate > endDate) continue;
          
          // Recherche textuelle
          const searchText = JSON.stringify(logEntry).toLowerCase();
          if (searchText.includes(query.toLowerCase())) {
            results.push(logEntry);
          }
          
          if (results.length >= limit) break;
          
        } catch (error) {
          // Ligne invalide, ignorer
        }
      }
      
      return results;
      
    } catch (error) {
      this.error('Erreur recherche logs', {}, error);
      return [];
    }
  }
  
  /**
   * Export des logs
   */
  async export(format = 'json', options = {}) {
    const {
      startDate = null,
      endDate = null,
      level = null
    } = options;
    
    try {
      const logs = await this.search('', { startDate, endDate, level, limit: 10000 });
      
      switch (format) {
        case 'json':
          return JSON.stringify(logs, null, 2);
        
        case 'csv':
          return this.exportToCSV(logs);
        
        case 'txt':
          return logs.map(log => 
            `[${log.timestamp}] ${log.level} [${log.context}]: ${log.message}`
          ).join('\n');
        
        default:
          throw new Error(`Format d'export non supporté: ${format}`);
      }
      
    } catch (error) {
      this.error('Erreur export logs', {}, error);
      throw error;
    }
  }
  
  /**
   * Export CSV
   */
  exportToCSV(logs) {
    const headers = ['timestamp', 'level', 'context', 'message', 'metadata'];
    const csvLines = [headers.join(',')];
    
    for (const log of logs) {
      const row = [
        log.timestamp,
        log.level,
        log.context,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.metadata || {}).replace(/"/g, '""')}"`
      ];
      csvLines.push(row.join(','));
    }
    
    return csvLines.join('\n');
  }
  
  /**
   * Fermeture propre du logger
   */
  async close() {
    try {
      // Vidage du buffer distant
      if (this.state.buffer.length > 0) {
        await this.flushRemoteBuffer();
      }
      
      // Fermeture du stream de fichier
      if (this.state.fileStream) {
        this.state.fileStream.end();
      }
      
      this.info('Logger fermé proprement');
      
    } catch (error) {
      console.error('❌ Erreur fermeture logger:', error);
    }
  }
}

