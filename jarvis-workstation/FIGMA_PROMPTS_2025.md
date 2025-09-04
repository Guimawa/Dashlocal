# 🎨 Prompts Figma 2025 - Jarvis Ultra Instinct

Prompts optimisés pour créer des designs cohérents avec le système Jarvis Dashboard Ultra Instinct.

---

## 📐 PROMPT GLOBAL – DASHBOARD WEB

Crée une page web responsive 1440px. Utilise une grille 12 colonnes avec spacing 24px.

Ajoute une **sidebar verticale à gauche**, fond blanc, radius 16px, avec navigation :

- Dashboard
- Générer
- Templates
- Mémoire
- Apprentissage
- Tests
- Paramètres

Ajoute un **main content à droite**, avec padding 24px :

- Titre H1
- Contenu variable selon onglet

**Spécifications :**

- Typo : Inter
- Couleurs : bleu #2563EB, gris #6B7280, fond clair #F9FAFB, fond sombre #0F172A
- Radius : 16px
- Mode clair/sombre
- Touch targets ≥ 44px
- Contraste AA

---

## 🔧 PROMPT – ÉCRAN : GÉNÉRATEUR

Crée un écran "Générateur" avec :

- Titre H1 : Générateur de Composants
- Zone de texte (textarea) pour le prompt
- Bouton "Générer"
- Bloc résultat : fond gris clair, coin arrondi, affichage code (monospace)

**Spécifications :**

- Disposition : verticale, spacing 16px
- Typo : Inter
- Mode : clair/sombre
- Bouton bleu #2563EB, radius 16
- Textarea 100%, hauteur 160px

---

## ✍️ PROMPT – ÉCRAN : TEMPLATES

Crée un écran "Templates" avec 2 colonnes :

- Colonne gauche : éditeur de code (textarea), titre "Éditeur"
- Colonne droite : zone "Preview Live" avec cadre blanc, fond gris clair

**Spécifications :**

- Spacing entre colonnes : 32px
- Textarea hauteur 360px
- Utilise Auto Layout vertical
- Radius 16px partout
- Couleur fond preview : #F1F5F9

---

## 🧠 PROMPT – ÉCRAN : MÉMOIRE

Crée un écran "Mémoire des générations" :

- Liste verticale de cartes
- Chaque carte contient :
  - Titre
  - Date
  - Prompt utilisateur
  - Code généré (zone scrollable)

**Spécifications :**

- Cartes : fond blanc, border gris clair, radius 16px, padding 16px
- Typo : Inter 16px
- Spacing entre cartes : 24px

---

## 🔬 PROMPT – ÉCRAN : TESTS

Crée un écran "Tests générés" :

- Liste verticale de blocs
- Chaque bloc contient :
  - Nom du test
  - Statut (OK / FAIL / EN ATTENTE) avec puce colorée
  - Code du test
  - Boutons "Relancer", "Copier"

**Spécifications :**

- Utilise des icônes Lucide
- Couleur OK : vert #22C55E
- Erreur : rouge #EF4444
- Radius : 16px
- Typo monospace pour le code

---

## 📊 PROMPT – DASHBOARD

Crée un écran dashboard avec 3 widgets :

- Générations : nombre total
- Composants uniques : nombre
- Projets créés : nombre

Ajoute :

- Liste des projets récents (nom + chemin)
- Logs récents (date + message)

**Spécifications :**

- Widgets en 3 colonnes, spacing 24
- Cards avec fond blanc, ombre légère
- Typo : Inter, taille 18-24px

---

## 🔧 PROMPT – PARAMÈTRES

Crée une page de paramètres utilisateur :

- Champ texte : nom du workspace
- Select : Thème (auto, clair, sombre)
- Select : Langue (fr, en)
- Checkbox : Debug Mode
- Bouton "Enregistrer"

**Spécifications :**

- Auto Layout vertical, spacing 16
- Bouton bleu, radius 16
- Fond page : #F9FAFB

---

## 🎯 PROMPT – COMPOSANTS UI

Crée une bibliothèque de composants réutilisables :

**Button Primary :**

- Fond bleu #2563EB, texte blanc
- Radius 16px, padding 12px 24px
- Hover : assombrir de 10%
- Touch target 44px minimum

**Input/Textarea :**

- Border gris #E5E7EB, radius 8px
- Padding 12px, typo Inter 16px
- Focus : border bleu #2563EB
- Placeholder gris #9CA3AF

**Card :**

- Fond blanc, border gris clair
- Radius 16px, padding 16px
- Ombre légère : 0 1px 3px rgba(0,0,0,0.1)

**Status Badge :**

- Success : vert #22C55E
- Error : rouge #EF4444
- Warning : orange #F59E0B
- Info : bleu #0EA5E9
- Radius 8px, padding 4px 8px

---

## 🌙 PROMPT – MODE SOMBRE

Adapte tous les écrans pour le mode sombre :

**Couleurs sombres :**

- Fond principal : #0F172A
- Fond secondaire : #1E293B
- Texte principal : #F8FAFC
- Texte secondaire : #94A3B8
- Border : #334155

**Conserve :**

- Couleurs d'accent (bleu, vert, rouge)
- Radius et spacing identiques
- Contrastes AA maintenus

---

## 📱 PROMPT – RESPONSIVE

Adapte le design pour mobile (375px) :

**Sidebar :**

- Devient un menu hamburger
- Overlay en plein écran
- Navigation verticale

**Main content :**

- Padding réduit à 16px
- Colonnes deviennent verticales
- Widgets en 1 colonne

**Touch targets :**

- Minimum 44px partout
- Espacement augmenté
- Boutons plus grands

---

## 🎨 PROMPT – DESIGN SYSTEM

Crée un design system complet :

**Couleurs :**

- Primary: #2563EB
- Secondary: #9333EA
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444
- Info: #0EA5E9

**Typographie :**

- H1: Inter 32px, weight 700
- H2: Inter 24px, weight 600
- H3: Inter 20px, weight 600
- Body: Inter 16px, weight 400
- Caption: Inter 14px, weight 400

**Spacing :**

- xxs: 4px
- xs: 8px
- sm: 12px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 40px

**Radius :**

- sm: 8px
- md: 16px
- lg: 24px

**Shadows :**

- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.15)
