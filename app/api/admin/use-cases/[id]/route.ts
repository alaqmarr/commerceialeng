import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const useCase = await prisma.useCase.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!useCase) {
      return NextResponse.json(
        { error: "Use case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(useCase);
  } catch (error: unknown) {
    console.error("[UseCase GET [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch use case";
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
    const { title, slug, description, imageUrl } = body;

    const existing = await prisma.useCase.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Use case not found" },
        { status: 404 }
      );
    }

    const updatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : title
      ? title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : existing.slug;

    if (updatedSlug !== existing.slug) {
      const slugConflict = await prisma.useCase.findUnique({
        where: { slug: updatedSlug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `Slug "${updatedSlug}" is already in use` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.useCase.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        slug: updatedSlug,
        description: description !== undefined ? description?.trim() || "" : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl?.trim() || null : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[UseCase PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update use case";
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

    const existing = await prisma.useCase.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Use case not found" },
        { status: 404 }
      );
    }

    await prisma.useCase.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Use case deleted" });
  } catch (error: unknown) {
    console.error("[UseCase DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete use case";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
