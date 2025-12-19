from datetime import datetime
import pytz
import os

def generate_post():
    # Vérifier l'heure locale Paris
    paris_tz = pytz.timezone("Europe/Paris")
    now_paris = datetime.now(paris_tz)

    if now_paris.hour != 9:
        print(f"Il est {now_paris.strftime('%H:%M')} à Paris, pas 9h → aucun post généré.")
        return

    filename = "post_du_jour.md"
    repo = os.getenv("GITHUB_REPOSITORY", "<ton-compte>/<ton-repo>")
    image_url = f"https://raw.githubusercontent.com/{repo}/main/image.jpg"

    content = f"""# Post LinkedIn du {now_paris.date().isoformat()}

Bonjour 👋,

Aujourd’hui, je partage un contenu automatisé 🚀  
Grâce à **GitHub Actions + Zapier + Buffer**, ce post est généré et publié sans intervention manuelle.  

✨ Automatisation  
📅 Publication quotidienne  
🔗 Intégration fluide  

Image associée :  
{image_url}
"""

    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Fichier généré : {filename}")

if __name__ == "__main__":
    generate_post()
