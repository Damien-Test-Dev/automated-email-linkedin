Automated LinkedIn Publishing System
===================================

Ce projet met en place un système entièrement automatisé qui publie chaque jour de semaine à 9h (heure de Paris) un post LinkedIn contenant du texte et une image.
Le système utilise uniquement des services gratuits : GitHub Actions, Zapier et Buffer.

L’objectif est d’obtenir un pipeline autonome, fiable et sans intervention manuelle.

Objectifs du système

Le système complet permet de :

    Générer automatiquement un post LinkedIn chaque jour de semaine à 9h heure de Paris.

    Sélectionner automatiquement l’image correspondant à la date du jour.

    Renommer et convertir automatiquement les images ajoutées dans le dépôt.

    Supprimer les images âgées de plus de 30 jours.

    Commit automatiquement le fichier du post.

    Déclencher Zapier à chaque commit.

    Publier le post sur LinkedIn via Buffer.

Une fois configuré, le système fonctionne seul.

Architecture générale

Le système repose sur deux workflows GitHub Actions :

    daily_commit.yml

        Exécuté chaque jour de semaine à 9h heure de Paris.

        Génère le fichier post_du_jour.md.

        Sélectionne l’image du jour (format YYYY-MM-DD.jpg).

        Commit automatiquement le fichier.

        Déclenche Zapier.

    rename_images.yml

        Exécuté à chaque ajout d’image dans le dossier images/.

        Convertit automatiquement les images en .jpg.

        Renomme les fichiers au format YYYY-MM-DD.jpg..

        Attribue les prochaines dates disponibles (lundi à vendredi).

        Supprime les images âgées de plus de 30 jours.

        Commit automatiquement les modifications.

Structure du projet

Le dépôt contient les éléments suivants :

    generate_post.py : génère le fichier du post quotidien.

    rename_images.py : renomme, convertit et nettoie les images.

    post_du_jour.md : fichier généré automatiquement.

    images/ : dossier contenant les images datées.

    .github/workflows/daily_commit.yml : workflow de génération du post.

    .github/workflows/rename_images.yml : workflow de gestion des images.

    README.md  : documentation du projet.

Exemple de structure :

/
├── generate_post.py
├── rename_images.py
├── post_du_jour.md
├── images/
│   ├── .gitkeep
│   ├── 2025-12-22.jpg
│   ├── 2025-12-23.jpg
│   └── ...
└── .github/workflows/
├── daily_commit.yml
└── rename_images.yml

Fonctionnement détaillé

    Ajout d’images
    Vous pouvez ajouter des images dans le dossier images/ sans vous soucier du nom ou du format.
    Le workflow rename_images.yml va automatiquement :

        convertir les images en .jpg

        attribuer une date future (lundi à vendredi)

        renommer les fichiers au format YYYY-MM-DD.jpg

        supprimer les images de plus de 30 jours

    Génération du post quotidien
    Chaque jour de semaine à 9h heure de Paris :

        generate_post.py sélectionne l’image du jour

        génère post_du_jour.md

        commit automatiquement

        Zapier détecte le commit

        Zapier envoie le texte et l’image à Buffer

        Buffer publie sur LinkedIn

Format des images

Toutes les images sont automatiquement converties en .jpg.
Ce format est compatible avec :

    GitHub

    Zapier

    Buffer

    LinkedIn

Exemple de fichier généré

Exemple de contenu du fichier post_du_jour.md :
Post LinkedIn du 2025-12-22

Bonjour,

Aujourd’hui, je partage un contenu automatisé.
Grâce à GitHub Actions, Zapier et Buffer, ce post est généré et publié sans intervention manuelle.

Automatisation
Publication quotidienne
Intégration fluide

Image associée :
https://raw.githubusercontent.com/<ton-compte>/<ton-repo>/main/images/2025-12-22.jpg

Déploiement

    Créer le dossier images/ avec un fichier .gitkeep.

    Ajouter les workflows dans .github/workflows/.

    Ajouter les scripts Python à la racine du dépôt.

    Uploader des images dans images/.

    Laisser GitHub Actions gérer le reste.

Notes

Ce système est conçu pour être entièrement autonome.
Il peut être étendu pour gérer plusieurs comptes, plusieurs formats de posts ou d’autres réseaux sociaux.

Fin du README
