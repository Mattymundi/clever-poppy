import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get all unanalyzed feedback
    const feedback = await prisma.adFeedback.findMany({
      where: { analyzed: false },
      orderBy: { createdAt: "desc" },
    });

    // Group by adTypeName
    const grouped: Record<
      string,
      { kept: number; discarded: number; total: number; items: typeof feedback }
    > = {};

    for (const fb of feedback) {
      const key = fb.adTypeName || "Unknown";
      if (!grouped[key]) {
        grouped[key] = { kept: 0, discarded: 0, total: 0, items: [] };
      }
      grouped[key].total++;
      if (fb.decision === "keep") grouped[key].kept++;
      else grouped[key].discarded++;
      grouped[key].items.push(fb);
    }

    // Convert to array sorted by total count descending
    const groups = Object.entries(grouped)
      .map(([adTypeName, data]) => ({
        adTypeName,
        kept: data.kept,
        discarded: data.discarded,
        total: data.total,
        canAnalyze: data.total >= 20,
        items: data.items.slice(0, 5).map((fb) => ({
          id: fb.id,
          headline: fb.headline,
          decision: fb.decision,
          discardReason: fb.discardReason,
          createdAt: fb.createdAt,
        })),
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ groups, totalPending: feedback.length });
  } catch (error: any) {
    console.error("Failed to load pending feedback:", error);
    return NextResponse.json(
      { error: "Failed to load pending feedback" },
      { status: 500 }
    );
  }
}
