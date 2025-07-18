import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Interface pour les données d'email
interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Fonction pour envoyer un email
export async function sendEmail(emailData: EmailData) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
}

// Template pour l'email de notification de nouveau message
export function getNewMessageEmailTemplate(userName: string, subject: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouveau message de contact</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Détails du message :</h3>
          <p><strong>De :</strong> ${userName}</p>
          <p><strong>Sujet :</strong> ${subject}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contenu du message :</h3>
          <p style="white-space: pre-wrap;">${content}</p>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Ce message a été envoyé depuis le formulaire de contact de votre site.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Template pour l'email de réponse à l'utilisateur
export function getReplyEmailTemplate(userName: string, originalSubject: string, replyContent: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Réponse à votre message</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Réponse à votre message</h2>
        
        <p>Bonjour ${userName},</p>
        
        <p>Nous avons bien reçu votre message concernant : <strong>${originalSubject}</strong></p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Notre réponse :</h3>
          <p style="white-space: pre-wrap;">${replyContent}</p>
        </div>
        
        <p>Si vous avez d'autres questions, n'hésitez pas à nous contacter.</p>
        
        <p>Cordialement,<br>
        L'équipe Margoul1</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px;">
          Cet email a été envoyé en réponse à votre message de contact.
        </p>
      </div>
    </body>
    </html>
  `;
} 