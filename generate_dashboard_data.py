from pathlib import Path
import csv
import json
from datetime import datetime

LOG_FILE = Path("logs/orchestrator_log.csv")
REPORTS_DIR = Path("reports")
OUTPUT_DIR = Path("dashboard_data")

def load_logs():
    if not LOG_FILE.exists():
        return []
    with LOG_FILE.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def load_reports():
    reports = []
    for file in REPORTS_DIR.glob("daily_report_*.md"):
        reports.append({
            "date": file.stem.replace("daily_report_", ""),
            "path": str(file)
        })
    return sorted(reports, key=lambda r: r["date"])

def compute_stats(logs):
    total = len(logs)
    errors = sum(1 for l in logs if l["status"] == "error")
    success = total - errors

    return {
        "total_runs": total,
        "success_runs": success,
        "error_runs": errors,
        "success_rate": round((success / total) * 100, 2) if total > 0 else 0
    }

def generate_dashboard_data():
    OUTPUT_DIR.mkdir(exist_ok=True)

    logs = load_logs()
    reports = load_reports()
    stats = compute_stats(logs)

    # 1. health_summary.json
    health_summary = {
        "last_run": logs[-1]["timestamp"] if logs else None,
        "last_status": logs[-1]["status"] if logs else None,
        "stats": stats
    }

    with (OUTPUT_DIR / "health_summary.json").open("w", encoding="utf-8") as f:
        json.dump(health_summary, f, indent=4)

    # 2. daily_logs.json
    with (OUTPUT_DIR / "daily_logs.json").open("w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4)

    # 3. reports.json
    with (OUTPUT_DIR / "reports.json").open("w", encoding="utf-8") as f:
        json.dump(reports, f, indent=4)

    # 4. errors.json
    errors = [l for l in logs if l["status"] == "error"]
    with (OUTPUT_DIR / "errors.json").open("w", encoding="utf-8") as f:
        json.dump(errors, f, indent=4)

    print("Dashboard data generated successfully.")

if __name__ == "__main__":
    generate_dashboard_data()
