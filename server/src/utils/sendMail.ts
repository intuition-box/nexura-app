import nodemailer from "nodemailer";
import hbs, {
  type NodemailerExpressHandlebarsOptions,
} from "nodemailer-express-handlebars";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import logger from "@/config/logger";
import { EMAIL_USER, EMAIL_PASSWORD, ADMIN_URL, CLIENT_URL } from "./env.utils";

const __dirname = dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
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
        url: `${ADMIN_URL}/register`,
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

export const addProjectAdminEmail = async (email: string, code: string) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Project admin setup",
      template: "admin-setup",
      context: {
        url: `${CLIENT_URL}/studio/register`,
        code
      },
    } as MailOptions);
  } catch (error: any) {
    throw new Error(error.message);
  }
};