import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client } from "./img.utils";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION } from "./env.utils";
import logger from "@/config/logger";
import { v7 as uuid } from "uuid";

interface UploadFileParams {
  file: Buffer;
  filename?: string;
  contentType?: string;
  folder: string;
}

export const uploadFile = async ({
  file,
  filename,
  contentType,
  folder,
}: UploadFileParams) => {
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET || !AWS_REGION) {
    logger.warn("[uploadFile] AWS credentials not configured — using placeholder link");
    return `https://placehold.co/256x256/7c3aed/ffffff?text=${encodeURIComponent(folder)}`;
  }

  try {
    const safeName = (filename ?? "file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${folder}/${uuid()}-${safeName}`;

    await getS3Client().send(
      new PutObjectCommand({
        ACL: "public-read",
        Body: file,
        Bucket: AWS_S3_BUCKET,
        ContentType: contentType || "application/octet-stream",
        Key: key,
      })
    );

    return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  } catch (error: any) {
    logger.error(error);
    throw new Error(error.message);
  }
};
