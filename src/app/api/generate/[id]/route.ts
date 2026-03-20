import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const run = await prisma.generationRun.findUnique({
      where: { id },
      include: { persona: true },
    });

    if (!run) {
      return NextResponse.json({ error: "Generation run not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...run,
      config: JSON.parse(run.config),
      ads: JSON.parse(run.ads),
      persona: {
        ...run.persona,
        emotionalHooks: JSON.parse(run.persona.emotionalHooks),
        customerQuotes: JSON.parse(run.persona.customerQuotes),
      },
    });
  } catch (error) {
    console.error("Failed to get generation run:", error);
    return NextResponse.json(
      { error: "Failed to get generation run" },
      { status: 500 }
    );
  }
}
