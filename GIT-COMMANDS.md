# 🎯 COMMANDES GIT POUR DÉPLOYER BULLET FILTER

## 📋 Prérequis

1. Créez d'abord le dépôt sur GitHub : https://github.com/new
   - Nom : `bullet-filter`
   - Description : Système de filtrage dynamique pour exports HTML Notion
   - Public ou Private
   - ⚠️ **NE PAS** cocher "Initialize with README"

2. Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub dans toutes les commandes ci-dessous

---

## 🚀 MÉTHODE 1 : Script automatique (recommandé)

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter

# Éditez d'abord le script pour remplacer VOTRE-USERNAME
# Puis exécutez :
./deploy.sh
```

---

## 🔧 MÉTHODE 2 : Commandes manuelles

### Étape 1 : Lier le dépôt GitHub

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter

git remote add origin https://github.com/VOTRE-USERNAME/bullet-filter.git
git branch -M main
git push -u origin main
```

### Étape 2 : Activer GitHub Pages (optionnel)

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter

git checkout -b gh-pages
git push -u origin gh-pages
git checkout main
```

Puis sur GitHub :
- Allez dans **Settings** > **Pages**
- Source : sélectionnez **gh-pages**
- Cliquez sur **Save**

---

## ✅ Vérification du déploiement

### Vérifier le push

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter
git remote -v
```

Devrait afficher :
```
origin  https://github.com/VOTRE-USERNAME/bullet-filter.git (fetch)
origin  https://github.com/VOTRE-USERNAME/bullet-filter.git (push)
```

### Vérifier les branches

```bash
git branch -a
```

Devrait afficher :
```
  gh-pages
* main
  remotes/origin/gh-pages
  remotes/origin/main
```

---

## 🌐 URLs après déploiement

Remplacez `VOTRE-USERNAME` :

| Type | URL |
|------|-----|
| **Dépôt** | `https://github.com/VOTRE-USERNAME/bullet-filter` |
| **GitHub Pages** | `https://VOTRE-USERNAME.github.io/bullet-filter/` |
| **Fichiers dist** | `https://VOTRE-USERNAME.github.io/bullet-filter/dist/` |
| **Template** | `https://VOTRE-USERNAME.github.io/bullet-filter/TEMPLATE.html` |
| **Exemple** | `https://VOTRE-USERNAME.github.io/bullet-filter/examples/integration.html` |

---

## 🔄 Mises à jour futures

Pour mettre à jour le dépôt après des modifications :

```bash
cd /Users/emichelin/DEV_PROJECTS/bullet-filter

# Ajouter les modifications
git add .

# Créer un commit
git commit -m "Description de vos modifications"

# Pousser vers GitHub
git push origin main

# Si vous utilisez GitHub Pages, mettre à jour gh-pages
git checkout gh-pages
git merge main
git push origin gh-pages
git checkout main
```

---

## 🆘 Résolution de problèmes

### Erreur : "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/VOTRE-USERNAME/bullet-filter.git
```

### Erreur lors du push

Si vous avez une erreur d'authentification :
1. Assurez-vous d'utiliser un **Personal Access Token** (pas votre mot de passe)
2. Créez un token sur : https://github.com/settings/tokens
3. Utilisez-le comme mot de passe lors du push

### Erreur : "Updates were rejected"

```bash
git pull origin main --rebase
git push origin main
```

---

## 📦 Contenu du dépôt

Ce qui sera déployé sur GitHub :

```
✅ dist/               - 9 fichiers JavaScript et CSS
✅ examples/           - 2 exemples HTML
✅ README.md          - Documentation principale
✅ QUICK-START.md     - Guide rapide
✅ DEPLOY.md          - Guide de déploiement
✅ INTEGRATION.html   - Exemples d'intégration
✅ TEMPLATE.html      - Template prêt à l'emploi
✅ FINAL-RECAP.md     - Récapitulatif complet
✅ LICENSE            - Licence MIT
✅ package.json       - Métadonnées
✅ deploy.sh          - Script de déploiement
```

---

## ✨ Prochaines étapes

Après le déploiement :

1. ✅ Vérifiez que le dépôt est accessible sur GitHub
2. ✅ Attendez 2-3 minutes que GitHub Pages se déploie
3. ✅ Testez l'URL GitHub Pages
4. ✅ Utilisez les scripts d'intégration (voir QUICK-START.md)
5. ✅ Remplacez `VOTRE-USERNAME` dans vos fichiers HTML

---

**Tout est prêt pour le déploiement ! 🚀**
