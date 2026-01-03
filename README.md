# 🎯 Bullet Filter

> Système de filtrage dynamique et intelligent pour vos exports HTML Notion

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/ecma-262/)

## 📋 Description

**Bullet Filter** est une bibliothèque JavaScript légère et modulaire qui transforme vos exports HTML statiques Notion en interfaces interactives avec :

- 🎛️ **Filtrage dynamique** par catégories (modèle, module, capteur, etc.)
- 📱 **Navbar personnalisable** avec modal de configuration
- 🔗 **Persistance des paramètres** via URL et sessionStorage
- 📑 **Table des matières dynamique** (TOC) avec navigation fluide
- 🎨 **Interface moderne** avec design soigné
- ⚡ **Zéro dépendance** - Pure JavaScript vanilla

## 🚀 Installation rapide

### Option 1 : CDN (Recommandé)

Ajoutez ces lignes dans votre `<head>` HTML :

```html
<!-- CSS -->
<link rel="stylesheet" href="https://votre-site.com/bullet/bullet-style.css">

<!-- JavaScript -->
<script src="https://votre-site.com/bullet/bullet-data.js"></script>
<script src="https://votre-site.com/bullet/bullet-config.js"></script>
<script src="https://votre-site.com/bullet/bullet-bus.js"></script>
<script src="https://votre-site.com/bullet/bullet-params.js"></script>
<script src="https://votre-site.com/bullet/bullet-modal.js"></script>
<script src="https://votre-site.com/bullet/bullet-filter.js"></script>
<script src="https://votre-site.com/bullet/bullet-toc.js"></script>
<script src="https://votre-site.com/bullet/bullet-app.js"></script>
```

### Option 2 : Hébergement local

1. Téléchargez le dossier `dist/` de ce dépôt
2. Placez-le sur votre serveur web
3. Utilisez le script d'intégration fourni dans `examples/integration.html`

## 📦 Structure du projet

```
bullet-filter/
├── dist/                       # Fichiers de production (minifiés)
│   ├── bullet-style.css       # Styles globaux
│   ├── bullet-data.js         # Données de filtrage
│   ├── bullet-config.js       # Configuration globale
│   ├── bullet-bus.js          # Event bus
│   ├── bullet-params.js       # Gestion des paramètres
│   ├── bullet-modal.js        # Modal de configuration
│   ├── bullet-filter.js       # Logique de filtrage
│   ├── bullet-toc.js          # Table des matières
│   └── bullet-app.js          # Initialisation principale
├── src/                        # Fichiers source (développement)
├── examples/                   # Exemples d'intégration
│   ├── integration.html       # Exemple complet
│   └── minimal.html           # Version minimale
├── docs/                       # Documentation détaillée
│   ├── API.md                 # Documentation API
│   ├── CONFIGURATION.md       # Guide de configuration
│   └── CUSTOMIZATION.md       # Guide de personnalisation
└── README.md                   # Ce fichier
```

## 🎨 Fonctionnalités

### 1. Filtrage dynamique

Le système détecte automatiquement les balises de filtrage dans votre HTML Notion :

```html
<mark class="highlight-gray">model:ABC123</mark>
<mark class="highlight-gray">module:M1,M2</mark>
<mark class="highlight-gray">sensor:S1</mark>
```

Les éléments sont affichés ou masqués selon les filtres actifs.

### 2. Navbar interactive

Une barre de navigation moderne s'affiche automatiquement avec :
- Bouton de configuration (⚙️)
- Affichage des filtres actifs
- Compteur d'éléments visibles

### 3. Modal de configuration

Interface complète pour :
- Sélectionner les filtres par catégorie
- Activer/désactiver les conditions
- Gérer l'affichage des images
- Réinitialiser tous les paramètres

### 4. Table des matières (TOC)

Navigation fluide avec :
- Détection automatique des titres
- Mise en surbrillance du titre actif
- Scroll fluide vers les sections

## 🔧 Configuration

### Paramètres disponibles

Le système reconnaît ces paramètres dans l'URL :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `model` | Filtrer par modèle | `?model=ABC123` |
| `module` | Filtrer par module | `?module=M1,M2` |
| `sensor` | Filtrer par capteur | `?sensor=S1` |
| `range` | Filtrer par plage | `?range=R1` |
| `env` | Filtrer par environnement | `?env=prod` |
| `cond` | Activer les conditions | `?cond=true` |
| `opt` | Options | `?opt=custom` |
| `other` | Autres filtres | `?other=value` |
| `img` | Afficher les images | `?img=true` |

### Exemple d'URL avec filtres

```
https://votre-site.com/page.html?model=ABC123&module=M1,M2&cond=true&img=false
```

## 📚 Utilisation

### Intégration basique

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Ma page Notion</title>
  
  <!-- Bullet Filter CSS -->
  <link rel="stylesheet" href="/bullet/bullet-style.css">
</head>
<body>
  <!-- Votre contenu HTML Notion ici -->
  
  <!-- Bullet Filter JS (à la fin du body) -->
  <script src="/bullet/bullet-data.js"></script>
  <script src="/bullet/bullet-config.js"></script>
  <script src="/bullet/bullet-bus.js"></script>
  <script src="/bullet/bullet-params.js"></script>
  <script src="/bullet/bullet-modal.js"></script>
  <script src="/bullet/bullet-filter.js"></script>
  <script src="/bullet/bullet-toc.js"></script>
  <script src="/bullet/bullet-app.js"></script>
</body>
</html>
```

### Personnalisation des styles

Vous pouvez surcharger les styles en ajoutant votre propre CSS après `bullet-style.css` :

```html
<link rel="stylesheet" href="/bullet/bullet-style.css">
<style>
  .bullet-navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .dynamic-toc {
    background: rgba(255, 255, 255, 0.95);
  }
</style>
```

### Configuration avancée

Vous pouvez modifier le fichier `bullet-config.js` pour adapter :
- Les clés de paramètres reconnus
- Les sélecteurs CSS
- Les événements personnalisés
- Le préfixe de stockage localStorage

## 🌐 Exemples

Consultez le dossier `examples/` pour des exemples complets :

1. **integration.html** - Intégration complète avec tous les modules
2. **minimal.html** - Version minimale sans TOC
3. **custom-styles.html** - Exemple avec styles personnalisés

## 🛠️ Développement

### Prérequis

- Serveur web local (Apache, Nginx, ou `python -m http.server`)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation pour développement

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/bullet-filter.git

# Aller dans le dossier
cd bullet-filter

# Lancer un serveur local
python -m http.server 8000

# Ouvrir http://localhost:8000/examples/integration.html
```

### Architecture

Le système est modulaire avec des composants indépendants :

1. **bullet-config.js** - Configuration centrale
2. **bullet-bus.js** - Event bus pour la communication inter-modules
3. **bullet-data.js** - Données de référence pour les filtres
4. **bullet-params.js** - Gestion des paramètres URL/localStorage
5. **bullet-modal.js** - Interface de configuration
6. **bullet-filter.js** - Logique de filtrage du contenu
7. **bullet-toc.js** - Table des matières dynamique
8. **bullet-app.js** - Initialisation et orchestration

## 📄 Licence

MIT License - Vous êtes libre d'utiliser, modifier et distribuer ce code.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📞 Support

- 📧 Email : [votre-email@example.com]
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/bullet-filter/issues)
- 📖 Documentation : [Wiki du projet](https://github.com/votre-username/bullet-filter/wiki)

## 🙏 Remerciements

Ce projet a été développé pour améliorer l'expérience utilisateur des exports HTML Notion en ajoutant des fonctionnalités de filtrage et de navigation interactives.

---

**Fait avec ❤️ pour la communauté Notion**
