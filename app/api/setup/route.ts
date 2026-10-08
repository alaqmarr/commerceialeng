import { NextResponse } from "next/server";
import { setupAdminAction } from "@/modules/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const result = await setupAdminAction(body);

    if (!result.success) {
      const status = result.status || (
        result.error?.includes("locked") || result.error?.includes("already completed")
          ? 403
          : 400
      );
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        admin: result.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An admin account with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error during setup initialization" },
      { status: 500 }
    );
  }
}
