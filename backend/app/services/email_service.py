import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

# Use values from Settings (populated via .env)
EMAIL_HOST = settings.EMAIL_HOST
EMAIL_PORT = settings.EMAIL_PORT
EMAIL_USER = settings.EMAIL_USER
EMAIL_PASS = settings.EMAIL_PASS
SENDER_EMAIL = settings.SENDER_EMAIL

def send_otp_email(recipient: str, otp: str, subject: str = "Tutor Profile Update OTP"):
    """
    Sends an OTP email using Sender.net SMTP.
    """
    if not all([EMAIL_USER, EMAIL_PASS, SENDER_EMAIL]):
        logger.error("[EmailService] SMTP credentials missing in environment variables.")
        return False

    msg = MIMEMultipart()
    msg['From'] = f"StudyLocal <{SENDER_EMAIL}>"
    msg['To'] = recipient
    msg['Subject'] = subject

    # HTML body for a better look
    html = f"""
    <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f9fafb; padding: 40px 0;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; padding: 12px; background: #eef2ff; border-radius: 16px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h2 style="margin-top: 20px; font-size: 24px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">Security Verification</h2>
                </div>
                
                <p style="font-size: 16px; color: #4b5563; text-align: center;">Hello,</p>
                <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">Use the following code to unlock your profile for editing. This code is unique to you.</p>
                
                <div style="background: #f8fafc; padding: 30px; text-align: center; border-radius: 20px; border: 2px dashed #e2e8f0; margin: 30px 0;">
                    <span style="font-size: 42px; font-family: monospace; font-weight: 900; letter-spacing: 8px; color: #4f46e5;">{otp}</span>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Click and hold to copy code</p>
                </div>
                
                <p style="font-size: 14px; color: #64748b; text-align: center; background: #fffbeb; padding: 12px; border-radius: 12px; border: 1px solid #fef3c7;">
                    ⚠️ This code expires in <b>10 minutes</b>.
                </p>
                
                <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8;">
                        If you didn't request this code, you can safely ignore this email. Your account security is our priority.
                    </p>
                    <p style="margin-top: 20px; font-size: 13px; font-weight: 700; color: #1e293b; letter-spacing: 1px; text-transform: uppercase;">
                        StudyLocal Platform
                    </p>
                </div>
            </div>
        </body>
    </html>
    """
    msg.attach(MIMEText(html, 'html'))

    try:
        logger.info(f"[EmailService] Connecting to Gmail SMTP ({EMAIL_HOST}:{EMAIL_PORT})...")
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(SENDER_EMAIL, [recipient], msg.as_string())

        logger.info(f"[EmailService] OTP successfully sent to {recipient}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"[EmailService] Gmail Authentication failed. Check EMAIL_USER and EMAIL_PASS (App Password). Error: {e}")
        return False
    except Exception as e:
        logger.error(f"[EmailService] Failed to send email: {e}")
        return False
