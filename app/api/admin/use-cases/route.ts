import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getUseCasesQuery,
  createUseCaseQuery,
  validateUseCaseInput,
} from "@/modules/use-cases";

export async function GET() {
  try {
    const useCases = await getUseCasesQuery({
      orderBy: "title",
      orderDirection: "asc",
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
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateUseCaseInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const useCase = await createUseCaseQuery(body);
    return NextResponse.json(useCase, { status: 201 });
  } catch (error: unknown) {
    console.error("[UseCases POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create use case";
    const status = msg.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
