import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const [runs, total] = await Promise.all([
      prisma.generationRun.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { persona: { select: { id: true, name: true } } },
      }),
      prisma.generationRun.count(),
    ]);

    const parsed = runs.map((run) => ({
      ...run,
      config: JSON.parse(run.config),
      ads: JSON.parse(run.ads),
    }));

    return NextResponse.json({
      data: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to list generation runs:", error);
    return NextResponse.json(
      { error: "Failed to list generation runs" },
      { status: 500 }
    );
  }
}
