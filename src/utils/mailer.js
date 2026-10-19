import nodemailer from 'nodemailer';
import 'dotenv/config';

const port = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: port === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendResetPasswordEmail = async (email, token) => {
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: 'Reset Password Request',
        html: `
      <h2>Reset Password Request</h2>
      <p>Please click the link below to reset your password. This token is valid for 1 hour:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(' Email berhasil terkirim!');
        console.log('Message ID:', info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error(' Gagal mengirim email:', error.message);
        return { success: false, error: error.message };
    }

    return await transporter.sendMail(mailOptions);
};