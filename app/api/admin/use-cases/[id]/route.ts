import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getUseCaseBySlugOrIdQuery,
  updateUseCaseQuery,
  deleteUseCaseQuery,
} from "@/modules/use-cases";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const useCase = await getUseCaseBySlugOrIdQuery(id, { includeProducts: true });

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
      secret:
        process.env.NEXTAUTH_SECRET ||
        "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateUseCaseQuery(id, body);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("[UseCase PUT [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to update use case";
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
    await deleteUseCaseQuery(id);
    return NextResponse.json({ success: true, message: "Use case deleted" });
  } catch (error: unknown) {
    console.error("[UseCase DELETE [id] Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete use case";
    const status = msg.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
