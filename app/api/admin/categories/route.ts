import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getCategoriesQuery,
  createCategoryQuery,
  validateCategoryInput,
} from "@/modules/categories";

export async function GET() {
  try {
    const categories = await getCategoriesQuery({
      orderBy: "name",
      orderDirection: "asc",
    });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("[Categories GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch categories";
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
    const validation = validateCategoryInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const category = await createCategoryQuery(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error("[Categories POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create category";
    const status = msg.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
