import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const persona = await prisma.persona.findUnique({ where: { id } });

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...persona,
      emotionalHooks: JSON.parse(persona.emotionalHooks),
      customerQuotes: JSON.parse(persona.customerQuotes),
    });
  } catch (error) {
    console.error("Failed to get persona:", error);
    return NextResponse.json(
      { error: "Failed to get persona" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, code, description, systemPrompt, emotionalHooks, customerQuotes, toneNotes, active } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (code !== undefined) data.code = code;
    if (description !== undefined) data.description = description;
    if (systemPrompt !== undefined) data.systemPrompt = systemPrompt;
    if (emotionalHooks !== undefined) data.emotionalHooks = JSON.stringify(emotionalHooks);
    if (customerQuotes !== undefined) data.customerQuotes = JSON.stringify(customerQuotes);
    if (toneNotes !== undefined) data.toneNotes = toneNotes;
    if (active !== undefined) data.active = active;

    const persona = await prisma.persona.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...persona,
      emotionalHooks: JSON.parse(persona.emotionalHooks),
      customerQuotes: JSON.parse(persona.customerQuotes),
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    console.error("Failed to update persona:", error);
    return NextResponse.json(
      { error: "Failed to update persona" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.persona.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    console.error("Failed to delete persona:", error);
    return NextResponse.json(
      { error: "Failed to delete persona" },
      { status: 500 }
    );
  }
}
