📘 README — CMS LinkedIn Automatisé
🚀 Présentation
Ce projet est un CMS LinkedIn automatisé, conçu pour publier chaque jour un post LinkedIn accompagné de son image, sans intervention humaine.

Il repose sur :

GitHub Actions pour l’automatisation

Python pour le traitement des posts et images

Zapier → Buffer → LinkedIn pour la publication

Un dashboard HTML/CSS/JS pour visualiser l’ensemble du calendrier éditorial

Un fichier CSV historique pour le suivi complet

Ce système fonctionne 365 jours par an, même lorsque vous êtes en vacances.

🧠 Fonctionnement global
Le pipeline complet fonctionne en 3 étapes :

1️⃣ Préparation automatique des contenus
Déposez vos posts bruts dans posts_raw/

Déposez vos images brutes dans images/

GitHub Actions transforme automatiquement :

les posts → en fichiers datés (posts/YYYY-MM-DD.md)

les images → en .jpg datés (images/YYYY-MM-DD.jpg)

2️⃣ Génération du post du jour
Chaque matin (lundi → vendredi), GitHub Actions :

exécute generate_post.py

assemble le post du jour + l’image du jour

génère post_du_jour.md

met à jour l’historique

commit le fichier

3️⃣ Publication automatique
Le commit déclenche Zapier → Buffer → LinkedIn :

Zapier détecte post_du_jour.md

Buffer publie le post + l’image sur LinkedIn

📂 Structure du projet
Code
/
├── .github/
│   └── workflows/
│       ├── daily_commit.yml
│       ├── rename_images.yml
│       └── process_raw_posts.yml
│
├── images/
│   └── .gitkeep
│
├── posts_raw/
│   └── .gitkeep
│
├── posts/
│   └── .gitkeep
│
├── dashboard/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── posts_history.csv
│
├── generate_post.py
├── process_raw_posts.py
├── rename_images.py
│
└── README.md
🛠️ Scripts Python
process_raw_posts.py
Transforme les posts bruts en posts datés :

ignore les fichiers vides

conserve la mise en forme et les emojis

attribue des dates (lundi → vendredi)

crée posts/YYYY-MM-DD.md

met à jour posts_history.csv

supprime les fichiers bruts

rename_images.py
Transforme les images brutes en images datées :

accepte .jpg, .jpeg, .png, .webp

convertit en .jpg

attribue des dates (lundi → vendredi)

supprime les images brutes

nettoie les fichiers de plus de 30 jours

met à jour posts_history.csv

generate_post.py
Génère le post du jour :

détecte la date du jour

assemble le texte + l’image

génère post_du_jour.md

met à jour l’historique

utilisé par GitHub Actions pour déclencher Zapier

⚙️ Workflows GitHub Actions
process_raw_posts.yml
Déclenché automatiquement quand des fichiers sont ajoutés dans posts_raw/.

rename_images.yml
Déclenché automatiquement quand des images sont ajoutées dans images/.

daily_commit.yml
Déclenché automatiquement chaque jour à 07:00 (lundi → vendredi).

📊 Dashboard
Accessible dans :

Code
dashboard/index.html
Fonctionnalités :

Synthèse globale (statistiques, couverture, jours manquants)

Semaine en cours (statut par jour)

Calendrier éditorial complet

Filtres (état, période)

Recherche instantanée

Liens directs vers les posts et images

Lecture automatique de posts_history.csv

📈 Historique des posts
Le fichier :

Code
posts_history.csv
contient :

date	jour	heure	image	etat	chemin_fichier_post
Il sert :

au dashboard

au suivi

à la traçabilité

à la publication automatique

🚀 Déploiement & utilisation
1. Ajouter des posts bruts
Déposer vos fichiers texte dans :

Code
posts_raw/
2. Ajouter des images brutes
Déposer vos images dans :

Code
images/
3. Laisser GitHub Actions travailler
Les workflows :

transforment

datent

nettoient

historisent

4. Publication automatique
Chaque matin, le post du jour est généré et publié.

🧩 Personnalisation
Vous pouvez modifier :

l’heure de publication (daily_commit.yml)

la fenêtre de nettoyage (30 jours → modifiable)

le design du dashboard

les états utilisés dans le CSV

la logique d’attribution des dates

🏁 Conclusion
Ce projet constitue un CMS LinkedIn complet, automatisé, extensible, et pilotable via un dashboard moderne.

Il permet :

de préparer des semaines de contenu à l’avance

de publier automatiquement

de suivre l’historique

de visualiser le calendrier éditorial

de réduire le travail manuel à zéro





🏗️ Architecture technique
Code
┌──────────────────────────────┐
│        posts_raw/            │
│   (posts bruts déposés)      │
└───────────────┬──────────────┘
                │ push
                ▼
      GitHub Action : process_raw_posts.yml
                │
                ▼
┌──────────────────────────────┐
│          posts/              │
│  (posts datés générés)       │
└───────────────┬──────────────┘
                │
                ▼
      GitHub Action : daily_commit.yml
                │
                ▼
┌──────────────────────────────┐
│      post_du_jour.md         │
│ (post final + image du jour) │
└───────────────┬──────────────┘
                │ commit
                ▼
           Zapier Trigger
                │
                ▼
             Buffer
                │
                ▼
           LinkedIn Post
Et en parallèle :

Code
images/ → rename_images.yml → images datées + nettoyage
Le dashboard lit :

Code
posts_history.csv → dashboard/index.html
