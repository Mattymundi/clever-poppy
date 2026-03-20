import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

interface AnalysisResult {
  qualityNotes: string;
  approvedExamples: object[];
}

export async function analyzeAndImprove(
  copyProviderId: string
): Promise<{
  updated: number;
  results: Array<{
    adTypeId: string;
    adTypeName: string;
    qualityNotes: string;
    examplesCount: number;
  }>;
}> {
  // Load the AI provider and decrypt key
  const provider = await prisma.aiProvider.findUniqueOrThrow({
    where: { id: copyProviderId },
  });
  const apiKey = decrypt(provider.apiKey);

  const client = new Anthropic({ apiKey });
  const model = provider.modelName || "claude-sonnet-4-20250514";

  // Load all feedback
  const allFeedback = await prisma.adFeedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Group by adTypeName (the snake_case name from Claude's output)
  const grouped = new Map<string, typeof allFeedback>();
  for (const fb of allFeedback) {
    const key = fb.adTypeName;
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(fb);
  }

  // Load all ad types to match by name
  const adTypes = await prisma.adType.findMany();

  // Build a lookup: normalize name to match snake_case from Claude
  // e.g. "Before/After Split" -> "before_after_split", "before-after-split" -> "before_after_split"
  function normalize(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }

  const adTypeByNormalizedName = new Map<string, (typeof adTypes)[0]>();
  for (const at of adTypes) {
    adTypeByNormalizedName.set(normalize(at.name), at);
    adTypeByNormalizedName.set(normalize(at.id), at);
  }

  const results: Array<{
    adTypeId: string;
    adTypeName: string;
    qualityNotes: string;
    examplesCount: number;
  }> = [];

  for (const [adTypeName, feedbackList] of grouped) {
    // Only analyze ad types with >= 5 feedback records
    if (feedbackList.length < 5) {
      console.log(`Skipping "${adTypeName}" — only ${feedbackList.length} reviews (need 5+)`);
      continue;
    }

    // Find matching AdType record
    const adType = adTypeByNormalizedName.get(normalize(adTypeName));
    if (!adType) {
      console.warn(`No AdType found for feedback name "${adTypeName}"`);
      continue;
    }

    const kept = feedbackList.filter((f) => f.decision === "keep");
    const discarded = feedbackList.filter((f) => f.decision === "discard");

    console.log(`Analyzing "${adType.name}": ${kept.length} kept, ${discarded.length} discarded`);

    const prompt = `You are analyzing ad copy and image prompt feedback for the ad type "${adType.name}".

Here are KEPT (approved) ads — the user liked these:
${JSON.stringify(
  kept.map((f) => ({
    headline: f.headline,
    subheadline: f.subheadline,
    bodyCopy: f.bodyCopy,
    cta: f.cta,
    imagePrompt: f.imagePrompt,
    backgroundColor: f.backgroundColor,
  })),
  null,
  2
)}

Here are DISCARDED (rejected) ads — the user did not like these:
${JSON.stringify(
  discarded.map((f) => ({
    headline: f.headline,
    subheadline: f.subheadline,
    bodyCopy: f.bodyCopy,
    cta: f.cta,
    imagePrompt: f.imagePrompt,
    backgroundColor: f.backgroundColor,
    discardReason: f.discardReason,
  })),
  null,
  2
)}

Analyze the patterns in what works vs what doesn't. Focus on the AD COPY (headlines, body, CTA) and the IMAGE PROMPT quality — not the image generation quality itself (that's a model limitation, not a prompt issue).

Return a JSON object with:
1. "qualityNotes": A concise 2-4 sentence guidance paragraph for the AI copywriter about what makes good ads of this type and what patterns to avoid. Be specific and actionable.
2. "approvedExamples": Select the top 3-5 best examples from the KEPT ads (include headline, subheadline, bodyCopy, cta, imagePrompt, backgroundColor).

Return ONLY valid JSON, no markdown fences.`;

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Parse the JSON response
      let analysis: AnalysisResult;
      try {
        analysis = JSON.parse(text.trim());
      } catch {
        // Try extracting JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`Failed to parse analysis for ${adType.name}:`, text);
          continue;
        }
        analysis = JSON.parse(jsonMatch[0]);
      }

      // Update the AdType record
      await prisma.adType.update({
        where: { id: adType.id },
        data: {
          qualityNotes: analysis.qualityNotes,
          approvedExamples: JSON.stringify(analysis.approvedExamples || []),
        },
      });

      console.log(`Updated "${adType.name}" with quality notes and ${(analysis.approvedExamples || []).length} examples`);

      results.push({
        adTypeId: adType.id,
        adTypeName: adType.name,
        qualityNotes: analysis.qualityNotes,
        examplesCount: (analysis.approvedExamples || []).length,
      });
    } catch (err: any) {
      console.error(`Analysis failed for ${adType.name}:`, err.message);
    }
  }

  return { updated: results.length, results };
}
