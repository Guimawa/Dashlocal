# 🧠 Jarvis Ultra Instinct

> Assistant IA de génération de code React/Next.js avec intégration Storybook, tests et design system

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/jarvis-ultra-instinct)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

## 🚀 Fonctionnalités

- **Génération de code IA** avec Groq API
- **Composants React/Next.js** avec TypeScript
- **Stories Storybook** automatiques
- **Tests complets** (Jest + React Testing Library)
- **Validation et formatage** du code
- **Système de mémoire** intelligent
- **Interface CLI** intuitive
- **Support multi-frameworks** (React, Next.js, Vite)

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/your-repo/jarvis-ultra-instinct.git
cd jarvis-ultra-instinct

# Installer les dépendances
npm install

# Configurer l'environnement
cp env.example .env
# Éditer .env avec votre clé API Groq
```

## ⚙️ Configuration

### Variables d'environnement

```bash
# Clé API Groq (obligatoire)
GROQ_API_KEY=your_groq_api_key_here

# Modèle Groq (optionnel)
GROQ_MODEL=llama3-70b-8192
```

### Obtenir une clé API Groq

1. Allez sur [console.groq.com](https://console.groq.com)
2. Créez un compte
3. Générez une clé API
4. Ajoutez-la dans votre fichier `.env`

## 🎯 Utilisation

### Interface CLI

```bash
# Lancer Jarvis
npm start

# Ou directement
node jarvis-cli.js
```

### Commandes disponibles

```bash
# Générer un composant
jarvis generate component -n Button

# Générer une page
jarvis generate page -n Home

# Générer un hook
jarvis generate hook -n useCounter

# Initialiser un projet
jarvis init my-app

# Mode apprentissage
jarvis learn

# Dashboard
jarvis dashboard

# Lancer le dashboard web
npm run dashboard
```

### Options avancées

```bash
# Avec TypeScript
jarvis generate component -n Button --typescript

# Sans Storybook
jarvis generate component -n Button --no-storybook

# Sans tests
jarvis generate component -n Button --no-tests

# Répertoire personnalisé
jarvis generate component -n Button -d src/components/ui
```

## 🏗️ Architecture

```
jarvis-ultra-instinct/
├── src/
│   ├── core/           # Système de mémoire, apprentissage, logger
│   ├── generators/     # Générateurs de code
│   ├── utils/          # Utilitaires (validation, formatage, groq-client)
│   └── templates/      # Templates de code
├── jarvis-cli.js       # Interface CLI principale
├── jarvis-dashboard.js # Dashboard web avec métriques temps réel
├── main.js            # Interface locale
└── package.json       # Configuration du projet
```

## 🔧 Générateurs

### ReactGenerator
- Composants React/Next.js
- Hooks personnalisés
- Pages Next.js
- Support TypeScript

### StorybookGenerator
- Stories automatiques
- Configuration Storybook
- Addons essentiels
- Responsive design

### TestGenerator
- Tests unitaires
- Tests d'intégration
- Tests d'accessibilité
- Configuration Jest

## 🧠 Système de mémoire

Jarvis Ultra Instinct inclut un système de mémoire intelligent qui :

- **Mémorise** les générations précédentes
- **Apprend** de vos préférences
- **Optimise** les suggestions
- **Maintient** le contexte du projet

## 📊 Validation et formatage

- **Validation syntaxique** avec Babel
- **Analyse de complexité** cognitive
- **Vérification sécurité** automatique
- **Formatage** avec Prettier/ESLint
- **Métriques** de qualité

## 🎨 Design System

Support intégré pour :
- **Tailwind CSS**
- **shadcn/ui**
- **Material-UI**
- **Chakra UI**
- **Ant Design**

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📚 Documentation

- [Guide d'installation](docs/installation.md)
- [Configuration avancée](docs/configuration.md)
- [API Reference](docs/api.md)
- [Exemples](docs/examples.md)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Groq](https://groq.com) pour l'API IA
- [Commander.js](https://github.com/tj/commander.js) pour l'interface CLI
- [Storybook](https://storybook.js.org) pour la documentation des composants
- [Jest](https://jestjs.io) pour les tests

## 📞 Support

- 📧 Email: support@jarvis-ultra-instinct.com
- 💬 Discord: [Rejoindre le serveur](https://discord.gg/jarvis-ui)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/jarvis-ultra-instinct/issues)

---

**Fait avec ❤️ par l'équipe Jarvis Ultra Instinct**
