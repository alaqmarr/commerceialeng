import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        products: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("[Category GET [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch category";
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
    const { name, slug, description, imageUrl } = body;

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : name
      ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : existing.slug;

    // Check slug collision if slug changed
    if (updatedSlug !== existing.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: updatedSlug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `Slug "${updatedSlug}" is already in use` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        slug: updatedSlug,
        description: description !== undefined ? description?.trim() || null : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl?.trim() || null : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[Category PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update category";
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

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: unknown) {
    console.error("[Category DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
