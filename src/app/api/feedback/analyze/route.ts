import { NextRequest, NextResponse } from "next/server";
import { analyzeAdType, analyzeAndImprove } from "@/lib/feedback-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { copyProviderId, adTypeName } = body;

    if (!copyProviderId) {
      return NextResponse.json(
        { error: "copyProviderId is required" },
        { status: 400 }
      );
    }

    // Per-ad-type analysis
    if (adTypeName) {
      const result = await analyzeAdType(copyProviderId, adTypeName);
      return NextResponse.json({
        message: `Analysis complete for ${result.adTypeName}. ${result.analyzedCount} reviews processed.`,
        ...result,
      });
    }

    // Legacy: analyze all
    const result = await analyzeAndImprove(copyProviderId);
    return NextResponse.json({
      message: `Analysis complete. Updated ${result.updated} ad types.`,
      ...result,
    });
  } catch (error: any) {
    console.error("Failed to analyze feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze feedback" },
      { status: 500 }
    );
  }
}
