import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Sync images from a Google Sheet.
 * The sheet must be shared as "Anyone with the link can view".
 *
 * Expected sheet format:
 *   Column A: Image URL (required)
 *   Column B: Kit Name / Label (optional)
 *
 * The first row is treated as a header and skipped.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Fetch the library
    const library = await prisma.imageLibrary.findUnique({ where: { id } });
    if (!library) {
      return NextResponse.json({ error: "Image library not found" }, { status: 404 });
    }

    if (!library.googleSheetId) {
      return NextResponse.json({ error: "No Google Sheet ID configured" }, { status: 400 });
    }

    // Build the CSV export URL
    // For a specific sheet/tab, we'd need the gid, but the range can hint at the sheet name
    const csvUrl = `https://docs.google.com/spreadsheets/d/${library.googleSheetId}/export?format=csv`;

    // If they specified a range like "Sheet2!A:C", extract the sheet name
    if (library.googleSheetRange) {
      const sheetMatch = library.googleSheetRange.match(/^([^!]+)!/);
      if (sheetMatch) {
        // Google Sheets export uses 'sheet' param with the sheet name for named tabs
        // but the gid approach is more reliable. For simplicity, we'll try the gviz approach instead.
      }
    }

    // Use the Google Visualization API which supports sheet names and ranges
    // This returns JSONP-like output we can parse
    let gvizUrl = `https://docs.google.com/spreadsheets/d/${library.googleSheetId}/gviz/tq?tqx=out:csv`;
    if (library.googleSheetRange) {
      gvizUrl += `&sheet=${encodeURIComponent(library.googleSheetRange.split("!")[0] || "Sheet1")}`;
      const rangeMatch = library.googleSheetRange.match(/!(.+)$/);
      if (rangeMatch) {
        gvizUrl += `&range=${encodeURIComponent(rangeMatch[1])}`;
      }
    }

    console.log("Fetching Google Sheet CSV from:", gvizUrl);

    // Try gviz first, fall back to simple CSV export
    let gvizRes = await fetch(gvizUrl, { cache: "no-store" });

    if (!gvizRes.ok) {
      // Fallback to simple CSV export
      console.log("gviz failed, trying simple CSV export:", csvUrl);
      gvizRes = await fetch(csvUrl, { cache: "no-store" });
      if (!gvizRes.ok) {
        return NextResponse.json(
          { error: `Failed to fetch sheet (HTTP ${gvizRes.status}). Make sure the sheet is shared as "Anyone with the link can view".` },
          { status: 400 }
        );
      }
    }

    const csvText = await gvizRes.text();

    if (!csvText.trim()) {
      return NextResponse.json({ error: "Sheet returned empty data" }, { status: 400 });
    }

    // Parse CSV
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return NextResponse.json(
        { error: "Sheet has no data rows (needs at least a header row and one data row)" },
        { status: 400 }
      );
    }

    // Find the image URL column - look for headers containing "url", "image", "link", "src"
    const headers = rows[0].map((h) => h.toLowerCase().trim());
    let urlColIndex = headers.findIndex((h) =>
      /url|image|link|src|photo|picture/.test(h)
    );
    // If no matching header, default to first column
    if (urlColIndex === -1) urlColIndex = 0;

    // Find kit name column - look for headers containing "name", "kit", "label", "title"
    const nameColIndex = headers.findIndex((h) =>
      /name|kit|label|title|description/.test(h)
    );

    // Parse data rows into images
    const images: { url: string; kitName?: string; active: boolean }[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const url = row[urlColIndex]?.trim();

      // Skip empty rows or rows without a URL
      if (!url) continue;

      // Basic URL validation - must look like a URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) continue;

      const image: { url: string; kitName?: string; active: boolean } = {
        url,
        active: true,
      };

      if (nameColIndex !== -1 && row[nameColIndex]?.trim()) {
        image.kitName = row[nameColIndex].trim();
      }

      images.push(image);
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          error: `No valid image URLs found in sheet. Make sure column "${headers[urlColIndex] || "A"}" contains URLs starting with http:// or https://`,
        },
        { status: 400 }
      );
    }

    // Update the library with synced images
    const updated = await prisma.imageLibrary.update({
      where: { id },
      data: {
        images: JSON.stringify(images),
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...updated,
      images: JSON.parse(updated.images),
      syncedCount: images.length,
    });
  } catch (error) {
    console.error("Failed to sync from Google Sheet:", error);
    return NextResponse.json(
      { error: "Failed to sync from Google Sheet" },
      { status: 500 }
    );
  }
}

/**
 * Simple CSV parser that handles quoted fields with commas and newlines.
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(current);
        current = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        row.push(current);
        current = "";
        if (row.some((cell) => cell.trim())) {
          rows.push(row);
        }
        row = [];
        if (char === "\r") i++; // skip \n after \r
      } else {
        current += char;
      }
    }
  }

  // Last field/row
  row.push(current);
  if (row.some((cell) => cell.trim())) {
    rows.push(row);
  }

  return rows;
}
