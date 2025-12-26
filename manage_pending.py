from pathlib import Path
import shutil
import csv

POSTS_DIR = Path("posts")
IMAGES_DIR = Path("images")
POSTS_PENDING = Path("posts_pending")
IMAGES_PENDING = Path("images_pending")
CSV_FILE = Path("posts_history.csv")

def ensure_dirs():
    POSTS_PENDING.mkdir(exist_ok=True)
    IMAGES_PENDING.mkdir(exist_ok=True)

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

def detect_orphans():
    posts = {p.stem: p for p in POSTS_DIR.glob("*.md")}
    images = {i.stem: i for i in IMAGES_DIR.glob("*.jpg")}
    csv_rows = load_csv()

    csv_dates = {row["date"] for row in csv_rows}

    orphan_posts = []
    orphan_images = []

    for date, post in posts.items():
        if date not in images:
            orphan_posts.append(post)

    for date, img in images.items():
        if date not in posts:
            orphan_images.append(img)

    return orphan_posts, orphan_images

def move_orphans():
    orphan_posts, orphan_images = detect_orphans()

    for post in orphan_posts:
        print(f"Déplacement post orphelin → posts_pending : {post.name}")
        shutil.move(str(post), POSTS_PENDING / post.name)

    for img in orphan_images:
        print(f"Déplacement image orpheline → images_pending : {img.name}")
        shutil.move(str(img), IMAGES_PENDING / img.name)

def main():
    print("=== Gestion des fichiers pending ===")
    ensure_dirs()
    move_orphans()
    print("=== Terminé ===")

if __name__ == "__main__":
    main()
