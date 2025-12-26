import subprocess
import sys
from datetime import datetime

SCRIPTS = [
    ("Validation du calendrier", "repair_calendar.py"),
    ("Gestion des fichiers pending", "manage_pending.py"),
    ("Génération des dates futures", "generate_future_dates.py"),
    ("Réassignation des dates manquantes", "assign_missing_dates.py"),
    ("Préparation du post du jour", "generate_post.py")
]

def run_script(name, script):
    print(f"\n=== {name} ===")
    try:
        subprocess.run([sys.executable, script], check=True)
        print(f"✔ {name} terminé")
    except subprocess.CalledProcessError:
        print(f"❌ Erreur lors de l'exécution de : {script}")
        sys.exit(1)

def main():
    print("=== ORCHESTRATEUR CENTRAL ===")
    print(f"Exécution : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    for name, script in SCRIPTS:
        run_script(name, script)

    print("\n=== ORCHESTRATION TERMINÉE ===")
    print("Le système est propre, cohérent, réparé et prêt pour la publication.")

if __name__ == "__main__":
    main()
