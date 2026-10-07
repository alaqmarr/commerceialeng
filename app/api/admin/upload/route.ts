import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed types: JPEG, PNG, WEBP, GIF, SVG.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const result = await uploadToR2(
      fileBuffer,
      file.name,
      file.type,
      folder
    );

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        key: result.key,
        size: result.size,
        contentType: result.contentType,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Upload Route Error]:", error);
    const message = error instanceof Error ? error.message : "Internal upload error";
    return NextResponse.json(
      { error: "Image upload failed", details: message },
      { status: 500 }
    );
  }
}
