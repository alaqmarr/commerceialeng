import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. One-time setup lockout enforcement
    const adminCount = await prisma.adminUser.count();
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Setup already completed. Initial setup is permanently locked." },
        { status: 403 }
      );
    }

    // 2. Parse request payload
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // 3. Validate inputs
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminName = name && typeof name === "string" ? name.trim() : "Administrator";

    // 4. Hash password with bcryptjs (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create primary administrator account
    const admin = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        name: adminName,
        password: hashedPassword,
      },
    });

    // 6. Seed default system settings in Setting table
    const defaultSettings = [
      { key: "COMPANY_NAME", value: "Commercial Engineering Associates", description: "Company legal name" },
      { key: "COMPANY_PHONE", value: "+91 98765 43210", description: "Primary contact phone" },
      { key: "WHATSAPP_NUMBER", value: "919876543210", description: "WhatsApp international format" },
      { key: "SALES_EMAIL", value: normalizedEmail, description: "Sales notification email" },
      { key: "COMPANY_ADDRESS", value: "Plot 42, Phase II, Industrial Area, Sector 58, Industrial Corridors, 110020", description: "Head office address" },
      { key: "SMTP_HOST", value: "smtp.gmail.com", description: "SMTP server host" },
      { key: "SMTP_PORT", value: "587", description: "SMTP server port" },
      { key: "SMTP_USER", value: "", description: "SMTP username" },
      { key: "SMTP_PASS", value: "", description: "SMTP password" },
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin account initialized successfully",
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Setup initialization error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An admin account with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error during setup initialization" },
      { status: 500 }
    );
  }
}
