import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const heroes = await prisma.heroImage.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(heroes);
  } catch (error: unknown) {
    console.error("[Hero GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch hero slides";
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
    const { title, subtitle, imageUrl, linkUrl, order, active } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Slide title is required" },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return NextResponse.json(
        { error: "Slide image URL is required" },
        { status: 400 }
      );
    }

    const parsedOrder = typeof order === "number" ? order : parseInt(order || "0", 10) || 0;
    const parsedActive = active !== undefined ? Boolean(active) : true;

    const hero = await prisma.heroImage.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl?.trim() || null,
        order: parsedOrder,
        active: parsedActive,
      },
    });

    return NextResponse.json(hero, { status: 201 });
  } catch (error: unknown) {
    console.error("[Hero POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create hero slide";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
