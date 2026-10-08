import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getCategoryByIdOrSlugQuery,
  updateCategoryQuery,
  deleteCategoryQuery,
} from "@/modules/categories";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await getCategoryByIdOrSlugQuery(id, { includeProducts: true });

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
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateCategoryQuery(id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[Category PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update category";
    const status = msg.includes("already in use")
      ? 409
      : msg.includes("not found")
      ? 404
      : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({
      req,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteCategoryQuery(id);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: unknown) {
    console.error("[Category DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete category";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
