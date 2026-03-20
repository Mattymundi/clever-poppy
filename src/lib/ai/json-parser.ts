import { AdCopyResult } from "./types";

export function extractJsonArray(text: string): AdCopyResult[] {
  // Strip markdown code fences
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.ads && Array.isArray(parsed.ads)) return parsed.ads;
  } catch {
    // Continue to regex extraction
  }

  // Find JSON array in the text
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Array might be truncated — try to salvage complete objects
    }
  }

  // Try to salvage truncated JSON — find the opening [ and extract complete objects
  const startIdx = cleaned.indexOf("[");
  if (startIdx !== -1) {
    const jsonStr = cleaned.slice(startIdx);

    // Try progressively trimming from the end to find valid JSON
    // First try adding a closing bracket
    for (const suffix of ["]", "}]", "\"}]", "\"}\n]"]) {
      // Find the last complete object by looking for },
      const lastComma = jsonStr.lastIndexOf("},");
      if (lastComma > 0) {
        const trimmed = jsonStr.slice(0, lastComma + 1) + "]";
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.warn(
              `JSON was truncated. Salvaged ${parsed.length} complete ads from partial response.`
            );
            return parsed;
          }
        } catch {
          // Continue trying
        }
      }

      // Also try just closing the array
      try {
        const parsed = JSON.parse(jsonStr + suffix);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Continue
      }
    }
  }

  throw new Error("Could not extract JSON array from AI response");
}
