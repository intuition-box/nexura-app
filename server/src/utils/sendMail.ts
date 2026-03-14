import nodemailer from "nodemailer";
import hbs, {
  type NodemailerExpressHandlebarsOptions,
} from "nodemailer-express-handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import logger from "@/config/logger";
import axios from "axios";
import {
  EMAIL_USER,
  EMAIL_PASSWORD,
  ADMIN_URL,
  CLIENT_URL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  RESEND_API_KEY,
  RESEND_FROM,
} from "./env.utils";

const __dirname = dirname(fileURLToPath(import.meta.url));

const smtpHost = SMTP_HOST?.trim() || "smtp.gmail.com";
const smtpPort = Number(SMTP_PORT || "587");
const smtpSecure = SMTP_SECURE?.trim().toLowerCase() === "true" || smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: !smtpSecure,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  tls: {
    servername: smtpHost,
  },
});

const directInviteTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

const options: NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    partialsDir: path.resolve(__dirname, "../utils/templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../utils/templates"),
};

transporter.use("compile", hbs(options));

export const sendEmailToAdmin = async (email: string, code: string) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Complete Nexura Admin Setup",
      template: "admin",
      context: {
        url: `${ADMIN_URL}/admin/signup`,
        code
      },
    } as MailOptions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resetEmail = async (email: string, link: string) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Reset Password",
      template: "reset",
      context: {
        link
      },
    } as MailOptions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const addHubAdminEmail = async (email: string, code: string, origin?: string) => {
  const baseUrl = origin || CLIENT_URL;
  const signUpUrl = `${baseUrl}/studio/register?email=${encodeURIComponent(email)}`;
  logger.info(`Sending admin invite to ${email} with link ${signUpUrl}`);

  if (RESEND_API_KEY) {
    // Use Resend HTTP API — works from any cloud host (no SMTP ports needed)
    try {
      const from = RESEND_FROM || "Nexura <onboarding@resend.dev>";
      await axios.post(
        "https://api.resend.com/emails",
        {
          from,
          to: [email],
          subject: "Hub admin setup",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 24px;">
              <h2 style="margin: 0 0 16px;">You have been invited to Nexura Studio</h2>
              <p style="margin: 0 0 12px;">You have been invited to join a hub on Nexura Studio as an admin.</p>
              <p style="margin: 0 0 12px;">Your access code is <strong>${code}</strong>.</p>
              <p style="margin: 0 0 20px;">Use the button below to complete your setup and create your password.</p>
              <p style="margin: 0 0 24px;">
                <a href="${signUpUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;">Complete Admin Setup</a>
              </p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">If the button does not work, use this link:</p>
              <p style="margin: 0; font-size: 14px; word-break: break-all; color: #2563eb;">${signUpUrl}</p>
            </div>
          `,
          text: `You have been invited to join a hub on Nexura Studio as an admin.\n\nYour access code is: ${code}\n\nComplete your setup here: ${signUpUrl}`,
        },
        {
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      logger.info(`Admin invite email sent via Resend to ${email}`);
      return;
    } catch (error: any) {
      const detail = error?.response?.data ?? error.message;
      logger.error(`Resend failed for ${email}:`, JSON.stringify(detail));
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  }

  // Fallback: SMTP (works locally; may timeout on some cloud hosts)
  try {
    await directInviteTransporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Hub admin setup",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 16px;">You have been invited to Nexura Studio</h2>
          <p style="margin: 0 0 12px;">You have been invited to join a hub on Nexura Studio as an admin.</p>
          <p style="margin: 0 0 12px;">Your access code is <strong>${code}</strong>.</p>
          <p style="margin: 0 0 20px;">Use the button below to complete your setup and create your password.</p>
          <p style="margin: 0 0 24px;">
            <a href="${signUpUrl}" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;">Complete Admin Setup</a>
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">If the button does not work, use this link:</p>
          <p style="margin: 0; font-size: 14px; word-break: break-all; color: #2563eb;">${signUpUrl}</p>
        </div>
      `,
      text: `You have been invited to join a hub on Nexura Studio as an admin.\n\nYour access code is: ${code}\n\nComplete your setup here: ${signUpUrl}`,
    } as MailOptions);
    logger.info(`Admin invite email sent via SMTP to ${email}`);
  } catch (error: any) {
    logger.error(`SMTP failed for ${email}:`, error.message);
    throw new Error(error.message);
  }
};