# 🔍 Extension Chrome SERP Extractor

## 📋 Description
Extension Chrome professionnelle qui permet d'extraire facilement et automatiquement les URLs, titres et meta descriptions des pages de résultats de recherche Google (SERP). Un outil indispensable pour les SEO, marketeurs digitaux et analystes web.

## ✨ Fonctionnalités Principales

### 🎯 Extraction de Données SERP
- **URLs complètes** : Extrait toutes les URLs des résultats de recherche organiques
- **Titres de pages** : Récupère les titres H1/H3 de chaque résultat
- **Meta descriptions** : Capture les descriptions/snippets affichés sous les titres
- **Filtrage intelligent** : Exclut automatiquement les liens Google internes et publicités

### ⚙️ Options Configurables
- **Sélection modulaire** : Choisissez exactement les données à extraire (URLs, titres, descriptions)
- **Mode 100 résultats** : Bouton pour passer de 10 à 100 résultats sur Google automatiquement
- **Format personnalisé** : Sortie structurée et lisible avec numérotation

### 🖥️ Interface Utilisateur
- **Popup moderne** : Interface claire avec design Google Material
- **Boutons intuitifs** : Actions clairement identifiées
- **Messages informatifs** : Feedback en temps réel sur les opérations
- **Copie automatique** : Résultats copiés dans le presse-papiers d'un clic

## 🚀 Installation

### Méthode 1 : Installation depuis GitHub
1. Clonez ce repository : `git clone https://github.com/elgnani/chrome-serp-extractor.git`
2. Ouvrez Chrome et naviguez vers `chrome://extensions/`
3. Activez le "Mode développeur" dans le coin supérieur droit
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier de l'extension

### Méthode 2 : Téléchargement direct
1. Téléchargez tous les fichiers depuis ce repository
2. Créez un dossier local pour l'extension
3. Suivez les étapes 2-5 ci-dessus

## 📖 Guide d'Utilisation

### Démarrage Rapide
1. **Recherche Google** : Effectuez une recherche sur google.com
2. **Activation** : Cliquez sur l'icône de l'extension dans la barre d'outils Chrome
3. **Configuration** : Sélectionnez les types de données à extraire via les checkboxes
4. **Extraction** : Cliquez sur "📋 Extraire les données"
5. **Export** : Utilisez "📄 Copier résultats" pour copier dans le presse-papiers

### Fonctionnalités Avancées
- **Mode 100 résultats** : Cliquez sur "📈 Afficher 100 résultats" pour étendre la SERP
- **Extraction sélective** : Décochez les options non nécessaires pour un export ciblé
- **Réutilisation** : L'extension mémorise vos préférences de sélection

## 🔧 Spécifications Techniques

### Architecture
```
chrome-extension-serp/
├── manifest.json      # Configuration Manifest V3
├── content.js         # Script d'injection et extraction
├── popup.html         # Interface utilisateur
├── popup.js          # Logique métier du popup
└── README.md         # Documentation
```

### Technologies Utilisées
- **Manifest V3** : Dernière version des extensions Chrome
- **JavaScript ES6+** : Code moderne avec async/await
- **CSS3** : Design responsive et moderne
- **Chrome APIs** : activeTab, storage, runtime messaging

### Sélecteurs DOM Optimisés
L'extension utilise des sélecteurs CSS robustes pour capturer les résultats Google :
- `#search .g, #search .tF2Cxc` : Conteneurs de résultats principaux
- `.LC20lb, .DKV0Md` : Sélecteurs de titres multi-versions
- `.VwiC3b, .s3v9rd, .IsZvec` : Sélecteurs de descriptions adaptés aux mises à jour Google

## 🌐 Compatibilité

### Navigateurs Supportés
- ✅ Google Chrome (version 88+)
- ✅ Microsoft Edge Chromium
- ✅ Brave Browser
- ✅ Opera

### Domaines Google Supportés
- ✅ google.com (toutes les versions locales)
- ✅ google.fr, google.co.uk, google.de, etc.
- ✅ Recherches en toutes langues

## 📊 Format de Sortie

### Structure des Données Exportées
```
[1] URL: https://example.com | TITRE: Titre de la page | DESCRIPTION: Meta description
---
[2] URL: https://example2.com | TITRE: Autre titre | DESCRIPTION: Autre description
---
[N] URL: https://exampleN.com | TITRE: Titre N | DESCRIPTION: Description N
```

### Cas d'Usage
- **Analyse SEO** : Étudier la concurrence sur des mots-clés ciblés
- **Research** : Collecter des sources pour des études de marché
- **Link Building** : Identifier des prospects de backlinks
- **Content Marketing** : Analyser les titres et descriptions performants
- **Veille concurrentielle** : Surveiller les positions des concurrents

## 🛡️ Sécurité et Confidentialité

### Permissions Minimales
L'extension demande uniquement :
- `activeTab` : Accès à l'onglet actif pour l'extraction
- `storage` : Sauvegarde des préférences utilisateur localement

### Respect de la Vie Privée
- ✅ Aucune donnée envoyée vers des serveurs externes
- ✅ Traitement local des données uniquement
- ✅ Pas de tracking ou analytics
- ✅ Code source ouvert et auditable

## 👨‍💻 Auteur

**EL GNANI Mohamed**
- Développeur Full-Stack spécialisé en outils SEO et web scraping
- Expert en extensions Chrome et automatisation web

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs via les Issues GitHub
- Proposer des améliorations
- Soumettre des Pull Requests

## 🔄 Changelog

### Version 1.0 (Initial Release)
- Extraction complète des données SERP Google
- Interface popup moderne et intuitive
- Support du mode 100 résultats
- Copie automatique vers presse-papiers
- Compatibility Manifest V3