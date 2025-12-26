from pathlib import Path
import csv
from datetime import datetime, timedelta

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

def get_last_date(rows):
    if not rows:
        return datetime.today()
    dates = [datetime.strptime(r["date"], "%Y-%m-%d") for r in rows]
    return max(dates)

def generate_future_dates(start_date, days=30):
    future_dates = []
    current = start_date + timedelta(days=1)

    for _ in range(days):
        if current.weekday() < 5:  # 0 = lundi, 4 = vendredi
            future_dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)

    return future_dates

def main():
    print("=== Auto-génération des dates futures ===")

    rows = load_csv()
    last_date = get_last_date(rows)

    print(f"Dernière date trouvée : {last_date.strftime('%Y-%m-%d')}")

    future_dates = generate_future_dates(last_date, days=30)

    print(f"Dates futures générées : {future_dates}")

    for date in future_dates:
        rows.append({
            "date": date,
            "jour": datetime.strptime(date, "%Y-%m-%d").strftime("%A"),
            "heure": "",
            "image": "",
            "etat": "slot",
            "chemin_fichier_post": ""
        })

    rows.sort(key=lambda r: r["date"])
    save_csv(rows)

    print("=== Terminé ===")

if __name__ == "__main__":
    main()
