from datetime import date
import os

def generate_post():
    # Nom du fichier généré
    filename = "post_du_jour.md"

    # URL publique de l'image (hébergée dans ton repo GitHub)
    repo = os.getenv("GITHUB_REPOSITORY", "<ton-compte>/<ton-repo>")
    image_url = f"https://raw.githubusercontent.com/{repo}/main/image.jpg"

    # Contenu du post LinkedIn
    content = f"""# Post LinkedIn du {date.today().isoformat()}

Bonjour 👋,

Aujourd’hui, je partage un contenu automatisé 🚀  
Grâce à **GitHub Actions + Zapier + Buffer**, ce post est généré et publié sans intervention manuelle.  

✨ Automatisation  
📅 Publication quotidienne  
🔗 Intégration fluide  

Image associée :  
{image_url}
"""

    # Écriture dans le fichier
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Fichier généré : {filename}")

if __name__ == "__main__":
    generate_post()
