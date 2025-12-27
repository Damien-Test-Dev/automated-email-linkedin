from pathlib import Path
import csv
import json

CSV_FILE = Path("posts_history.csv")
OUTPUT_DIR = Path("dashboard_data")
OUTPUT_FILE = OUTPUT_DIR / "calendar.json"

def load_csv():
    if not CSV_FILE.exists():
        print("posts_history.csv introuvable.")
        return []

    rows = []
    with CSV_FILE.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "date": row.get("date", ""),
                "jour": row.get("jour", ""),
                "heure": row.get("heure", ""),
                "etat": row.get("etat", ""),
                "image": row.get("image", ""),
                "chemin_fichier_post": row.get("chemin_fichier_post", "")
            })
    return rows

def generate_calendar_json():
    OUTPUT_DIR.mkdir(exist_ok=True)

    data = load_csv()

    # Tri par date
    data_sorted = sorted(data, key=lambda r: r["date"])

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(data_sorted, f, indent=4, ensure_ascii=False)

    print(f"calendar.json généré ({len(data_sorted)} lignes).")

if __name__ == "__main__":
    generate_calendar_json()
