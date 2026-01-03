#!/bin/bash

# ========================================================================
# SCRIPT DE DÉPLOIEMENT BULLET FILTER SUR GITHUB
# ========================================================================
#
# Ce script vous guide dans le déploiement de votre projet Bullet Filter
# sur GitHub avec GitHub Pages activé.
#
# IMPORTANT : Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
#
# ========================================================================

echo "🚀 Déploiement de Bullet Filter sur GitHub"
echo ""

# Configuration
PROJECT_PATH="/Users/emichelin/DEV_PROJECTS/bullet-filter"
GITHUB_USERNAME="VOTRE-USERNAME"  # ⚠️ MODIFIEZ CETTE LIGNE
REPO_NAME="bullet-filter"

echo "📍 Vérification du répertoire du projet..."
cd "$PROJECT_PATH" || {
  echo "❌ Erreur : Le répertoire $PROJECT_PATH n'existe pas"
  exit 1
}

echo "✅ Répertoire du projet trouvé"
echo ""

# Vérifier si un remote existe déjà
if git remote get-url origin &> /dev/null; then
  echo "⚠️  Un remote 'origin' existe déjà : $(git remote get-url origin)"
  echo "Voulez-vous le remplacer ? (y/N)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    git remote remove origin
    echo "✅ Remote 'origin' supprimé"
  else
    echo "❌ Déploiement annulé"
    exit 1
  fi
fi

echo ""
echo "🔗 Ajout du remote GitHub..."

# Ajouter le remote
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

if [ $? -eq 0 ]; then
  echo "✅ Remote ajouté avec succès"
else
  echo "❌ Erreur lors de l'ajout du remote"
  exit 1
fi

echo ""
echo "📤 Préparation de la branche main..."

# S'assurer que nous sommes sur main
git branch -M main

echo ""
echo "🚀 Push vers GitHub..."
echo "⚠️  Vous allez devoir entrer vos identifiants GitHub"
echo ""

# Push vers GitHub
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Code poussé avec succès sur GitHub !"
  echo ""
  echo "🌐 Votre dépôt est disponible à :"
  echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
  echo ""
else
  echo "❌ Erreur lors du push"
  exit 1
fi

# Activer GitHub Pages
echo "📄 Activation de GitHub Pages..."
echo ""
echo "Voulez-vous activer GitHub Pages maintenant ? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
  echo ""
  echo "Création de la branche gh-pages..."
  
  git checkout -b gh-pages
  git push -u origin gh-pages
  git checkout main
  
  echo ""
  echo "✅ Branche gh-pages créée et poussée !"
  echo ""
  echo "📋 Dernière étape manuelle :"
  echo "   1. Allez sur https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/pages"
  echo "   2. Dans 'Source', sélectionnez la branche 'gh-pages'"
  echo "   3. Cliquez sur 'Save'"
  echo ""
  echo "   Après quelques minutes, votre site sera disponible à :"
  echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
  echo ""
else
  echo ""
  echo "⏭️  GitHub Pages non activé"
  echo "   Vous pourrez l'activer plus tard avec ces commandes :"
  echo ""
  echo "   git checkout -b gh-pages"
  echo "   git push -u origin gh-pages"
  echo ""
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo ""
echo "📚 Prochaines étapes :"
echo "   1. Consultez QUICK-START.md pour les scripts d'intégration"
echo "   2. Utilisez TEMPLATE.html comme base pour vos pages"
echo "   3. Remplacez VOTRE-USERNAME par $GITHUB_USERNAME dans vos HTML"
echo ""
echo "🔗 URLs importantes :"
echo "   Dépôt      : https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "   GitHub Pages : https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo "   Fichiers dist : https://$GITHUB_USERNAME.github.io/$REPO_NAME/dist/"
echo ""
echo "Bonne chance ! 🚀"
