import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsed = personas.map((p) => ({
      ...p,
      emotionalHooks: JSON.parse(p.emotionalHooks),
      customerQuotes: JSON.parse(p.customerQuotes),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list personas:", error);
    return NextResponse.json(
      { error: "Failed to list personas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, systemPrompt, emotionalHooks, customerQuotes, toneNotes, active } = body;

    if (!name || !systemPrompt) {
      return NextResponse.json(
        { error: "name and systemPrompt are required" },
        { status: 400 }
      );
    }

    const persona = await prisma.persona.create({
      data: {
        name,
        code: code ?? "",
        description: description ?? null,
        systemPrompt,
        emotionalHooks: JSON.stringify(emotionalHooks ?? []),
        customerQuotes: JSON.stringify(customerQuotes ?? []),
        toneNotes: toneNotes ?? null,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      {
        ...persona,
        emotionalHooks: JSON.parse(persona.emotionalHooks),
        customerQuotes: JSON.parse(persona.customerQuotes),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create persona:", error);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 }
    );
  }
}
