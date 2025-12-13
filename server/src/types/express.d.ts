import type { NextFunction, Request, Response } from "express";
import { Address } from "viem";

declare global {
	interface GlobalRequest extends Request {
		id?: string;
	}

	type GlobalResponse = Response;

	type GlobalNextFunction = NextFunction;

	type GlobalAddress = Address;

	interface UploadImgParams {
		file: Buffer;
		filename: string;
		folder: string;
		maxSize?: number;
	}
}
