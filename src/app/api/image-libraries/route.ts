import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const libraries = await prisma.imageLibrary.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsed = libraries.map((lib) => ({
      ...lib,
      images: JSON.parse(lib.images),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list image libraries:", error);
    return NextResponse.json(
      { error: "Failed to list image libraries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sourceType, googleSheetId, googleSheetRange, images, active } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const library = await prisma.imageLibrary.create({
      data: {
        name,
        sourceType: sourceType ?? "manual",
        googleSheetId: googleSheetId ?? null,
        googleSheetRange: googleSheetRange ?? null,
        images: JSON.stringify(images ?? []),
        active: active ?? true,
      },
    });

    return NextResponse.json(
      { ...library, images: JSON.parse(library.images) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create image library:", error);
    return NextResponse.json(
      { error: "Failed to create image library" },
      { status: 500 }
    );
  }
}
