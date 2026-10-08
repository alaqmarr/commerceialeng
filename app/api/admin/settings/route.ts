import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAllSettingsQuery, upsertSettingsQuery } from "@/modules/settings";

export async function GET() {
  try {
    const { settings, settingsMap } = await getAllSettingsQuery();
    return NextResponse.json({
      settings,
      settingsMap,
    });
  } catch (error: unknown) {
    console.error("[Settings GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings, settingsMap } = await upsertSettingsQuery(body);

    return NextResponse.json({
      success: true,
      settings,
      settingsMap,
    });
  } catch (error: unknown) {
    console.error("[Settings POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
