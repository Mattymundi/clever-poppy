import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleSheetId, googleSheetRange } = body;

    if (!googleSheetId) {
      return NextResponse.json({ error: "googleSheetId is required" }, { status: 400 });
    }

    // Build Google Sheets CSV export URL
    const range = googleSheetRange || "Sheet1";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(range.split("!")[0])}&range=${encodeURIComponent(range.includes("!") ? range.split("!")[1] : "")}`;

    const response = await fetch(csvUrl);
    let csvText: string;
    if (!response.ok) {
      // Fallback: try direct export
      const fallbackUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/export?format=csv`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: "Failed to fetch Google Sheet. Make sure it's shared as 'Anyone with the link can view'." },
          { status: 400 }
        );
      }
      csvText = await fallbackRes.text();
    } else {
      csvText = await response.text();
    }

    // Parse CSV — each line is a callout fact (first column)
    const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);

    // Skip header if it looks like one
    const startIdx = lines.length > 0 && /^["']?(text|fact|callout|label|copy)/i.test(lines[0]) ? 1 : 0;

    const facts: string[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      let text = lines[i];
      // Remove CSV quoting
      text = text.replace(/^"(.*)"$/, "$1").replace(/""/g, '"').trim();
      // Take only first column if there are commas
      if (text.includes(",") && text.startsWith('"') === false) {
        text = text.split(",")[0].trim();
      }
      if (text) facts.push(text);
    }

    if (facts.length === 0) {
      return NextResponse.json({ error: "No callout facts found in sheet" }, { status: 400 });
    }

    // Delete existing facts and recreate from sheet
    await prisma.calloutFact.deleteMany({});

    for (let i = 0; i < facts.length; i++) {
      await prisma.calloutFact.create({
        data: {
          text: facts[i],
          sortOrder: i,
          active: true,
        },
      });
    }

    // Update source record
    const source = await prisma.calloutFactSource.findFirst();
    if (source) {
      await prisma.calloutFactSource.update({
        where: { id: source.id },
        data: {
          googleSheetId,
          googleSheetRange: googleSheetRange || null,
          lastSyncedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: facts.length,
      message: `Synced ${facts.length} callout facts from Google Sheet`,
    });
  } catch (error) {
    console.error("Failed to sync callout facts:", error);
    return NextResponse.json({ error: "Failed to sync callout facts" }, { status: 500 });
  }
}
