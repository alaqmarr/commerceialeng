import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get("status")?.trim();

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(enquiries);
  } catch (error: unknown) {
    console.error("[Enquiries GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch enquiries";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
