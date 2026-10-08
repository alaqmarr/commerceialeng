import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getHeroSlidesQuery, createHeroSlideQuery, validateHeroSlideInput } from "@/modules/hero";

export async function GET() {
  try {
    const heroes = await getHeroSlidesQuery();
    return NextResponse.json(heroes);
  } catch (error: unknown) {
    console.error("[Hero GET Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to fetch hero slides";
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
    const validation = validateHeroSlideInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const hero = await createHeroSlideQuery(body);
    return NextResponse.json(hero, { status: 201 });
  } catch (error: unknown) {
    console.error("[Hero POST Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create hero slide";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
