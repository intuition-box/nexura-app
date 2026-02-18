import type { NextFunction, Request, Response } from "express";
import { Address } from "viem";
import nodemailer from "nodemailer";

declare global {
	interface GlobalRequest extends Request {
    id?: string;
    role?: string;
    adminName?: string;
    project?: string;
    token?: string;
    campaignCreator?: any;
  }

  type Unit =
      | "Years"
      | "Year"
      | "Yrs"
      | "Yr"
      | "Y"
      | "Weeks"
      | "Week"
      | "W"
      | "Days"
      | "Day"
      | "D"
      | "Hours"
      | "Hour"
      | "Hrs"
      | "Hr"
      | "H"
      | "Minutes"
      | "Minute"
      | "Mins"
      | "Min"
      | "M"
      | "Seconds"
      | "Second"
      | "Secs"
      | "Sec"
      | "s"
      | "Milliseconds"
      | "Millisecond"
      | "Msecs"
      | "Msec"
      | "Ms";

  type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

  type StringValue =
      | `${number}`
      | `${number}${UnitAnyCase}`
      | `${number} ${UnitAnyCase}`;

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
