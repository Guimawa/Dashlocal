# 🧠 Jarvis Dashboard (Ultra Instinct)

Interface complète pour piloter ton système Jarvis IA :  
génération de composants, mémoire, templates, tests, logs d'apprentissage, et dashboard centralisé.

---

## 🧭 Routes principales (Next.js App Router)

| Page           | URL             | Description                                |
|----------------|------------------|--------------------------------------------|
| Dashboard      | `/`              | Vue globale de l'IA (stats, projets, logs) |
| Générateur     | `/generate`      | Génération de composants (via prompt)      |
| Templates      | `/templates`     | Éditeur JSX + Live Preview React           |
| Projets        | `/projects`      | Gestion des projets et templates           |
| Générer Handshake | `/generate-handshake` | Générateur basé sur handshake-react-pure |
| Mémoire        | `/memory`        | Timeline des générations passées           |
| Apprentissage  | `/learning`      | Logs IA internes (feedbacks, adaptation)   |
| Tests          | `/tests`         | Liste des tests générés + relance          |

---

## ⚙️ API internes (via `app/api`)

| Endpoint                     | Méthode | Fonction                                 |
|------------------------------|---------|------------------------------------------|
| `/api/generate/react`        | POST    | Génère un composant React                |
| `/api/generate/handshake`    | POST    | Génère un projet basé sur handshake      |
| `/api/memory`                | GET     | Récupère l'historique des générations    |
| `/api/learning`              | GET     | Récupère les logs d'apprentissage IA     |
| `/api/tests`                 | GET     | Liste des fichiers de test générés       |
| `/api/tests/:id/rerun`       | POST    | Relance un test par ID                   |
| `/api/dashboard`             | GET     | Stats globales : générations, projets... |

---

## 🧩 Composants réutilisables

- `CodeEditor` → Éditeur JSX pour composants personnalisés
- `LivePreview` → Affichage live d'un composant compilé
- `MemoryItem`, `FeedbackItem`, `TestResultItem` → Cartes de contenu dynamique
- `StatWidget`, `ProjectList`, `ActivityLog` → Widgets Dashboard
- `ProjectCard` → Carte de projet avec actions
- `Sidebar`, `ThemeToggle`, `MainLayout` → Layout global

---

## 🎨 Design Tokens (`/styles/tokens.js`)

Centralisés pour le thème, utilisés dans :

- `tailwind.config.js` → classes utilitaires (`bg-primary`, `rounded-md`, etc.)
- `components` → style inline ou conditionnel
- Figma plugin (ou exports à venir)

### Exemple contenu :
```js
colors: {
  primary: '#2563EB',
  success: '#22C55E',
  error: '#EF4444',
  textPrimary: '#111827',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#0F172A',
},
radius: {
  md: '16px'
},
spacing: {
  sm: '8px', md: '16px', lg: '24px'
},
shadows: {
  glow: '0 0 12px rgba(124, 198, 255, 0.25)',
  glowAccent: '0 0 20px rgba(121, 255, 225, 0.3)'
}
```

---

## 🚀 **Nouvelles Fonctionnalités Handshake**

### **📦 Intégration handshake-react-pure**
- **Template complet** : React 19.1.1 + TypeScript + Tailwind CSS 4.1.12
- **Design tokens** : Couleurs d'accent fluo, effets glow, border-radius 2xl
- **Composants** : Graphiques Recharts, réseau React Force Graph
- **Mode sombre** : Intégré par défaut avec design system cohérent

### **🎨 Améliorations UI**
- **StatWidget** : Types avec couleurs d'accent et effets glow
- **TestResultItem** : Statuts colorés avec animations
- **ProjectCard** : Cartes de projet avec actions (Preview, Code, Export)
- **Effets visuels** : Glow, transitions, hover states

### **🔧 Générateur Handshake**
- **Page dédiée** : `/generate-handshake` avec configuration avancée
- **API route** : `/api/generate/handshake` pour génération de projets
- **Templates** : Package.json, Tailwind config, composants React
- **Preview** : Pages de preview et source pour chaque projet généré

### **📱 Gestion des Projets**
- **Page projets** : `/projects` avec templates et projets générés
- **Navigation** : Intégration dans la sidebar principale
- **Actions** : Preview, code source, export, génération
- **Organisation** : Séparation templates vs projets générés