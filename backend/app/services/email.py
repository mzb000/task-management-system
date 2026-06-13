"""Email sending service (SMTP). Falls back to console logging in dev."""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email. If SMTP isn't configured, log to console (dev mode)."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("\n" + "=" * 60)
        print(f"[DEV EMAIL] To: {to_email}")
        print(f"[DEV EMAIL] Subject: {subject}")
        print(f"[DEV EMAIL] Body:\n{html_body}")
        print("=" * 60 + "\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"[EMAIL ERROR] {exc}")
        return False


def send_reset_password_email(to_email: str, token: str) -> bool:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
      <h2 style="color:#6366f1;">TaskFlow Password Reset</h2>
      <p>You requested a password reset. Click the button below to set a new password.
      This link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
      <a href="{reset_link}"
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                text-decoration:none;border-radius:8px;margin:16px 0;">
        Reset Password
      </a>
      <p style="color:#888;font-size:13px;">If you didn't request this, ignore this email.</p>
    </div>
    """
    return send_email(to_email, "Reset your TaskFlow password", html)
