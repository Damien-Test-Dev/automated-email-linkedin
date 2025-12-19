# automated-linkedin-commit
Système automatisé gratuit qui publie chaque jour de semaine à 9h (heure de Paris) un post LinkedIn (texte + image) en utilisant GitHub Actions, Zapier et Buffer. Le contenu est généré automatiquement dans un fichier, commit dans le dépôt, puis transmis à Buffer via Zapier pour diffusion sur LinkedIn.

# Automated LinkedIn Commit System

## Description
Ce projet met en place un système entièrement automatisé qui :
- Génère chaque jour de semaine (lundi à vendredi) à 9h heure locale Paris un fichier `post_du_jour.md` contenant le texte du post LinkedIn et l’URL publique de l’image.
- Commit automatiquement ce fichier dans le dépôt GitHub.
- Déclenche un workflow Zapier à chaque commit.
- Zapier lit le fichier et transmet le texte + l’image à Buffer.
- Buffer publie automatiquement le post sur LinkedIn.

## Objectif
Automatiser un processus complet de publication LinkedIn en utilisant uniquement des services gratuits :
- **GitHub Actions** pour générer le contenu et créer un commit quotidien.
- **Zapier** pour détecter les commits et extraire le contenu du fichier.
- **Buffer** pour publier sur LinkedIn.

## Structure du projet
- `generate_post.py` : script Python qui génère le fichier du post avec texte + URL image.
- `.github/workflows/daily_commit.yml` : workflow GitHub Actions qui exécute le script et commit le fichier chaque jour à 9h.
- `post_du_jour.md` : fichier généré automatiquement, contenant le texte du post et l’URL de l’image.
- `image.jpg` : image stockée dans le dépôt, accessible via une URL publique GitHub.
- `README.md` : documentation du projet.

## Fonctionnement
1. GitHub Actions s’exécute chaque jour à 9h heure locale Paris.
2. Le script `generate_post.py` crée `post_du_jour.md` avec texte formaté (sauts de ligne, emojis) et l’URL publique de l’image.
3. Le fichier est commit dans le dépôt.
4. Zapier détecte le commit et lit le contenu du fichier.
5. Zapier envoie le texte et l’image à Buffer.
6. Buffer publie le post LinkedIn.

## Exemple de contenu généré
```markdown
# Post LinkedIn du 2025-12-19

Bonjour 👋,

Aujourd’hui, je partage un contenu automatisé 🚀  
Grâce à **GitHub Actions + Zapier + Buffer**, ce post est généré et publié sans intervention manuelle.  

✨ Automatisation  
📅 Publication quotidienne  
🔗 Intégration fluide  

Image associée :  
https://raw.githubusercontent.com/<ton-compte>/<ton-repo>/main/image.jpg
