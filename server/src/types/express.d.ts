import type { NextFunction, Request, Response } from "express";
import { Address } from "viem";
import nodemailer from "nodemailer";

declare global {
	interface GlobalRequest extends Request {
    id?: string;
		role?: string;
	}

	type GlobalResponse = Response;

	type GlobalNextFunction = NextFunction;

	type GlobalAddress = Address;

	interface UploadImgParams {
		file: Buffer;
		filename?: string;
		folder: string;
		maxSize?: number;
	}

	interface MailOptions extends nodemailer.SendMailOptions {
		template?: string;
		context?: {
			[key: string]: any;
		};
	}
}
