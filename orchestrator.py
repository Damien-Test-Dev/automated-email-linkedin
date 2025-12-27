import subprocess
import sys
from datetime import datetime
from pathlib import Path
import csv

LOGS_DIR = Path("logs")
LOG_FILE = LOGS_DIR / "orchestrator_log.csv"

SCRIPTS = [
    ("Validation du calendrier", "repair_calendar.py"),
    ("Gestion des fichiers pending", "manage_pending.py"),
    ("Génération des dates futures", "generate_future_dates.py"),
    ("Réassignation des dates manquantes", "assign_missing_dates.py"),
    ("Préparation du post du jour", "generate_post.py")
]

def ensure_logs_file():
    LOGS_DIR.mkdir(exist_ok=True)
    if not LOG_FILE.exists():
        with LOG_FILE.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["timestamp", "step", "script", "status"])

def log_step(step_name, script, status):
    ensure_logs_file()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, step_name, script, status])

def run_script(name, script):
    print(f"\n=== {name} ({script}) ===")
    try:
        subprocess.run([sys.executable, script], check=True)
        print(f"✔ {name} terminé")
        log_step(name, script, "success")
    except subprocess.CalledProcessError:
        print(f"❌ Erreur lors de l'exécution de : {script}")
        log_step(name, script, "error")
        sys.exit(1)

def main():
    print("=== ORCHESTRATEUR CENTRAL ===")
    print(f"Exécution : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    ensure_logs_file()

    for name, script in SCRIPTS:
        run_script(name, script)

    print("\n=== ORCHESTRATION TERMINÉE ===")
    print("Le système est propre, cohérent, réparé et prêt pour la publication.")

if __name__ == "__main__":
    main()
