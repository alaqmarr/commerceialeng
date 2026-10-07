import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = "dea007631f3af58f9336129089cc2f14";
const R2_ACCESS_KEY_ID = "7734643724b22c5c1a4601e7d4530e21";
const R2_SECRET_ACCESS_KEY = "YOUR_R2_SECRET_ACCESS_KEY_HERE";
const R2_BUCKET_NAME = "projects-bucket";
const R2_PUBLIC_URL = "https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev";
const R2_S3_API = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_S3_API,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function main() {
  console.log("Connecting to Cloudflare R2...");
  const key = `test/worker-m2-verification-${Date.now()}.txt`;
  const content = "Cloudflare R2 verified by Worker M2 for Commercial Engineering Associates";

  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(content, "utf-8"),
    ContentType: "text/plain",
  }));
  console.log(`Uploaded successfully. Key: ${key}`);

  const publicUrl = `${R2_PUBLIC_URL}/${key}`;
  console.log(`Checking public URL: ${publicUrl}`);

  const res = await fetch(publicUrl);
  console.log(`Fetch status: ${res.status} ${res.statusText}`);
  const text = await res.text();
  console.log(`Fetched content: ${text}`);

  if (text !== content) {
    throw new Error("Content mismatch!");
  }

  console.log("Cleaning up test object from R2...");
  await s3.send(new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  }));
  console.log("Cleanup complete. Cloudflare R2 is 100% operational!");
}

main().catch((err) => {
  console.error("R2 Verification failed:", err);
  process.exit(1);
});
