import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getHeroSlideByIdQuery,
  updateHeroSlideQuery,
  deleteHeroSlideQuery,
} from "@/modules/hero";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hero = await getHeroSlideByIdQuery(id);

    if (!hero) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(hero);
  } catch (error: unknown) {
    console.error("[Hero GET [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch hero slide";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, subtitle, imageUrl, linkUrl, order, active } = body;

    const existing = await getHeroSlideByIdQuery(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    const updated = await updateHeroSlideQuery(id, {
      ...(title !== undefined && { title: title.trim() }),
      ...(subtitle !== undefined && { subtitle: subtitle?.trim() || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
      ...(linkUrl !== undefined && { linkUrl: linkUrl?.trim() || null }),
      ...(order !== undefined && {
        order: typeof order === "number" ? order : parseInt(order, 10) || 0,
      }),
      ...(active !== undefined && { active: Boolean(active) }),
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[Hero PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update hero slide";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await getHeroSlideByIdQuery(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    await deleteHeroSlideQuery(id);

    return NextResponse.json({ success: true, message: "Hero slide deleted" });
  } catch (error: unknown) {
    console.error("[Hero DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete hero slide";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
