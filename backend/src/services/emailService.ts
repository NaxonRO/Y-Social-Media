import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_KEY?.startsWith('SG.')) {
  sgMail.setApiKey(SENDGRID_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@y-social.ro';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

export const emailService = {
  async sendVerificationEmail(email: string, username: string, token: string): Promise<void> {
    const link = `${FRONTEND_URL}/verify-email?token=${token}`;

    if (!SENDGRID_KEY?.startsWith('SG.')) {
      console.log(`[EMAIL] Verification link for ${email}: ${link}`);
      return;
    }

    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: 'Verifică adresa de email — Y Social',
      html: `
        <h2>Bun venit pe Y, ${username}!</h2>
        <p>Apasă pe link-ul de mai jos pentru a-ți verifica adresa de email:</p>
        <a href="${link}">Verifică emailul</a>
        <p>Link-ul expiră în 24 de ore.</p>
      `,
    });
  },

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const link = `${FRONTEND_URL}/reset-password?token=${token}`;

    if (!SENDGRID_KEY?.startsWith('SG.')) {
      console.log(`[EMAIL] Password reset link for ${email}: ${link}`);
      return;
    }

    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: 'Resetare parolă — Y Social',
      html: `
        <h2>Resetare parolă</h2>
        <p>Ai solicitat resetarea parolei. Apasă pe link-ul de mai jos:</p>
        <a href="${link}">Resetează parola</a>
        <p>Link-ul expiră în 1 oră. Dacă nu ai solicitat resetarea, ignoră acest email.</p>
      `,
    });
  },
};
