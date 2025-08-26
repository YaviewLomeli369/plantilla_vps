import nodemailer from 'nodemailer';

// Import storage to get email configuration
async function getStorageEmailConfig() {
  try {
    const { storage } = await import('./database-storage');
    return await storage.getEmailConfig();
  } catch (error) {
    console.error('Error getting email config from storage:', error);
    return null;
  }
}

// Email configuration
interface EmailConfig {
  from: string;
  replyTo?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
}

// Fallback configuration for testing (uses Ethereal Email for development)
const fallbackConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@tuempresa.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'contacto@tuempresa.com',
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};

// Create transporter
let transporter: nodemailer.Transporter | null = null;

// Function to reset transporter when config changes
export function resetTransporter() {
  transporter = null;
}

async function createTransporter() {
  if (transporter) return transporter;

  try {
    // First try to get configuration from database
    const dbConfig = await getStorageEmailConfig();
    let config = fallbackConfig;

    if (dbConfig && dbConfig.isActive) {
      console.log('Using email configuration from database');
      config = {
        from: dbConfig.fromEmail,
        replyTo: dbConfig.replyToEmail,
        host: dbConfig.smtpHost,
        port: dbConfig.smtpPort || 587,
        secure: dbConfig.smtpSecure || false,
        user: dbConfig.smtpUser,
        pass: dbConfig.smtpPass,
      };
    } else {
      console.log('No active email configuration found in database, using fallback');
    }

    // If no credentials are provided, create a test account
    if (!config.user || !config.pass) {
      console.log('No email credentials found, creating test account...');
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('Test email account created:', testAccount.user);
      console.log('Preview emails at: https://ethereal.email');
    } else {
      // ✅ FIX: Usar createTransport, no createTransporter
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    }

    // Verify connection
    await transporter.verify();
    console.log('Email transporter ready');
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    throw error;
  }
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const emailTransporter = await createTransporter();

    // Get active config for sending
    const dbConfig = await getStorageEmailConfig();
    let activeConfig = fallbackConfig;

    if (dbConfig && dbConfig.isActive) {
      activeConfig = {
        from: dbConfig.fromEmail,
        replyTo: dbConfig.replyToEmail,
        host: dbConfig.smtpHost,
        port: dbConfig.smtpPort || 587,
        secure: dbConfig.smtpSecure || false,
        user: dbConfig.smtpUser,
        pass: dbConfig.smtpPass,
      };
    }

    const mailOptions = {
      from: activeConfig.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || activeConfig.replyTo,
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // Log preview URL for test accounts
    if (info.messageId && info.messageId.includes('@ethereal.email')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendContactReply(to: string, originalSubject: string, replyContent: string): Promise<boolean> {
  const subject = `Re: ${originalSubject}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Respuesta a tu mensaje de contacto</h2>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <div style="color: #495057; line-height: 1.6; white-space: pre-wrap;">${replyContent}</div>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px;">
        <p>Este es un mensaje automático enviado desde nuestro sistema de contacto.</p>
        <p>Si tienes más preguntas, puedes responder directamente a este correo.</p>
      </div>
    </div>
  `;

  const text = `Respuesta a tu mensaje de contacto:\n\n${replyContent}\n\nEste es un mensaje automático enviado desde nuestro sistema de contacto.\nSi tienes más preguntas, puedes responder directamente a este correo.`;

  return await sendEmail({
    to,
    subject,
    text,
    html,
  });
}