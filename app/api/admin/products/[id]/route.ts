import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getProductByIdOrSlugQuery,
  updateProductQuery,
  deleteProductQuery,
} from "@/modules/products";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductByIdOrSlugQuery(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateProductQuery(id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[Product PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update product";
    const status = msg.includes("already in use")
      ? 409
      : msg.includes("not found")
      ? 404
      : msg.includes("does not exist")
      ? 400
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
    await deleteProductQuery(id);
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: unknown) {
    console.error("[Product DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete product";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
