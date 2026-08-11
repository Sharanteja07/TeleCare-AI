import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT_STR = os.getenv("SMTP_PORT", "587")
SMTP_PORT = int(SMTP_PORT_STR) if SMTP_PORT_STR.isdigit() else 587

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def is_smtp_configured() -> bool:
    if not all([SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD]):
        return False
    # Validate against placeholder strings
    for val in [SMTP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD]:
        if val in [
            "placeholder",
            "changeme",
            "your_16_character_gmail_app_password",
            "re_your_api_key",
            "",
        ]:
            return False
    return True


# Alias helpers to prevent ImportErrors in other files checking configuration
is_email_configured = is_smtp_configured
FROM_EMAIL = EMAIL_ADDRESS


def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    if not is_smtp_configured():
        raise ValueError("SMTP configuration is missing or invalid.")

    # Create message
    msg = MIMEMultipart("alternative") if is_html else MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject

    if is_html:
        msg.attach(MIMEText(body, "html"))
    else:
        msg.attach(MIMEText(body, "plain"))

    import logging
    logger = logging.getLogger("uvicorn")
    try:
        # Logging before sending
        logger.info(f"SMTP Send Request - Server: '{SMTP_SERVER}', Port: {SMTP_PORT}, Sender: '{EMAIL_ADDRESS}', Recipient: '{to_email}'")

        # Connect using TLS
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        
        # Log SMTP Connected as required
        logger.info("SMTP Connected")

        server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        server.quit()

        # Log Recipient Email and Success as required
        logger.info(f"Recipient Email: {to_email}")
        logger.info("Email Sent Successfully")
    except Exception as exc:
        # Log SMTP Failure as required
        logger.error(f"SMTP Failure - Failed to send email to '{to_email}'. Error: {exc}")
        raise RuntimeError(f"SMTP delivery failed: {exc}")