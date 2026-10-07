import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();
    const useCaseId = searchParams.get("useCaseId")?.trim();

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (useCaseId) {
      where.useCases = {
        some: {
          useCaseId,
        },
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        useCases: {
          include: {
            useCase: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error: unknown) {
    console.error("[Products GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch products";
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
    const {
      name,
      slug,
      description,
      shortDesc,
      specifications,
      imageUrl,
      galleryImages,
      categoryId,
      useCaseIds,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Product description is required" },
        { status: 400 }
      );
    }

    if (!categoryId || typeof categoryId !== "string" || !categoryId.trim()) {
      return NextResponse.json(
        { error: "Category selection is required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId.trim() },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 400 }
      );
    }

    const generatedSlug = (slug && typeof slug === "string" && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const existing = await prisma.product.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Product with slug "${generatedSlug}" already exists` },
        { status: 409 }
      );
    }

    // Serialize specifications if object
    let specsString: string | null = null;
    if (specifications) {
      if (typeof specifications === "object") {
        specsString = JSON.stringify(specifications);
      } else if (typeof specifications === "string") {
        specsString = specifications.trim();
      }
    }

    // Serialize galleryImages if array
    let galleryString: string | null = null;
    if (galleryImages) {
      if (Array.isArray(galleryImages)) {
        galleryString = JSON.stringify(galleryImages);
      } else if (typeof galleryImages === "string") {
        galleryString = galleryImages.trim();
      }
    }

    // Create product and associated ProductUseCase records
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        shortDesc: shortDesc?.trim() || null,
        specifications: specsString,
        imageUrl: imageUrl?.trim() || null,
        galleryImages: galleryString,
        categoryId: categoryId.trim(),
        useCases: Array.isArray(useCaseIds) && useCaseIds.length > 0
          ? {
              create: useCaseIds.map((uId: string) => ({
                useCase: {
                  connect: { id: uId },
                },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        useCases: {
          include: {
            useCase: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("[Products POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
