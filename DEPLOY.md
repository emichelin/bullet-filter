# 🚀 Instructions de déploiement GitHub

## Étape 1 : Initialiser le dépôt Git local

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter
git init
git add .
git commit -m "Initial commit: Bullet Filter v1.0.0 - Système de filtrage dynamique pour HTML Notion"
```

## Étape 2 : Créer le dépôt sur GitHub

1. Allez sur [GitHub](https://github.com/new)
2. Créez un nouveau dépôt avec le nom : **bullet-filter**
3. **Ne cochez PAS** "Initialize with README" (vous en avez déjà un)
4. Choisissez "Public" ou "Private" selon vos besoins
5. Cliquez sur "Create repository"

## Étape 3 : Lier et pousser vers GitHub

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/bullet-filter.git
git branch -M main
git push -u origin main
```

## Étape 4 : Héberger sur GitHub Pages (optionnel)

Si vous voulez héberger les fichiers directement via GitHub Pages :

```bash
# Créer une branche gh-pages
git checkout -b gh-pages
git push -u origin gh-pages
```

Ensuite :
1. Allez dans "Settings" > "Pages" de votre dépôt GitHub
2. Sélectionnez la branche `gh-pages` comme source
3. Cliquez sur "Save"
4. Votre site sera disponible à : `https://VOTRE-USERNAME.github.io/bullet-filter/`

## Étape 5 : Utiliser sur votre site

### Option A : Via GitHub Pages (CDN gratuit)

Dans votre HTML, remplacez `votre-site.com` par :
```
https://VOTRE-USERNAME.github.io/bullet-filter/dist
```

Exemple :
```html
<link rel="stylesheet" href="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-style.css">

<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-data.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-config.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-bus.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-params.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-modal.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-filter.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-toc.js"></script>
<script src="https://VOTRE-USERNAME.github.io/bullet-filter/dist/bullet-app.js"></script>
```

### Option B : Télécharger et héberger vous-même

1. Téléchargez le dossier `dist/` de votre dépôt
2. Uploadez-le sur votre serveur web
3. Référencez les fichiers selon leur emplacement

## 🎯 Scripts d'intégration prêts à l'emploi

Consultez le fichier **INTEGRATION.html** à la racine du projet pour :
- Scripts complets avec CDN
- Scripts pour hébergement local
- Version minimale sans TOC
- Exemple d'intégration complète
- Guide de personnalisation

## 📝 Notes importantes

1. **Ordre des scripts** : Respectez l'ordre d'importation (voir INTEGRATION.html)
2. **bullet-app.js** doit TOUJOURS être chargé en dernier
3. Le CSS doit être dans le `<head>`
4. Les scripts doivent être avant la fermeture `</body>`

## 🔄 Mises à jour futures

Pour mettre à jour votre dépôt :

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter
git add .
git commit -m "Description des changements"
git push
```

## 🌐 URLs du projet

Après déploiement, vos URLs seront :

- **Dépôt GitHub** : `https://github.com/VOTRE-USERNAME/bullet-filter`
- **GitHub Pages** : `https://VOTRE-USERNAME.github.io/bullet-filter/`
- **Exemple démo** : `https://VOTRE-USERNAME.github.io/bullet-filter/examples/integration.html`
- **CDN des fichiers** : `https://VOTRE-USERNAME.github.io/bullet-filter/dist/`

## 📚 Documentation

- **README.md** : Documentation principale
- **INTEGRATION.html** : Guide d'intégration complet
- **examples/** : Exemples d'utilisation
- **LICENSE** : Licence MIT

## 🆘 Besoin d'aide ?

- Consultez le README.md
- Ouvrez une issue sur GitHub
- Consultez les exemples dans `examples/`

---

**Bon déploiement ! 🎉**
