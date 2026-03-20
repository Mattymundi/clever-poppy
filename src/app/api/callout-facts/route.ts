import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all callout facts
export async function GET() {
  try {
    const facts = await prisma.calloutFact.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(facts);
  } catch (error) {
    console.error("Failed to fetch callout facts:", error);
    return NextResponse.json({ error: "Failed to fetch callout facts" }, { status: 500 });
  }
}

// POST create a new callout fact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const maxSort = await prisma.calloutFact.aggregate({ _max: { sortOrder: true } });
    const fact = await prisma.calloutFact.create({
      data: {
        text,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(fact, { status: 201 });
  } catch (error) {
    console.error("Failed to create callout fact:", error);
    return NextResponse.json({ error: "Failed to create callout fact" }, { status: 500 });
  }
}

// PUT update a callout fact (toggle active, edit text)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text, active } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (text !== undefined) data.text = text;
    if (active !== undefined) data.active = active;

    const fact = await prisma.calloutFact.update({
      where: { id },
      data,
    });
    return NextResponse.json(fact);
  } catch (error) {
    console.error("Failed to update callout fact:", error);
    return NextResponse.json({ error: "Failed to update callout fact" }, { status: 500 });
  }
}

// DELETE a callout fact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await prisma.calloutFact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete callout fact:", error);
    return NextResponse.json({ error: "Failed to delete callout fact" }, { status: 500 });
  }
}
