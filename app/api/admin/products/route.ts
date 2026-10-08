import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getProductsQuery,
  createProductQuery,
  validateProductInput,
} from "@/modules/products";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();
    const useCaseId = searchParams.get("useCaseId")?.trim();

    const products = await getProductsQuery({
      search,
      categoryId,
      useCaseId,
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
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateProductInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const product = await createProductQuery(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("[Products POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create product";
    const status = msg.includes("already exists")
      ? 409
      : msg.includes("does not exist")
      ? 400
      : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
