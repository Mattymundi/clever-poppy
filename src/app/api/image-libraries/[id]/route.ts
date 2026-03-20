import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const library = await prisma.imageLibrary.findUnique({ where: { id } });

    if (!library) {
      return NextResponse.json({ error: "Image library not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...library,
      images: JSON.parse(library.images),
    });
  } catch (error) {
    console.error("Failed to get image library:", error);
    return NextResponse.json(
      { error: "Failed to get image library" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.sourceType !== undefined) data.sourceType = body.sourceType;
    if (body.googleSheetId !== undefined) data.googleSheetId = body.googleSheetId;
    if (body.googleSheetRange !== undefined) data.googleSheetRange = body.googleSheetRange;
    if (body.images !== undefined) data.images = JSON.stringify(body.images);
    if (body.active !== undefined) data.active = body.active;
    if (body.lastSyncedAt !== undefined) data.lastSyncedAt = new Date(body.lastSyncedAt);

    const library = await prisma.imageLibrary.update({ where: { id }, data });

    return NextResponse.json({
      ...library,
      images: JSON.parse(library.images),
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Image library not found" }, { status: 404 });
    }
    console.error("Failed to update image library:", error);
    return NextResponse.json(
      { error: "Failed to update image library" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.imageLibrary.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Image library not found" }, { status: 404 });
    }
    console.error("Failed to delete image library:", error);
    return NextResponse.json(
      { error: "Failed to delete image library" },
      { status: 500 }
    );
  }
}
