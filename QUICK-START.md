# 📋 SCRIPTS D'INTÉGRATION RAPIDE

## 🎯 Pour intégrer Bullet Filter sur votre site

### Étape 1 : Dans le `<head>` de votre HTML

```html
<link rel="stylesheet" href="https://votre-site.com/bullet/bullet-style.css">
```

### Étape 2 : Avant `</body>` de votre HTML

```html
<script src="https://votre-site.com/bullet/bullet-data.js"></script>
<script src="https://votre-site.com/bullet/bullet-config.js"></script>
<script src="https://votre-site.com/bullet/bullet-bus.js"></script>
<script src="https://votre-site.com/bullet/bullet-params.js"></script>
<script src="https://votre-site.com/bullet/bullet-modal.js"></script>
<script src="https://votre-site.com/bullet/bullet-filter.js"></script>
<script src="https://votre-site.com/bullet/bullet-toc.js"></script>
<script src="https://votre-site.com/bullet/bullet-app.js"></script>
```

---

## 🌐 Avec GitHub Pages (après déploiement)

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub.

### Dans le `<head>` :

```html
<link rel="stylesheet" href="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-style.css">
```

### Avant `</body>` :

```html
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-data.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-config.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-bus.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-params.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-modal.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-filter.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-toc.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-app.js"></script>
```

---

## 📦 EXEMPLE COMPLET

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ma page Notion</title>
  
  <!-- Bullet Filter CSS -->
  <link rel="stylesheet" href="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-style.css">
  
  <style>
    body {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      padding-top: 80px; /* Espace pour la navbar */
    }
  </style>
</head>
<body>
  
  <!-- Votre contenu HTML Notion ici -->
  <h1>Mon titre</h1>
  
  <details>
    <summary>
      Section filtrée
      <mark class="highlight-gray">model:ABC123</mark>
    </summary>
    <p>Ce contenu ne s'affiche que si model=ABC123</p>
  </details>
  
  <!-- Bullet Filter JavaScript -->
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-data.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-config.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-bus.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-params.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-modal.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-filter.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-toc.js"></script>
  <script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-app.js"></script>
</body>
</html>
```

---

## ⚡ VERSION MINIMALE (sans Table des matières)

Si vous n'avez pas besoin de la TOC, omettez `bullet-toc.js` :

### Dans le `<head>` :

```html
<link rel="stylesheet" href="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-style.css">
```

### Avant `</body>` :

```html
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-data.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-config.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-bus.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-params.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-modal.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-filter.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-app.js"></script>
```

---

## ⚠️ IMPORTANT

1. **L'ordre des scripts est crucial** - Ne changez pas l'ordre
2. **bullet-app.js doit TOUJOURS être en dernier**
3. Le CSS doit être dans le `<head>`
4. Les scripts doivent être avant `</body>`

---

## 🎨 PERSONNALISATION

Ajoutez vos styles personnalisés APRÈS le CSS Bullet Filter :

```html
<link rel="stylesheet" href="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-style.css">
<style>
  /* Navbar personnalisée */
  .bullet-navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  /* TOC personnalisée */
  .dynamic-toc {
    background: rgba(255, 255, 255, 0.98);
  }
</style>
```

---

## 🚀 COMMANDES GIT POUR DÉPLOYER

```bash
# 1. Aller dans le dossier du projet
cd /Users/emichelin/DEV_PROJECTS/bullet-filter

# 2. Créer le dépôt sur GitHub (via interface web)
# Puis lier et pousser :
git remote add origin https://github.com/VOTRE-USERNAME/bullet-filter.git
git branch -M main
git push -u origin main

# 3. Activer GitHub Pages (optionnel)
git checkout -b gh-pages
git push -u origin gh-pages
```

Ensuite, allez dans Settings > Pages de votre dépôt GitHub et sélectionnez la branche `gh-pages`.

---

**C'est tout ! Votre Bullet Filter est prêt à être utilisé 🎉**
