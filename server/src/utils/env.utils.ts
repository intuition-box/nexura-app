import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

export const port = process.env.PORT || "5600";
export const DB_URI = process.env.DB_URI as string;
export const environment = process.env.ENVIRONMENT as "development" | "production";
export const network = process.env.NETWORK as "testnet" | "mainnet" | undefined;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
export const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
export const AWS_REGION = process.env.AWS_REGION as string;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET as string;
