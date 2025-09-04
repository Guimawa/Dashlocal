#!/usr/bin/env node

// ==============================================
// 📊 JARVIS DASHBOARD - Interface de Monitoring
// ==============================================
// Version: 2.0.0 Ultra Instinct
// Auteur: Jarvis Expert
// Description: Dashboard web pour monitorer et contrôler Jarvis
// avec métriques en temps réel, logs et interface d'administration
// ==============================================

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import JarvisBrain from "./src/core/brain.js";
import MemorySystem from "./src/core/memory.js";
import LearningSystem from "./src/core/learning.js";
import Logger from "./src/core/logger.js";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classe principale du Dashboard Jarvis
 */
class JarvisDashboard {
  constructor(config = {}) {
    this.config = {
      port: process.env.PORT || 3000,
      host: "0.0.0.0",
      enableRealTimeMetrics: true,
      enableLogs: true,
      enableAPI: true,
      maxLogEntries: 1000,
      metricsInterval: 5000, // 5 secondes
      ...config,
    };

    // Initialisation Express
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Systèmes Jarvis
    this.brain = new JarvisBrain();
    this.memory = new MemorySystem();
    this.learning = new LearningSystem();
    this.logger = new Logger("Dashboard");

    // État du dashboard
    this.state = {
      isRunning: false,
      connectedClients: 0,
      startTime: null,
      metrics: {
        requests: 0,
        errors: 0,
        averageResponseTime: 0,
        systemLoad: 0,
        memoryUsage: 0,
      },
      logs: [],
      activeConnections: new Set(),
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupSocketIO();
    this.setupEventListeners();
  }

  /**
   * Configuration des middlewares Express
   */
  setupMiddleware() {
    // Sécurité
    this.app.use(
      helmet({
        contentSecurityPolicy: false, // Désactivé pour le développement
      }),
    );

    // CORS
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      }),
    );

    // Compression
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limite chaque IP à 100 requêtes par fenêtre
    });
    this.app.use("/api/", limiter);

    // Parsing JSON
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    // Fichiers statiques
    this.app.use(express.static(path.join(__dirname, "public")));

    // Logging des requêtes
    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on("finish", () => {
        const duration = Date.now() - start;
        this.logRequest(req, res, duration);
      });

      next();
    });
  }

  /**
   * Configuration des routes
   */
  setupRoutes() {
    // Route principale - Interface web
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "dashboard.html"));
    });

    // API Routes
    if (this.config.enableAPI) {
      this.setupAPIRoutes();
    }

    // Route de santé
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        uptime: Date.now() - (this.state.startTime || Date.now()),
        version: "2.0.0",
        brain: this.brain.getStatus(),
        memory: this.state.metrics.memoryUsage,
        connections: this.state.connectedClients,
      });
    });

    // Gestion des erreurs 404
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Route non trouvée",
        path: req.originalUrl,
      });
    });

    // Gestionnaire d'erreurs global
    this.app.use((error, req, res, next) => {
      this.logger.error("Erreur Express:", error);

      res.status(500).json({
        error: "Erreur interne du serveur",
        message: error.message,
      });
    });
  }

  /**
   * Configuration des routes API
   */
  setupAPIRoutes() {
    const apiRouter = express.Router();

    // Métriques système
    apiRouter.get("/metrics", (req, res) => {
      res.json({
        system: this.getSystemMetrics(),
        brain: this.brain.getStatus(),
        learning: this.learning.getStats(),
        dashboard: this.state.metrics,
      });
    });

    // Logs système
    apiRouter.get("/logs", (req, res) => {
      const { limit = 100, level = "all" } = req.query;

      let logs = this.state.logs;

      if (level !== "all") {
        logs = logs.filter((log) => log.level === level);
      }

      res.json({
        logs: logs.slice(-parseInt(limit)),
        total: logs.length,
      });
    });

    // Génération de code via API
    apiRouter.post("/generate", async (req, res) => {
      try {
        const request = req.body;
        const result = await this.brain.processRequest(request);

        res.json(result);
      } catch (error) {
        this.logger.error("Erreur génération API:", error);
        res.status(500).json({
          error: "Erreur lors de la génération",
          message: error.message,
        });
      }
    });

    // Contrôle du cerveau
    apiRouter.post("/brain/restart", async (req, res) => {
      try {
        await this.brain.shutdown();
        await this.brain.initialize();

        res.json({ message: "Cerveau redémarré avec succès" });
      } catch (error) {
        res.status(500).json({
          error: "Erreur lors du redémarrage",
          message: error.message,
        });
      }
    });

    // Statistiques d'apprentissage
    apiRouter.get("/learning/stats", (req, res) => {
      res.json(this.learning.getStats());
    });

    // Réinitialisation de l'apprentissage
    apiRouter.post("/learning/reset", async (req, res) => {
      try {
        await this.learning.reset();
        res.json({ message: "Apprentissage réinitialisé" });
      } catch (error) {
        res.status(500).json({
          error: "Erreur lors de la réinitialisation",
          message: error.message,
        });
      }
    });

    // Mémoire système
    apiRouter.get("/memory/stats", async (req, res) => {
      try {
        const stats = await this.memory.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({
          error: "Erreur lors de la récupération des stats mémoire",
          message: error.message,
        });
      }
    });

    // Configuration
    apiRouter.get("/config", (req, res) => {
      res.json({
        dashboard: this.config,
        brain: this.brain.config,
      });
    });

    apiRouter.put("/config", (req, res) => {
      try {
        const newConfig = req.body;

        // Mise à jour sécurisée de la configuration
        Object.assign(this.config, newConfig.dashboard || {});

        res.json({ message: "Configuration mise à jour" });
      } catch (error) {
        res.status(500).json({
          error: "Erreur lors de la mise à jour de la configuration",
          message: error.message,
        });
      }
    });

    this.app.use("/api", apiRouter);
  }

  /**
   * Configuration de Socket.IO pour les métriques temps réel
   */
  setupSocketIO() {
    this.io.on("connection", (socket) => {
      this.state.connectedClients++;
      this.state.activeConnections.add(socket);

      this.logger.info(
        `Client connecté: ${socket.id} (Total: ${this.state.connectedClients})`,
      );

      // Envoi des données initiales
      socket.emit("initial-data", {
        metrics: this.getSystemMetrics(),
        brain: this.brain.getStatus(),
        logs: this.state.logs.slice(-50),
      });

      // Gestion des événements client
      socket.on("request-metrics", () => {
        socket.emit("metrics-update", this.getSystemMetrics());
      });

      socket.on("request-logs", (options = {}) => {
        const { limit = 50, level = "all" } = options;
        let logs = this.state.logs;

        if (level !== "all") {
          logs = logs.filter((log) => log.level === level);
        }

        socket.emit("logs-update", logs.slice(-limit));
      });

      socket.on("generate-code", async (request) => {
        try {
          const result = await this.brain.processRequest(request);
          socket.emit("generation-result", result);
        } catch (error) {
          socket.emit("generation-error", {
            error: error.message,
            request,
          });
        }
      });

      socket.on("disconnect", () => {
        this.state.connectedClients--;
        this.state.activeConnections.delete(socket);

        this.logger.info(
          `Client déconnecté: ${socket.id} (Total: ${this.state.connectedClients})`,
        );
      });
    });
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Événements du cerveau
    this.brain.on("initialized", () => {
      this.broadcastEvent("brain-initialized", this.brain.getStatus());
    });

    this.brain.on("taskCompleted", (data) => {
      this.broadcastEvent("task-completed", data);
    });

    // Événements d'apprentissage
    this.learning.on("patternDiscovered", (data) => {
      this.broadcastEvent("pattern-discovered", data);
      this.addLog(
        "info",
        `Nouveau pattern découvert: ${data.pattern.category}`,
      );
    });

    this.learning.on("optimizationApplied", (data) => {
      this.broadcastEvent("optimization-applied", data);
      this.addLog("info", `Optimisation appliquée: ${data.optimization.type}`);
    });

    // Gestion des signaux système
    process.on("SIGINT", () => {
      this.logger.info("Signal SIGINT reçu, arrêt en cours...");
      this.shutdown();
    });

    process.on("SIGTERM", () => {
      this.logger.info("Signal SIGTERM reçu, arrêt en cours...");
      this.shutdown();
    });
  }

  /**
   * Démarrage du dashboard
   */
  async start() {
    try {
      this.logger.info("🚀 Démarrage du dashboard Jarvis...");

      // Initialisation des systèmes
      if (this.brain.initialize) await this.brain.initialize();
      if (this.memory.init) await this.memory.init();
      if (this.learning.initialize) await this.learning.initialize();

      // Démarrage du serveur
      this.server.listen(this.config.port, this.config.host, () => {
        this.state.isRunning = true;
        this.state.startTime = Date.now();

        this.logger.info(
          `✅ Dashboard démarré sur http://${this.config.host}:${this.config.port}`,
        );
        this.addLog("info", "Dashboard Jarvis démarré avec succès");
      });

      // Démarrage des métriques temps réel
      if (this.config.enableRealTimeMetrics) {
        this.startMetricsCollection();
      }

      // Création de l'interface web si elle n'existe pas
      await this.createWebInterface();
    } catch (error) {
      this.logger.error("❌ Erreur lors du démarrage:", error);
      throw error;
    }
  }

  /**
   * Arrêt propre du dashboard
   */
  async shutdown() {
    try {
      this.logger.info("🔄 Arrêt du dashboard en cours...");

      this.state.isRunning = false;

      // Fermeture des connexions WebSocket
      this.io.close();

      // Arrêt des systèmes Jarvis
      await this.brain.shutdown();
      await this.learning.saveState();

      // Fermeture du serveur
      this.server.close(() => {
        this.logger.info("✅ Dashboard arrêté proprement");
        process.exit(0);
      });
    } catch (error) {
      this.logger.error("❌ Erreur lors de l'arrêt:", error);
      process.exit(1);
    }
  }

  /**
   * Démarrage de la collecte de métriques
   */
  startMetricsCollection() {
    setInterval(() => {
      if (this.state.isRunning) {
        const metrics = this.getSystemMetrics();
        this.broadcastEvent("metrics-update", metrics);
      }
    }, this.config.metricsInterval);
  }

  /**
   * Collecte des métriques système
   */
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: Date.now(),
      uptime: Date.now() - (this.state.startTime || Date.now()),
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      connections: this.state.connectedClients,
      requests: this.state.metrics.requests,
      errors: this.state.metrics.errors,
      averageResponseTime: this.state.metrics.averageResponseTime,
    };
  }

  /**
   * Logging des requêtes
   */
  logRequest(req, res, duration) {
    this.state.metrics.requests++;

    // Mise à jour du temps de réponse moyen
    this.state.metrics.averageResponseTime =
      (this.state.metrics.averageResponseTime *
        (this.state.metrics.requests - 1) +
        duration) /
      this.state.metrics.requests;

    // Comptage des erreurs
    if (res.statusCode >= 400) {
      this.state.metrics.errors++;
    }

    // Log détaillé
    const logLevel = res.statusCode >= 400 ? "error" : "info";
    this.addLog(
      logLevel,
      `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
    );
  }

  /**
   * Ajout d'un log
   */
  addLog(level, message, metadata = {}) {
    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      metadata,
    };

    this.state.logs.push(logEntry);

    // Limitation du nombre de logs
    if (this.state.logs.length > this.config.maxLogEntries) {
      this.state.logs = this.state.logs.slice(-this.config.maxLogEntries);
    }

    // Diffusion en temps réel
    this.broadcastEvent("log-entry", logEntry);
  }

  /**
   * Diffusion d'un événement à tous les clients connectés
   */
  broadcastEvent(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Création de l'interface web
   */
  async createWebInterface() {
    const publicDir = path.join(__dirname, "public");

    try {
      await fs.mkdir(publicDir, { recursive: true });
    } catch (error) {
      // Le répertoire existe déjà
    }

    const htmlContent = this.generateDashboardHTML();
    const cssContent = this.generateDashboardCSS();
    const jsContent = this.generateDashboardJS();

    await Promise.all([
      fs.writeFile(path.join(publicDir, "dashboard.html"), htmlContent),
      fs.writeFile(path.join(publicDir, "dashboard.css"), cssContent),
      fs.writeFile(path.join(publicDir, "dashboard.js"), jsContent),
    ]);
  }

  /**
   * Génération du HTML du dashboard
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jarvis Dashboard - Ultra Instinct</title>
    <link rel="stylesheet" href="dashboard.css">
    <script src="/socket.io/socket.io.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard">
        <header class="header">
            <h1>🧠 Jarvis Dashboard</h1>
            <div class="status-indicator" id="status">
                <span class="status-dot"></span>
                <span class="status-text">Initialisation...</span>
            </div>
        </header>
        
        <main class="main-content">
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Performance</h3>
                    <div class="metric-value" id="performance">--</div>
                    <div class="metric-label">Taux de succès</div>
                </div>
                
                <div class="metric-card">
                    <h3>Temps de réponse</h3>
                    <div class="metric-value" id="response-time">--</div>
                    <div class="metric-label">Moyenne (ms)</div>
                </div>
                
                <div class="metric-card">
                    <h3>Requêtes</h3>
                    <div class="metric-value" id="requests">--</div>
                    <div class="metric-label">Total traité</div>
                </div>
                
                <div class="metric-card">
                    <h3>Apprentissage</h3>
                    <div class="metric-value" id="patterns">--</div>
                    <div class="metric-label">Patterns découverts</div>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-container">
                    <h3>Métriques système</h3>
                    <canvas id="systemChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Performance temps réel</h3>
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            
            <div class="logs-section">
                <div class="logs-header">
                    <h3>Logs système</h3>
                    <div class="logs-controls">
                        <select id="log-level">
                            <option value="all">Tous les niveaux</option>
                            <option value="info">Info</option>
                            <option value="warn">Warning</option>
                            <option value="error">Erreur</option>
                        </select>
                        <button id="clear-logs">Effacer</button>
                    </div>
                </div>
                <div class="logs-container" id="logs"></div>
            </div>
            
            <div class="generation-section">
                <h3>Génération de code</h3>
                <div class="generation-form">
                    <textarea id="generation-request" placeholder="Décrivez ce que vous voulez générer..."></textarea>
                    <button id="generate-btn">Générer</button>
                </div>
                <div class="generation-result" id="generation-result"></div>
            </div>
        </main>
    </div>
    
    <script src="dashboard.js"></script>
</body>
</html>`;
  }

  /**
   * Génération du CSS du dashboard
   */
  generateDashboardCSS() {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    min-height: 100vh;
}

.dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header h1 {
    font-size: 2rem;
    background: linear-gradient(45deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffc107;
    animation: pulse 2s infinite;
}

.status-dot.active {
    background: #28a745;
}

.status-dot.error {
    background: #dc3545;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.main-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.metric-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.3s ease;
}

.metric-card:hover {
    transform: translateY(-5px);
}

.metric-card h3 {
    color: #666;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
}

.metric-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
}

.metric-label {
    color: #888;
    font-size: 0.8rem;
}

.charts-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.chart-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
    margin-bottom: 1rem;
    color: #333;
}

.logs-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.logs-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logs-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.logs-controls select,
.logs-controls button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: white;
    cursor: pointer;
}

.logs-container {
    height: 300px;
    overflow-y: auto;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
}

.log-entry {
    padding: 0.5rem;
    border-left: 3px solid #ddd;
    margin-bottom: 0.5rem;
    background: #f8f9fa;
}

.log-entry.info {
    border-left-color: #17a2b8;
}

.log-entry.warn {
    border-left-color: #ffc107;
}

.log-entry.error {
    border-left-color: #dc3545;
}

.log-timestamp {
    color: #666;
    font-size: 0.8rem;
}

.generation-section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.generation-form {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.generation-form textarea {
    flex: 1;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    resize: vertical;
    min-height: 100px;
}

.generation-form button {
    padding: 1rem 2rem;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s ease;
}

.generation-form button:hover {
    transform: scale(1.05);
}

.generation-result {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 1rem;
    min-height: 100px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
}

@media (max-width: 768px) {
    .charts-section {
        grid-template-columns: 1fr;
    }
    
    .generation-form {
        flex-direction: column;
    }
    
    .header {
        padding: 1rem;
    }
    
    .header h1 {
        font-size: 1.5rem;
    }
    
    .main-content {
        padding: 1rem;
    }
}`;
  }

  /**
   * Génération du JavaScript du dashboard
   */
  generateDashboardJS() {
    return `class JarvisDashboardClient {
    constructor() {
        this.socket = io();
        this.charts = {};
        this.metrics = {};
        
        this.initializeEventListeners();
        this.initializeCharts();
        this.setupSocketListeners();
    }
    
    initializeEventListeners() {
        // Contrôles des logs
        document.getElementById('log-level').addEventListener('change', (e) => {
            this.socket.emit('request-logs', { level: e.target.value });
        });
        
        document.getElementById('clear-logs').addEventListener('click', () => {
            document.getElementById('logs').innerHTML = '';
        });
        
        // Génération de code
        document.getElementById('generate-btn').addEventListener('click', () => {
            const request = document.getElementById('generation-request').value;
            if (request.trim()) {
                this.generateCode(request);
            }
        });
    }
    
    initializeCharts() {
        // Graphique système
        const systemCtx = document.getElementById('systemChart').getContext('2d');
        this.charts.system = new Chart(systemCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Mémoire (MB)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Connexions',
                    data: [],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Graphique performance
        const perfCtx = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(perfCtx, {
            type: 'doughnut',
            data: {
                labels: ['Succès', 'Échecs'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true
            }
        });
    }
    
    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.updateStatus('active', 'Connecté');
        });
        
        this.socket.on('disconnect', () => {
            this.updateStatus('error', 'Déconnecté');
        });
        
        this.socket.on('initial-data', (data) => {
            this.updateMetrics(data.metrics);
            this.updateLogs(data.logs);
        });
        
        this.socket.on('metrics-update', (metrics) => {
            this.updateMetrics(metrics);
            this.updateCharts(metrics);
        });
        
        this.socket.on('log-entry', (log) => {
            this.addLogEntry(log);
        });
        
        this.socket.on('logs-update', (logs) => {
            this.updateLogs(logs);
        });
        
        this.socket.on('generation-result', (result) => {
            this.displayGenerationResult(result);
        });
        
        this.socket.on('generation-error', (error) => {
            this.displayGenerationError(error);
        });
    }
    
    updateStatus(type, text) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        statusDot.className = \`status-dot \${type}\`;
        statusText.textContent = text;
    }
    
    updateMetrics(metrics) {
        this.metrics = metrics;
        
        // Mise à jour des cartes métriques
        document.getElementById('performance').textContent = 
            \`\${Math.round((metrics.requests - metrics.errors) / Math.max(metrics.requests, 1) * 100)}%\`;
        
        document.getElementById('response-time').textContent = 
            \`\${Math.round(metrics.averageResponseTime)}\`;
        
        document.getElementById('requests').textContent = 
            metrics.requests.toLocaleString();
        
        document.getElementById('patterns').textContent = 
            metrics.patterns || '--';
    }
    
    updateCharts(metrics) {
        const now = new Date().toLocaleTimeString();
        
        // Graphique système
        const systemChart = this.charts.system;
        systemChart.data.labels.push(now);
        systemChart.data.datasets[0].data.push(Math.round(metrics.memory.used / 1024 / 1024));
        systemChart.data.datasets[1].data.push(metrics.connections);
        
        // Limitation des données affichées
        if (systemChart.data.labels.length > 20) {
            systemChart.data.labels.shift();
            systemChart.data.datasets[0].data.shift();
            systemChart.data.datasets[1].data.shift();
        }
        
        systemChart.update('none');
        
        // Graphique performance
        const perfChart = this.charts.performance;
        const successRate = (metrics.requests - metrics.errors) / Math.max(metrics.requests, 1);
        perfChart.data.datasets[0].data = [
            Math.round(successRate * 100),
            Math.round((1 - successRate) * 100)
        ];
        perfChart.update();
    }
    
    updateLogs(logs) {
        const logsContainer = document.getElementById('logs');
        logsContainer.innerHTML = '';
        
        logs.forEach(log => this.addLogEntry(log));
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    addLogEntry(log) {
        const logsContainer = document.getElementById('logs');
        const logElement = document.createElement('div');
        logElement.className = \`log-entry \${log.level}\`;
        
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        logElement.innerHTML = \`
            <div class="log-timestamp">\${timestamp}</div>
            <div class="log-message">\${log.message}</div>
        \`;
        
        logsContainer.appendChild(logElement);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    generateCode(request) {
        const resultContainer = document.getElementById('generation-result');
        resultContainer.textContent = 'Génération en cours...';
        
        this.socket.emit('generate-code', {
            type: 'component',
            description: request,
            timestamp: Date.now()
        });
    }
    
    displayGenerationResult(result) {
        const resultContainer = document.getElementById('generation-result');
        
        if (result.success) {
            resultContainer.textContent = JSON.stringify(result.result, null, 2);
        } else {
            resultContainer.textContent = \`Erreur: \${result.error}\`;
        }
    }
    
    displayGenerationError(error) {
        const resultContainer = document.getElementById('generation-result');
        resultContainer.textContent = \`Erreur: \${error.error}\`;
    }
}

// Initialisation du dashboard
document.addEventListener('DOMContentLoaded', () => {
    new JarvisDashboardClient();
});`;
  }
}

// Point d'entrée principal
async function main() {
  try {
    const dashboard = new JarvisDashboard();
    await dashboard.start();
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  }
}

// Démarrage si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default JarvisDashboard;
