import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const useCases = await prisma.useCase.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(useCases);
  } catch (error: unknown) {
    console.error("[UseCases GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch use cases";
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
    const { title, slug, description, imageUrl } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Use case title is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Use case description is required" },
        { status: 400 }
      );
    }

    const generatedSlug = (slug && typeof slug === "string" && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existing = await prisma.useCase.findFirst({
      where: {
        OR: [
          { title: title.trim() },
          { slug: generatedSlug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Use case with title "${title}" or slug "${generatedSlug}" already exists` },
        { status: 409 }
      );
    }

    const useCase = await prisma.useCase.create({
      data: {
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json(useCase, { status: 201 });
  } catch (error: unknown) {
    console.error("[UseCases POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create use case";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
