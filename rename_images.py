import os
import re
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import List, Set, Tuple

from PIL import Image


IMAGES_DIR = Path("images")
DATE_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})\.jpg$")


def is_weekday(d: date) -> bool:
    # 0 = lundi, 6 = dimanche
    return d.weekday() < 5


def parse_date_from_filename(filename: str) -> date | None:
    match = DATE_PATTERN.match(filename)
    if not match:
        return None
    year, month, day = map(int, match.groups())
    try:
        d = date(year, month, day)
    except ValueError:
        return None
    return d


def find_existing_dated_images() -> List[Tuple[date, Path]]:
    dated_images: List[Tuple[date, Path]] = []
    if not IMAGES_DIR.exists():
        return dated_images

    for entry in IMAGES_DIR.iterdir():
        if not entry.is_file():
            continue
        if entry.name == ".gitkeep":
            continue

        d = parse_date_from_filename(entry.name)
        if d is not None and is_weekday(d):
            dated_images.append((d, entry))

    return dated_images


def find_files_to_process() -> List[Path]:
    files: List[Path] = []
    if not IMAGES_DIR.exists():
        return files

    for entry in IMAGES_DIR.iterdir():
        if not entry.is_file():
            continue
        if entry.name == ".gitkeep":
            continue

        # On considère comme "à traiter" tout ce qui n'est pas déjà YYYY-MM-DD.jpg valide
        d = parse_date_from_filename(entry.name)
        if d is None or not is_weekday(d):
            files.append(entry)

    return files


def next_available_weekday(start: date, used_dates: Set[date]) -> date:
    current = start
    while True:
        if is_weekday(current) and current not in used_dates:
            return current
        current += timedelta(days=1)


def convert_to_jpg(source_path: Path, target_path: Path) -> None:
    # Convertit n'importe quelle image en .jpg (RGB)
    with Image.open(source_path) as img:
        rgb = img.convert("RGB")
        target_path.parent.mkdir(parents=True, exist_ok=True)
        rgb.save(target_path, format="JPEG", quality=90)


def assign_dates_and_rename():
    today = date.today()

    # 1. Récupérer toutes les images déjà datées
    dated_images = find_existing_dated_images()
    used_dates: Set[date] = {d for d, _ in dated_images}

    print(f"Dates déjà utilisées : {sorted(used_dates)}")

    # 2. Récupérer tous les fichiers à traiter (mauvais nom ou mauvais jour)
    to_process = find_files_to_process()
    if not to_process:
        print("Aucun fichier à renommer/convertir.")
    else:
        print(f"Fichiers à traiter : {[p.name for p in to_process]}")

    # 3. Pour chaque fichier à traiter → assigner une date future disponible
    for src_path in sorted(to_process):
        # Déterminer l'extension
        ext = src_path.suffix.lower()

        # On ignore les fichiers sans extension ou bizarres
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            print(f"Ignoré (format non supporté) : {src_path.name}")
            continue

        # Calculer la prochaine date libre à partir d'aujourd'hui
        target_date = next_available_weekday(today, used_dates)
        target_name = f"{target_date.isoformat()}.jpg"
        target_path = IMAGES_DIR / target_name

        print(f"{src_path.name} → {target_name}")

        # Si le fichier source a déjà le bon format .jpg mais mauvais nom,
        # on renomme simplement. Sinon on convertit.
        if ext == ".jpg" and parse_date_from_filename(src_path.name) is None:
            # Juste un renommage .jpg -> .jpg
            src_path.rename(target_path)
        else:
            # Conversion en .jpg
            convert_to_jpg(src_path, target_path)
            # Supprimer l'original si différent
            if src_path.exists() and src_path != target_path:
                src_path.unlink()

        used_dates.add(target_date)


def delete_old_images(days: int = 30):
    today = date.today()
    dated_images = find_existing_dated_images()
    deleted = []

    for d, path in dated_images:
        age = (today - d).days
        if age > days:
            print(f"Suppression de {path.name} (âge : {age} jours)")
            path.unlink()
            deleted.append(path.name)

    if not deleted:
        print(f"Aucune image de plus de {days} jours à supprimer.")
    else:
        print(f"Images supprimées : {deleted}")


def main():
    if not IMAGES_DIR.exists():
        print("Le dossier 'images/' n'existe pas, rien à faire.")
        return

    print("=== Étape 1 : Renommage / conversion des nouvelles images ===")
    assign_dates_and_rename()

    print("=== Étape 2 : Suppression des images de plus de 30 jours ===")
    delete_old_images(days=30)

    print("Terminé.")


if __name__ == "__main__":
    main()
