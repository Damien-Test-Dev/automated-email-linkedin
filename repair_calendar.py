import csv
from pathlib import Path
from datetime import datetime

POSTS_DIR = Path("posts")
IMAGES_DIR = Path("images")
CSV_FILE = Path("posts_history.csv")

def load_csv():
    if not CSV_FILE.exists():
        return []

    rows = []
    with CSV_FILE.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def save_csv(rows):
    with CSV_FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "jour", "heure", "image", "etat", "chemin_fichier_post"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

def get_existing_posts():
    return {p.stem: p for p in POSTS_DIR.glob("*.md")}

def get_existing_images():
    return {i.stem: i for i in IMAGES_DIR.glob("*.jpg")}

def repair_calendar():
    print("=== Réparation du calendrier ===")

    rows = load_csv()
    posts = get_existing_posts()
    images = get_existing_images()

    repaired_rows = []
    seen_dates = set()

    for row in rows:
        date = row["date"]
        post_path = row["chemin_fichier_post"]
        image_path = row["image"]

        post_exists = Path(post_path).exists()
        image_exists = Path(image_path).exists()

        if not post_exists and not image_exists:
            print(f"⚠️ Ligne supprimée (post + image manquants) : {date}")
            continue

        if not post_exists and image_exists:
            print(f"⚠️ Post manquant pour {date}, image présente → ligne supprimée")
            continue

        if post_exists and not image_exists:
            print(f"⚠️ Image manquante pour {date}, post présent → ligne supprimée")
            continue

        if date in seen_dates:
            print(f"⚠️ Doublon supprimé : {date}")
            continue

        seen_dates.add(date)
        repaired_rows.append(row)

    repaired_rows.sort(key=lambda r: r["date"])

    save_csv(repaired_rows)

    print("=== Réparation terminée ===")
    print(f"{len(repaired_rows)} lignes valides conservées.")

if __name__ == "__main__":
    repair_calendar()
