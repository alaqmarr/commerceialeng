import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
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

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error("[Product GET [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch product";
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

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { useCases: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId.trim() },
      });
      if (!categoryExists) {
        return NextResponse.json(
          { error: "Selected category does not exist" },
          { status: 400 }
        );
      }
    }

    const updatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : name
      ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
      : existing.slug;

    if (updatedSlug !== existing.slug) {
      const slugConflict = await prisma.product.findUnique({
        where: { slug: updatedSlug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json(
          { error: `Slug "${updatedSlug}" is already in use` },
          { status: 409 }
        );
      }
    }

    let specsString: string | undefined = undefined;
    if (specifications !== undefined) {
      if (specifications === null || specifications === "") {
        specsString = "";
      } else if (typeof specifications === "object") {
        specsString = JSON.stringify(specifications);
      } else {
        specsString = String(specifications).trim();
      }
    }

    let galleryString: string | undefined = undefined;
    if (galleryImages !== undefined) {
      if (galleryImages === null || galleryImages === "") {
        galleryString = "";
      } else if (Array.isArray(galleryImages)) {
        galleryString = JSON.stringify(galleryImages);
      } else {
        galleryString = String(galleryImages).trim();
      }
    }

    // Update product and junction relations in a transaction if useCaseIds provided
    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(useCaseIds)) {
        // Clear old associations
        await tx.productUseCase.deleteMany({
          where: { productId: id },
        });

        // Add new associations
        if (useCaseIds.length > 0) {
          await tx.productUseCase.createMany({
            data: useCaseIds.map((uId: string) => ({
              productId: id,
              useCaseId: uId,
            })),
          });
        }
      }

      return await tx.product.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          slug: updatedSlug,
          ...(description !== undefined && { description: description.trim() }),
          ...(shortDesc !== undefined && { shortDesc: shortDesc?.trim() || null }),
          ...(specsString !== undefined && { specifications: specsString || null }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
          ...(galleryString !== undefined && { galleryImages: galleryString || null }),
          ...(categoryId && { categoryId: categoryId.trim() }),
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
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[Product PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update product";
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

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: unknown) {
    console.error("[Product DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
