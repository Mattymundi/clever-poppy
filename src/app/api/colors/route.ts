import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const colors = await prisma.colorPalette.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(colors);
  } catch (error) {
    console.error("Failed to list colors:", error);
    return NextResponse.json(
      { error: "Failed to list colors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hex, active } = body;

    if (!name || !hex) {
      return NextResponse.json(
        { error: "name and hex are required" },
        { status: 400 }
      );
    }

    const color = await prisma.colorPalette.create({
      data: {
        name,
        hex,
        active: active ?? true,
      },
    });

    return NextResponse.json(color, { status: 201 });
  } catch (error) {
    console.error("Failed to create color:", error);
    return NextResponse.json(
      { error: "Failed to create color" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, hex, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (hex !== undefined) data.hex = hex;
    if (active !== undefined) data.active = active;

    const color = await prisma.colorPalette.update({
      where: { id },
      data,
    });

    return NextResponse.json(color);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }
    console.error("Failed to update color:", error);
    return NextResponse.json(
      { error: "Failed to update color" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    await prisma.colorPalette.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }
    console.error("Failed to delete color:", error);
    return NextResponse.json(
      { error: "Failed to delete color" },
      { status: 500 }
    );
  }
}
