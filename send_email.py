import smtplib
from email.message import EmailMessage
from datetime import date

# Configuration SMTP Outlook
SMTP_SERVER = "smtp.office365.com"
SMTP_PORT = 587
USERNAME = "ton_email_outlook@example.com"
PASSWORD = "ton_mot_de_passe"  # ⚠️ remplace par ton mot de passe ou mot de passe d'application

# Destinataire : l'adresse email Zapier qui déclenche ton workflow
TO_EMAIL = "ton_adresse_zapier@zapiermail.com"

def send_email():
    msg = EmailMessage()
    msg["Subject"] = f"Post LinkedIn du {date.today().isoformat()}"
    msg["From"] = USERNAME
    msg["To"] = TO_EMAIL

    # Corps du message
    msg.set_content(
        "Bonjour 👋,\n\nVoici le texte du post LinkedIn du jour.\n"
        "Automatisé via GitHub Actions + Zapier + Buffer 🚀"
    )

    # Ajouter une image en pièce jointe
    with open("image.jpg", "rb") as f:
        msg.add_attachment(
            f.read(),
            maintype="image",
            subtype="jpeg",
            filename="image.jpg"
        )

    # Envoi via SMTP Outlook
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(USERNAME, PASSWORD)
        server.send_message(msg)

if __name__ == "__main__":
    send_email()
