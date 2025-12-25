#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
rename_images.py

Objectif :
- Lire les images brutes dans images/
- Ignorer les fichiers vides ou non-images
- Renommer les images selon les dates disponibles (lundi à vendredi)
- Convertir en .jpg si nécessaire
- Supprimer les images brutes après traitement
- Supprimer les images et posts de plus de 30 jours
- Mettre à jour posts_history.csv
"""

from pathlib import Path
from PIL import Image
import datetime
import csv
import os

ROOT_DIR = Path(__file__).parent
IMAGES_DIR = ROOT_DIR / "images"
POSTS_DIR = ROOT_DIR / "posts"
HISTORY_FILE = ROOT_DIR / "posts_history.csv"

WEEKDAYS_TO_USE = {0, 1, 2, 3, 4}  # lundi à vendredi


def ensure_history_file():
    if not HISTORY_FILE.exists():
        with HISTORY_FILE.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["date", "jour", "heure", "image", "etat", "chemin_fichier_post"])


def weekday_name_fr(date_obj):
    jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return jours[date_obj.weekday()]


def append_history(date_str, image_path, etat, post_path=""):
    ensure_history_file()
    date_obj = datetime.date.fromisoformat(date_str)
    jour = weekday_name_fr(date_obj)
    heure = ""

    with HISTORY_FILE.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([date_str, jour, heure, image_path, etat, post_path])


def list_existing_dates():
    used = set()

    # Dates déjà utilisées par les posts
    for file in POSTS_DIR.glob("*.md"):
        try:
            date_str = file.stem
            datetime.date.fromisoformat(date_str)
            used.add(date_str)
        except ValueError:
            continue

    # Dates déjà utilisées par les images
    for file in IMAGES_DIR.glob("*.jpg"):
        try:
            date_str = file.stem
            datetime.date.fromisoformat(date_str)
            used.add(date_str)
        except ValueError:
            continue

    return used


def next_available_dates(n, start_date=None, used_dates=None):
    if start_date is None:
        start_date = datetime.date.today()

    if used_dates is None:
        used_dates = set()

    dates = []
    current_date = start_date

    while len(dates) < n:
        if (
            current_date.weekday() in WEEKDAYS_TO_USE
            and current_date.isoformat() not in used_dates
        ):
            dates.append(current_date.isoformat())
            used_dates.add(current_date.isoformat())

        current_date += datetime.timedelta(days=1)

    return dates


def read_raw_images():
    raw_images = []

    for file in sorted(IMAGES_DIR.iterdir()):
        if not file.is_file():
            continue

        if file.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            continue

        raw_images.append(file)

    return raw_images


def convert_to_jpg(src_path, dest_path):
    img = Image.open(src_path).convert("RGB")
    img.save(dest_path, "JPEG", quality=90)


def cleanup_old_files(days=30):
    cutoff = datetime.date.today() - datetime.timedelta(days=days)

    # Supprimer les images trop anciennes
    for file in IMAGES_DIR.glob("*.jpg"):
        try:
            date_str = file.stem
            date_obj = datetime.date.fromisoformat(date_str)
            if date_obj < cutoff:
                file.unlink()
                print(f"Image supprimée (ancienne) : {file.name}")
        except ValueError:
            continue

    # Supprimer les posts trop anciens
    for file in POSTS_DIR.glob("*.md"):
        try:
            date_str = file.stem
            date_obj = datetime.date.fromisoformat(date_str)
            if date_obj < cutoff:
                file.unlink()
                print(f"Post supprimé (ancien) : {file.name}")
        except ValueError:
            continue


def process_images():
    IMAGES_DIR.mkdir(exist_ok=True)
    POSTS_DIR.mkdir(exist_ok=True)

    raw_images = read_raw_images()
    if not raw_images:
        print("Aucune image brute à traiter.")
        return

    used_dates = list_existing_dates()
    dates = next_available_dates(len(raw_images), used_dates=used_dates)

    print("Attribution des dates aux images :")
    for file, date_str in zip(raw_images, dates):
        print(f"  - {file.name} -> {date_str}.jpg")

    for file, date_str in zip(raw_images, dates):
        final_path = IMAGES_DIR / f"{date_str}.jpg"

        # Conversion si nécessaire
        if file.suffix.lower() != ".jpg":
            convert_to_jpg(file, final_path)
        else:
            file.rename(final_path)

        append_history(
            date_str=date_str,
            image_path=str(final_path.relative_to(ROOT_DIR)),
            etat="image_prete",
            post_path=""
        )

        print(f"Image traitée : {file.name}")

    # Nettoyage des fichiers bruts
    for file in raw_images:
        if file.exists():
            file.unlink()

    # Nettoyage des anciens fichiers
    cleanup_old_files()


if __name__ == "__main__":
    process_images()
