import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const adTypes = await prisma.adType.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(adTypes);
  } catch (error) {
    console.error("Failed to list ad types:", error);
    return NextResponse.json(
      { error: "Failed to list ad types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      description,
      imagePromptTemplate,
      exampleDescription,
      requiresQuote,
      requiresBeforeAfter,
      requiresComparison,
      active,
    } = body;

    if (!name || !category || !description) {
      return NextResponse.json(
        { error: "name, category, and description are required" },
        { status: 400 }
      );
    }

    // Auto-assign typeNumber and sortOrder
    const maxType = await prisma.adType.aggregate({ _max: { typeNumber: true } });
    const nextTypeNumber = Math.max((maxType._max.typeNumber ?? 100) + 1, 101);
    const maxSort = await prisma.adType.aggregate({ _max: { sortOrder: true } });
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const adType = await prisma.adType.create({
      data: {
        name,
        category,
        description,
        imagePromptTemplate: imagePromptTemplate ?? null,
        exampleDescription: exampleDescription ?? null,
        requiresQuote: requiresQuote ?? false,
        requiresBeforeAfter: requiresBeforeAfter ?? false,
        requiresComparison: requiresComparison ?? false,
        typeNumber: nextTypeNumber,
        sortOrder: nextSortOrder,
        active: active ?? true,
      },
    });

    return NextResponse.json(adType, { status: 201 });
  } catch (error) {
    console.error("Failed to create ad type:", error);
    return NextResponse.json(
      { error: "Failed to create ad type" },
      { status: 500 }
    );
  }
}
