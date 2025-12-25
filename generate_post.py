#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
generate_post.py

Objectif :
- Identifier la date du jour
- Vérifier si un post existe pour cette date
- Vérifier si une image existe pour cette date
- Ajouter automatiquement l'image du jour dans le post
- Mettre à jour posts_history.csv
- Préparer le fichier final pour le commit GitHub Actions
"""

from pathlib import Path
import datetime
import csv

ROOT_DIR = Path(__file__).parent
POSTS_DIR = ROOT_DIR / "posts"
IMAGES_DIR = ROOT_DIR / "images"
HISTORY_FILE = ROOT_DIR / "posts_history.csv"

OUTPUT_FILE = ROOT_DIR / "post_du_jour.md"  # fichier temporaire pour GitHub Actions


def ensure_history_file():
    if not HISTORY_FILE.exists():
        with HISTORY_FILE.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "jour", "heure", "image", "etat", "chemin_fichier_post"])


def weekday_name_fr(date_obj):
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return jours[date_obj.weekday()]


def update_history(date_str, image_path, etat, post_path):
    ensure_history_file()

    date_obj = datetime.date.fromisoformat(date_str)
    jour = weekday_name_fr(date_obj)
    heure = datetime.datetime.now().strftime("%H:%M")

    with HISTORY_FILE.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([date_str, jour, heure, image_path, etat, post_path])


def generate_post():
    today = datetime.date.today()
    date_str = today.isoformat()

    post_path = POSTS_DIR / f"{date_str}.md"
    image_path = IMAGES_DIR / f"{date_str}.jpg"

    # Vérification du post
    if not post_path.exists():
        print(f"Aucun post trouvé pour aujourd'hui ({date_str}).")
        return

    # Vérification de l'image
    if not image_path.exists():
        print(f"Aucune image trouvée pour aujourd'hui ({date_str}).")
        return

    # Lire le contenu du post
    content = post_path.read_text(encoding="utf-8").rstrip()

    # Ajouter l'image du jour
    image_url = f"https://raw.githubusercontent.com/<user>/<repo>/main/images/{date_str}.jpg"

    final_content = (
        content
        + "\n\n"
        + "Image du jour :\n"
        + image_url
        + "\n"
    )

    # Écrire le fichier final pour GitHub Actions
    OUTPUT_FILE.write_text(final_content, encoding="utf-8")

    # Mettre à jour l'historique
    update_history(
        date_str=date_str,
        image_path=str(image_path.relative_to(ROOT_DIR)),
        etat="pret_pour_publication",
        post_path=str(post_path.relative_to(ROOT_DIR)),
    )

    print(f"Post du jour généré : {OUTPUT_FILE.name}")


if __name__ == "__main__":
    generate_post()
