import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminCount = await prisma.adminUser.count();
    const isSetup = adminCount > 0;

    return NextResponse.json({
      isSetup,
      adminCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Setup status check failed:", error);
    return NextResponse.json(
      { isSetup: false, error: "Failed to determine setup status" },
      { status: 500 }
    );
  }
}
