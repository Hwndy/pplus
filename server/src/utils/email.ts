import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string, tempPassword: string): Promise<void> {
    const subject = 'Welcome to Media Monitoring Dashboard';
    const html = `
      <h1>Welcome to Media Monitoring Dashboard</h1>
      <p>Hello ${userName},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Temporary Password:</strong> ${tempPassword}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p>Best regards,<br>Media Monitoring Team</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void> {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Media Monitoring Team</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendContentApprovalNotification(
    userEmail: string,
    userName: string,
    contentType: string,
    contentTitle: string,
    status: string
  ): Promise<void> {
    const subject = `Content ${status}: ${contentTitle}`;
    const html = `
      <h1>Content ${status}</h1>
      <p>Hello ${userName},</p>
      <p>Your ${contentType} "${contentTitle}" has been ${status.toLowerCase()}.</p>
      <p>You can view the details in your dashboard.</p>
      <p>Best regards,<br>Media Monitoring Team</p>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
