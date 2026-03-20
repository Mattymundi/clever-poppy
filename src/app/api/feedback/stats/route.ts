import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Total counts
    const [kept, discarded, total] = await Promise.all([
      prisma.adFeedback.count({ where: { decision: "keep" } }),
      prisma.adFeedback.count({ where: { decision: "discard" } }),
      prisma.adFeedback.count(),
    ]);

    const approvalRate = total > 0 ? Math.round((kept / total) * 100) : 0;

    // Group by ad type
    const byAdTypeRaw = await prisma.adFeedback.groupBy({
      by: ["adTypeName", "adTypeId", "decision"],
      _count: { id: true },
    });

    const adTypeMap = new Map<string, { adTypeName: string; adTypeId: string; kept: number; discarded: number }>();
    for (const row of byAdTypeRaw) {
      const key = row.adTypeName;
      if (!adTypeMap.has(key)) {
        adTypeMap.set(key, { adTypeName: row.adTypeName, adTypeId: row.adTypeId || "", kept: 0, discarded: 0 });
      }
      const entry = adTypeMap.get(key)!;
      if (row.decision === "keep") entry.kept = row._count.id;
      else if (row.decision === "discard") entry.discarded = row._count.id;
    }

    const byAdType = Array.from(adTypeMap.values()).map((e) => ({
      ...e,
      total: e.kept + e.discarded,
      rate: e.kept + e.discarded > 0 ? Math.round((e.kept / (e.kept + e.discarded)) * 100) : 0,
    }));

    // Group by discard reason
    const byDiscardReasonRaw = await prisma.adFeedback.groupBy({
      by: ["discardReason"],
      where: { decision: "discard", discardReason: { not: null } },
      _count: { id: true },
    });

    const byDiscardReason = byDiscardReasonRaw.map((row) => ({
      reason: row.discardReason || "Unknown",
      count: row._count.id,
    }));

    // Group by color
    const byColorRaw = await prisma.adFeedback.groupBy({
      by: ["backgroundColor", "decision"],
      _count: { id: true },
    });

    const colorMap = new Map<string, { color: string; kept: number; discarded: number }>();
    for (const row of byColorRaw) {
      const key = row.backgroundColor;
      if (!colorMap.has(key)) {
        colorMap.set(key, { color: row.backgroundColor, kept: 0, discarded: 0 });
      }
      const entry = colorMap.get(key)!;
      if (row.decision === "keep") entry.kept = row._count.id;
      else if (row.decision === "discard") entry.discarded = row._count.id;
    }

    const byColor = Array.from(colorMap.values()).map((e) => ({
      ...e,
      rate: e.kept + e.discarded > 0 ? Math.round((e.kept / (e.kept + e.discarded)) * 100) : 0,
    }));

    return NextResponse.json({
      totals: { kept, discarded, total, approvalRate },
      byAdType,
      byDiscardReason,
      byColor,
    });
  } catch (error) {
    console.error("Failed to get feedback stats:", error);
    return NextResponse.json(
      { error: "Failed to get feedback stats" },
      { status: 500 }
    );
  }
}
