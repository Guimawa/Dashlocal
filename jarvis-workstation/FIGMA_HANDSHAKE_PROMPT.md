# 🎨 Prompt Figma pour Handshake Dashboard

## 📋 **Contexte du Projet**

Créez un design Figma pour un dashboard React moderne basé sur le template **handshake-react-pure** avec les caractéristiques suivantes :

## 🎯 **Spécifications Techniques**

- **Framework** : React 19.1.1 + TypeScript
- **Styling** : Tailwind CSS 4.1.12
- **Design System** : Mode sombre avec accents fluo
- **Responsive** : Mobile-first, desktop-optimized

## 🎨 **Design Tokens**

### **Couleurs**

```css
/* Couleurs principales */
--ink: #e8eaf6; /* Texte principal */
--bg: #0b1020; /* Arrière-plan principal */
--panel: #0f152b; /* Arrière-plan des panneaux */

/* Accents fluo */
--accent-1: #79ffe1; /* Vert fluo */
--accent-2: #ffd166; /* Jaune */
--accent-3: #5cb3ff; /* Bleu */
--accent-4: #f78fb3; /* Rose */

/* Grays */
--gray-800: #1f2937; /* Bordures */
--gray-700: #374151; /* Bordures secondaires */
--gray-400: #9ca3af; /* Texte secondaire */
```

### **Effets**

```css
/* Box Shadow */
--glow: 0 0 12px rgba(124, 198, 255, 0.25);
--glow-accent: 0 0 20px rgba(121, 255, 225, 0.3);

/* Border Radius */
--radius-2xl: 1.25rem;
--radius-lg: 1rem;
```

## 📱 **Structure du Dashboard**

### **1. Header**

- **Hauteur** : 80px
- **Background** : `--panel`
- **Border** : `1px solid --gray-800`
- **Contenu** :
  - Logo/Titre : "Handshake Dashboard" (text-accent-1, font-bold, text-2xl)
  - Barre de recherche : input avec icône Search (Lucide)
  - Bouton filtre : icône Filter (Lucide)

### **2. Stats Cards (4 colonnes)**

- **Layout** : Grid 4 colonnes sur desktop, 1 colonne sur mobile
- **Dimensions** : 280px × 120px
- **Background** : `--panel`
- **Border** : `1px solid --gray-800`
- **Border Radius** : `--radius-2xl`
- **Box Shadow** : `--glow`
- **Contenu** :
  - Icône (Lucide) : Users, Activity, TrendingUp, Zap
  - Titre : "Total Users", "Active Sessions", "Projects", "Alerts"
  - Valeur : "1,234", "567", "89", "12"
  - Couleurs d'accent : accent-1, accent-2, accent-3, accent-4

### **3. Charts Section (2 colonnes)**

- **Layout** : Grid 2 colonnes sur desktop, 1 colonne sur mobile
- **Dimensions** : 600px × 400px
- **Background** : `--panel`
- **Border** : `1px solid --gray-800`
- **Border Radius** : `--radius-2xl`
- **Box Shadow** : `--glow`

#### **Chart 1 : Activity Overview**

- **Titre** : "Activity Overview" (text-white, font-semibold, text-lg)
- **Graphique** : Line Chart (Recharts)
- **Couleur** : `--accent-1` (#79ffe1)
- **Données** : Jan(400), Feb(300), Mar(600), Apr(800), May(500), Jun(700)

#### **Chart 2 : Network Connections**

- **Titre** : "Network Connections" (text-white, font-semibold, text-lg)
- **Contenu** : Placeholder pour React Force Graph
- **Background** : Gradient `from-accent-2/10 to-accent-4/10`
- **Icône** : 🕸️ (4xl)
- **Texte** : "React Force Graph" + "Connexions interactives"

## 🔧 **Composants à Créer**

### **1. Button Primary**

- **Background** : `--accent-1`
- **Text** : `--bg`
- **Padding** : 16px 24px
- **Border Radius** : `--radius-lg`
- **Hover** : `--glow-accent`
- **Transition** : all 0.3s

### **2. Input Search**

- **Background** : `--gray-800`
- **Text** : `--ink`
- **Border** : `1px solid --gray-700`
- **Focus Border** : `--accent-1`
- **Padding** : 12px 16px 12px 40px
- **Border Radius** : `--radius-lg`
- **Placeholder** : "Rechercher..."

### **3. Card**

- **Background** : `--panel`
- **Border** : `1px solid --gray-800`
- **Border Radius** : `--radius-2xl`
- **Box Shadow** : `--glow`
- **Padding** : 24px
- **Hover** : `shadow-lg`

## 📐 **Spacing & Layout**

- **Container** : max-width 1200px, margin auto
- **Grid Gap** : 24px
- **Section Spacing** : 32px
- **Card Padding** : 24px
- **Button Padding** : 16px 24px

## 🎭 **États & Interactions**

- **Hover** : Élévation des cartes, glow des boutons
- **Focus** : Border accent sur les inputs
- **Active** : Légère réduction d'opacité
- **Loading** : Spinner avec accent-1

## 📱 **Responsive Breakpoints**

- **Mobile** : < 768px (1 colonne)
- **Tablet** : 768px - 1024px (2 colonnes)
- **Desktop** : > 1024px (4 colonnes)

## 🎨 **Style Guide**

- **Typography** : Inter (Google Fonts)
- **Icons** : Lucide React
- **Animations** : Smooth transitions (0.3s)
- **Accessibility** : Contraste WCAG AA
- **Dark Mode** : Par défaut

## 🚀 **Fonctionnalités Avancées**

- **Recherche** : Barre de recherche avec icône
- **Filtres** : Bouton filtre avec dropdown
- **Graphiques** : Recharts avec animations
- **Réseau** : React Force Graph interactif
- **Export** : Boutons d'export (PDF, PNG, SVG)

---

## 📝 **Instructions de Création**

1. **Créer un nouveau fichier Figma**
2. **Définir les design tokens** dans les styles
3. **Créer les composants** réutilisables
4. **Construire le layout** responsive
5. **Ajouter les interactions** et états
6. **Tester l'accessibilité** et le contraste
7. **Exporter les assets** pour le développement

## 🎯 **Résultat Attendu**

Un design Figma complet et professionnel pour un dashboard React moderne, prêt pour le développement avec handshake-react-pure comme base technique.
