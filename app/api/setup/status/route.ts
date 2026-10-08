import { NextResponse } from "next/server";
import { countAdminsQuery } from "@/modules/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminCount = await countAdminsQuery();
    return NextResponse.json({
      isSetup: adminCount > 0,
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
