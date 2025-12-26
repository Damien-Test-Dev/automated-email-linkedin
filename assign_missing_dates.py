from pathlib import Path
import shutil
import csv
from datetime import datetime, timedelta

POSTS_DIR = Path("posts")
IMAGES_DIR = Path("images")
POSTS_PENDING = Path("posts_pending")
IMAGES_PENDING = Path("images_pending")
CSV_FILE = Path("posts_history.csv")

def load_csv():
    if not CSV_FILE.exists():
        return []
    with CSV_FILE.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def save_csv(rows):
    with CSV_FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["date", "jour", "heure", "image", "etat", "chemin_fichier_post"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

def get_existing_dates():
    return sorted([p.stem for p in POSTS_DIR.glob("*.md")])

def detect_missing_dates(existing_dates):
    if not existing_dates:
        return []

    missing = []
    start = datetime.strptime(existing_dates[0], "%Y-%m-%d")
    end = datetime.strptime(existing_dates[-1], "%Y-%m-%d")

    current = start
    while current <= end:
        d = current.strftime("%Y-%m-%d")
        if d not in existing_dates:
            missing.append(d)
        current += timedelta(days=1)

    return missing

def assign_pending_to_date(date):
    post_files = list(POSTS_PENDING.glob("*.md"))
    img_files = list(IMAGES_PENDING.glob("*.jpg"))

    if not post_files or not img_files:
        print(f"⚠️ Pas assez de fichiers pending pour assigner la date {date}")
        return False

    post = post_files[0]
    img = img_files[0]

    new_post = POSTS_DIR / f"{date}.md"
    new_img = IMAGES_DIR / f"{date}.jpg"

    shutil.move(str(post), new_post)
    shutil.move(str(img), new_img)

    print(f"✔ Assignation automatique : {date} → post + image")

    return True

def update_csv(date):
    rows = load_csv()

    new_row = {
        "date": date,
        "jour": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
        "heure": "",
        "image": f"images/{date}.jpg",
        "etat": "preparé",
        "chemin_fichier_post": f"posts/{date}.md"
    }

    rows.append(new_row)
    rows.sort(key=lambda r: r["date"])
    save_csv(rows)

def main():
    print("=== Auto-réassignation des dates manquantes ===")

    existing_dates = get_existing_dates()
    missing_dates = detect_missing_dates(existing_dates)

    if not missing_dates:
        print("Aucune date manquante détectée.")
        return

    print(f"Dates manquantes détectées : {missing_dates}")

    for date in missing_dates:
        if assign_pending_to_date(date):
            update_csv(date)

    print("=== Terminé ===")

if __name__ == "__main__":
    main()
