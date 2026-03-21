import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      runId,
      adIndex,
      adTypeName,
      adTypeId,
      personaId,
      headline,
      subheadline,
      bodyCopy,
      cta,
      imagePrompt,
      backgroundColor,
      decision,
      discardReason,
      notes,
      driveFileUrl,
      fileName,
    } = body;

    // Validate required fields
    if (!runId || adIndex === undefined || !decision) {
      return NextResponse.json(
        { error: "Missing required fields: runId, adIndex, decision" },
        { status: 400 }
      );
    }

    // Validate decision value
    if (decision !== "keep" && decision !== "discard") {
      return NextResponse.json(
        { error: 'decision must be "keep" or "discard"' },
        { status: 400 }
      );
    }

    const feedback = await prisma.adFeedback.create({
      data: {
        runId,
        adIndex,
        adTypeName: adTypeName || "",
        adTypeId: adTypeId || null,
        personaId: personaId || null,
        headline: headline || "",
        subheadline: subheadline || null,
        bodyCopy: bodyCopy || null,
        cta: cta || "",
        imagePrompt: imagePrompt || "",
        backgroundColor: backgroundColor || "",
        decision,
        discardReason: discardReason || null,
        notes: notes || null,
        driveFileUrl: driveFileUrl || null,
      },
    });

    // Update Google Sheet with feedback (non-blocking)
    if (fileName) {
      try {
        const { updateFeedbackInSheet } = await import("@/lib/google-sheets");
        await updateFeedbackInSheet(fileName, decision, discardReason);
      } catch (err: any) {
        console.error("Failed to update sheet feedback:", err.message);
      }
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Failed to create feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adTypeId = searchParams.get("adTypeId");
    const decision = searchParams.get("decision");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};
    if (adTypeId) where.adTypeId = adTypeId;
    if (decision) where.decision = decision;

    const [feedback, total] = await Promise.all([
      prisma.adFeedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.adFeedback.count({ where }),
    ]);

    return NextResponse.json({ feedback, total, limit, offset });
  } catch (error) {
    console.error("Failed to list feedback:", error);
    return NextResponse.json(
      { error: "Failed to list feedback" },
      { status: 500 }
    );
  }
}
