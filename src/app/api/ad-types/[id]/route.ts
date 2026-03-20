import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const adType = await prisma.adType.findUnique({ where: { id } });

    if (!adType) {
      return NextResponse.json({ error: "Ad type not found" }, { status: 404 });
    }

    return NextResponse.json(adType);
  } catch (error) {
    console.error("Failed to get ad type:", error);
    return NextResponse.json(
      { error: "Failed to get ad type" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    const fields = [
      "name", "category", "description", "imagePromptTemplate",
      "exampleDescription", "requiresQuote", "requiresBeforeAfter",
      "requiresComparison", "active",
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const adType = await prisma.adType.update({ where: { id }, data });
    return NextResponse.json(adType);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Ad type not found" }, { status: 404 });
    }
    console.error("Failed to update ad type:", error);
    return NextResponse.json(
      { error: "Failed to update ad type" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.adType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Ad type not found" }, { status: 404 });
    }
    console.error("Failed to delete ad type:", error);
    return NextResponse.json(
      { error: "Failed to delete ad type" },
      { status: 500 }
    );
  }
}
