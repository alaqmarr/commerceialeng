import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settingsList = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};

    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      settings: settingsList,
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

    // Check if bulk update or single key-value
    if (body.settings && typeof body.settings === "object") {
      const entries = Object.entries(body.settings);
      for (const [key, val] of entries) {
        if (typeof val === "string") {
          await prisma.setting.upsert({
            where: { key },
            update: { value: val },
            create: { key, value: val },
          });
        }
      }
    } else if (body.key && typeof body.key === "string") {
      const val = body.value !== undefined ? String(body.value) : "";
      await prisma.setting.upsert({
        where: { key: body.key },
        update: {
          value: val,
          description: body.description || undefined,
        },
        create: {
          key: body.key,
          value: val,
          description: body.description || null,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payload format. Expected { settings: {...} } or { key, value }" },
        { status: 400 }
      );
    }

    // Return refreshed settings
    const updatedList = await prisma.setting.findMany();
    const updatedMap: Record<string, string> = {};
    updatedList.forEach((s) => {
      updatedMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: updatedList,
      settingsMap: updatedMap,
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
