import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";

// Environment variable extraction with fallbacks from project spec
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "dea007631f3af58f9336129089cc2f14";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "7734643724b22c5c1a4601e7d4530e21";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "YOUR_R2_SECRET_ACCESS_KEY_HERE";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "projects-bucket";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev";
const R2_S3_API = process.env.R2_S3_API || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

/**
 * AWS SDK v3 S3Client configured for Cloudflare R2
 */
export const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_S3_API,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadResult {
  url: string;
  key: string;
  size?: number;
  contentType?: string;
}

/**
 * Uploads a file buffer to Cloudflare R2 bucket and returns its public CDN URL.
 *
 * @param fileBuffer The raw binary buffer of the file.
 * @param fileName Original file name to preserve extension and readable slug.
 * @param contentType The MIME content-type (e.g., 'image/png').
 * @param folder Optional logical subfolder in the bucket (default: 'uploads').
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() || "bin"
    : "bin";
  
  // Clean file base name (alphanumeric, dashes, underscores)
  const cleanBaseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const randomHash = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}-${randomHash}-${cleanBaseName}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const cleanBaseUrl = R2_PUBLIC_URL.replace(/\/+$/, "");
  const publicUrl = `${cleanBaseUrl}/${key}`;

  return {
    url: publicUrl,
    key,
    size: fileBuffer.length,
    contentType,
  };
}

/**
 * Deletes an object from the Cloudflare R2 bucket by key.
 *
 * @param key The object key path in the bucket.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
