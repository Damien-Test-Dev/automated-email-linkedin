from pathlib import Path
import csv
from datetime import datetime

LOG_FILE = Path("logs/orchestrator_log.csv")
REPORTS_DIR = Path("reports")

def load_logs():
    if not LOG_FILE.exists():
        return []

    rows = []
    with LOG_FILE.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def generate_report():
    REPORTS_DIR.mkdir(exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    report_path = REPORTS_DIR / f"daily_report_{today}.md"

    logs = load_logs()
    today_logs = [l for l in logs if l["timestamp"].startswith(today)]

    status_global = "success"
    if any(l["status"] == "error" for l in today_logs):
        status_global = "error"

    with report_path.open("w", encoding="utf-8") as f:
        f.write(f"# Daily Report — {today}\n\n")
        f.write(f"**Statut global : `{status_global.upper()}`**\n\n")

        if not today_logs:
            f.write("Aucune entrée de log pour aujourd'hui.\n")
            return

        f.write("## Détails des étapes\n\n")
        f.write("| Heure | Étape | Script | Statut |\n")
        f.write("|-------|-------|---------|--------|\n")

        for entry in today_logs:
            time = entry["timestamp"].split(" ")[1]
            f.write(f"| {time} | {entry['step']} | {entry['script']} | {entry['status']} |\n")

        f.write("\n---\n")
        f.write("Rapport généré automatiquement par le système.\n")

    return report_path

if __name__ == "__main__":
    path = generate_report()
    print(f"Rapport généré : {path}")
