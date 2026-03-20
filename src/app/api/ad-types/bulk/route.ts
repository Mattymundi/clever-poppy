import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, active } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "active must be a boolean" },
        { status: 400 }
      );
    }

    const result = await prisma.adType.updateMany({
      where: { id: { in: ids } },
      data: { active },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("Failed to bulk update ad types:", error);
    return NextResponse.json(
      { error: "Failed to bulk update ad types" },
      { status: 500 }
    );
  }
}
