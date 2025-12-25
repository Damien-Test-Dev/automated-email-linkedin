#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
process_raw_posts.py

Objectif :
- Lire les fichiers texte bruts dans posts_raw/
- Ignorer les fichiers vides
- Conserver la mise en forme et les emojis
- Leur attribuer une date unique (lundi à vendredi)
- Créer des fichiers datés dans posts/YYYY-MM-DD.md
- Mettre à jour posts_history.csv
- Supprimer les fichiers bruts traités
"""

from pathlib import Path
import datetime
import csv

# Dossiers de travail
ROOT_DIR = Path(__file__).parent
POSTS_RAW_DIR = ROOT_DIR / "posts_raw"
POSTS_DIR = ROOT_DIR / "posts"
HISTORY_FILE = ROOT_DIR / "posts_history.csv"

# Jours de semaine à utiliser (0 = lundi, 6 = dimanche)
WEEKDAYS_TO_USE = {0, 1, 2, 3, 4}  # lundi à vendredi


def list_existing_post_dates():
    """
    Retourne un ensemble de dates (YYYY-MM-DD) déjà utilisées
    dans le dossier posts/.
    """
    existing_dates = set()
    if not POSTS_DIR.exists():
        return existing_dates

    for file in POSTS_DIR.glob("*.md"):
        try:
            # On s'attend à un nom de fichier type 2025-12-22.md
            date_str = file.stem
            # Validation de la date
            datetime.date.fromisoformat(date_str)
            existing_dates.add(date_str)
        except ValueError:
            # Fichiers qui ne suivent pas le format : on ignore
            continue

    return existing_dates


def next_available_dates(n, start_date=None, used_dates=None):
    """
    Génère n dates (YYYY-MM-DD) uniques à partir d'une date de départ,
    en ne prenant que les jours du lundi au vendredi,
    et en évitant les dates déjà utilisées dans used_dates.
    """
    if start_date is None:
        start_date = datetime.date.today()

    if used_dates is None:
        used_dates = set()

    dates = []
    current_date = start_date

    while len(dates) < n:
        # Si c'est un jour de semaine souhaité et pas déjà utilisé
        if (
            current_date.weekday() in WEEKDAYS_TO_USE
            and current_date.isoformat() not in used_dates
        ):
            dates.append(current_date.isoformat())
            used_dates.add(current_date.isoformat())

        # Jour suivant
        current_date += datetime.timedelta(days=1)

    return dates


def read_raw_posts():
    """
    Lit tous les fichiers dans posts_raw/ et retourne une liste
    de tuples (path, contenu) pour les fichiers non vides.
    """
    raw_posts = []

    if not POSTS_RAW_DIR.exists():
        print("Le dossier 'posts_raw/' n'existe pas, rien à traiter.")
        return raw_posts

    for file in sorted(POSTS_RAW_DIR.iterdir()):
        if not file.is_file():
            continue

        # On accepte .txt, .md, et sans extension
        if file.suffix not in (".txt", ".md", ""):
            continue

        content = file.read_text(encoding="utf-8").strip()

        if not content:
            print(f"Fichier vide ignoré : {file.name}")
            continue

        raw_posts.append((file, content))

    return raw_posts


def ensure_history_file():
    """
    Crée le fichier posts_history.csv avec l'en-tête s'il n'existe pas.
    """
    if not HISTORY_FILE.exists():
        with HISTORY_FILE.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "jour", "heure", "image", "etat", "chemin_fichier_post"])


def weekday_name_fr(date_obj):
    """
    Retourne le nom du jour en français pour une date donnée.
    """
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return jours[date_obj.weekday()]


def append_history(date_str, image_path, etat, post_path):
    """
    Ajoute une ligne dans posts_history.csv.
    Pour l'instant, l'heure est laissée vide ("") car ce script ne publie pas,
    il prépare seulement les posts.
    """
    ensure_history_file()

    date_obj = datetime.date.fromisoformat(date_str)
    jour = weekday_name_fr(date_obj)
    heure = ""  # Heure non définie à ce stade

    with HISTORY_FILE.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([date_str, jour, heure, image_path, etat, post_path])


def process_posts():
    """
    Fonction principale :
    - lit les posts bruts
    - attribue les dates
    - crée les fichiers datés
    - met à jour l'historique
    - supprime les bruts
    """
    POSTS_DIR.mkdir(exist_ok=True)
    POSTS_RAW_DIR.mkdir(exist_ok=True)

    raw_posts = read_raw_posts()
    if not raw_posts:
        print("Aucun post brut à traiter dans 'posts_raw/'.")
        return

    existing_dates = list_existing_post_dates()
    print(f"Dates déjà utilisées : {sorted(existing_dates) if existing_dates else 'aucune'}")

    # Génère autant de dates que de posts à traiter
    dates = next_available_dates(len(raw_posts), used_dates=existing_dates)

    print("Attribution des dates suivantes aux posts bruts :")
    for (file, _), date_str in zip(raw_posts, dates):
        print(f"  - {file.name} -> {date_str}.md")

    for (file, content), date_str in zip(raw_posts, dates):
        date_obj = datetime.date.fromisoformat(date_str)

        # Fichier final dans posts/YYYY-MM-DD.md
        final_path = POSTS_DIR / f"{date_str}.md"

        # On ne modifie PAS le contenu : on le considère déjà optimisé pour LinkedIn
        # On se contente éventuellement d'ajouter une ligne vide à la fin pour l'image
        # L'association exacte avec l'image du jour se fera au moment de la génération / publication
        final_content = content.rstrip() + "\n"

        final_path.write_text(final_content, encoding="utf-8")

        # Pour le moment, on met un placeholder pour l'image dans l'historique
        # L'image finale sera images/YYYY-MM-DD.jpg si elle existe.
        image_path = f"images/{date_str}.jpg"

        append_history(
            date_str=date_str,
            image_path=image_path,
            etat="preparé",
            post_path=str(final_path.relative_to(ROOT_DIR)),
        )

        # Supprime le fichier brut
        file.unlink()
        print(f"Post brut traité et supprimé : {file.name}")

    print("Tous les posts bruts ont été transformés et datés.")


if __name__ == "__main__":
    process_posts()
