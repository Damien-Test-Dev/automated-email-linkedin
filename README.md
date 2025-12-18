# automated-email-linkedin
Système automatisé gratuit qui envoie chaque jour de semaine à 9h un email via Outlook SMTP contenant texte et image. Zapier reçoit l’email et transmet le contenu à Buffer, qui publie automatiquement un post LinkedIn avec texte + image. Orchestration via GitHub Actions.



# Automated Email to LinkedIn System

## Description
Ce projet met en place un système entièrement automatisé qui :
- Envoie chaque jour de semaine (lundi à vendredi) à 9h un email contenant du texte et une image.
- L’email est reçu par Zapier, qui déclenche un workflow.
- Zapier transmet le contenu (texte + image) à Buffer.
- Buffer publie automatiquement le post sur LinkedIn.

## Objectif
Automatiser un processus complet de publication LinkedIn en utilisant uniquement des services gratuits :
- **GitHub Actions** pour exécuter le script chaque jour.
- **Outlook SMTP** pour envoyer l’email.
- **Zapier** pour recevoir l’email et déclencher l’action.
- **Buffer** pour publier sur LinkedIn.

## Structure du projet
- `send_email.py` : script Python qui génère et envoie l’email quotidien.
- `.github/workflows/email.yml` : workflow GitHub Actions qui exécute le script chaque jour à 9h.
- `image.jpg` : image jointe envoyée avec l’email.
- `README.md` : documentation du projet.

## Fonctionnement
1. GitHub Actions lance le script `send_email.py` chaque jour à 9h.
2. Le script envoie un email via Outlook SMTP à l’adresse Zapier.
3. Zapier reçoit l’email et envoie le contenu à Buffer.
4. Buffer publie le post LinkedIn avec texte + image.

## Tests
Le script peut être testé en local avec :
```bash
python send_email.py
