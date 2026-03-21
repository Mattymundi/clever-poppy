import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds array is required" },
        { status: 400 }
      );
    }

    // Update each ad type's sortOrder to match its position in the array
    const updates = orderedIds.map((id: string, index: number) =>
      prisma.adType.update({
        where: { id },
        data: { sortOrder: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, count: orderedIds.length });
  } catch (error) {
    console.error("Failed to reorder ad types:", error);
    return NextResponse.json(
      { error: "Failed to reorder ad types" },
      { status: 500 }
    );
  }
}
