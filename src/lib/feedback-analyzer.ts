import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

interface AnalysisResult {
  qualityNotes: string;
  approvedExamples: object[];
}

/**
 * Analyze feedback for a specific ad type (only unanalyzed records).
 * After analysis, marks those feedback records as analyzed.
 */
export async function analyzeAdType(
  copyProviderId: string,
  adTypeName: string
): Promise<{
  adTypeId: string;
  adTypeName: string;
  qualityNotes: string;
  examplesCount: number;
  analyzedCount: number;
}> {
  const provider = await prisma.aiProvider.findUniqueOrThrow({
    where: { id: copyProviderId },
  });
  const apiKey = decrypt(provider.apiKey);
  const client = new Anthropic({ apiKey });
  const model = provider.modelName || "claude-sonnet-4-20250514";

  // Load unanalyzed feedback for this ad type
  const feedbackList = await prisma.adFeedback.findMany({
    where: { adTypeName, analyzed: false },
    orderBy: { createdAt: "desc" },
  });

  if (feedbackList.length < 20) {
    throw new Error(`Need at least 20 reviews to analyze (have ${feedbackList.length})`);
  }

  // Find matching AdType record
  const adTypes = await prisma.adType.findMany();
  function normalize(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }
  const adTypeByNormalizedName = new Map<string, (typeof adTypes)[0]>();
  for (const at of adTypes) {
    adTypeByNormalizedName.set(normalize(at.name), at);
    adTypeByNormalizedName.set(normalize(at.id), at);
  }
  const adType = adTypeByNormalizedName.get(normalize(adTypeName));
  if (!adType) {
    throw new Error(`No AdType found matching "${adTypeName}"`);
  }

  const kept = feedbackList.filter((f) => f.decision === "keep");
  const discarded = feedbackList.filter((f) => f.decision === "discard");

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

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let analysis: AnalysisResult;
  try {
    analysis = JSON.parse(text.trim());
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to parse analysis response`);
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

  // Mark feedback records as analyzed
  const feedbackIds = feedbackList.map((f) => f.id);
  await prisma.adFeedback.updateMany({
    where: { id: { in: feedbackIds } },
    data: { analyzed: true },
  });

  return {
    adTypeId: adType.id,
    adTypeName: adType.name,
    qualityNotes: analysis.qualityNotes,
    examplesCount: (analysis.approvedExamples || []).length,
    analyzedCount: feedbackIds.length,
  };
}

/**
 * Legacy: analyze all ad types at once (kept for backwards compat)
 */
export async function analyzeAndImprove(
  copyProviderId: string
): Promise<{ updated: number; results: any[] }> {
  // Get unanalyzed feedback grouped by ad type
  const allFeedback = await prisma.adFeedback.findMany({
    where: { analyzed: false },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, typeof allFeedback>();
  for (const fb of allFeedback) {
    if (!fb.adTypeName) continue;
    if (!grouped.has(fb.adTypeName)) grouped.set(fb.adTypeName, []);
    grouped.get(fb.adTypeName)!.push(fb);
  }

  const results: any[] = [];
  for (const [adTypeName, feedbackList] of grouped) {
    if (feedbackList.length < 20) continue;
    try {
      const result = await analyzeAdType(copyProviderId, adTypeName);
      results.push(result);
    } catch (err: any) {
      console.error(`Analysis failed for ${adTypeName}:`, err.message);
    }
  }

  return { updated: results.length, results };
}
