interface AdTypeForPrompt {
  name: string;
  category: string;
  description: string;
  imagePromptTemplate?: string;
  exampleDescription?: string;
  requiresQuote?: boolean;
  requiresBeforeAfter?: boolean;
  requiresComparison?: boolean;
  useCalloutFacts?: boolean;
  approvedExamples?: object[];
  qualityNotes?: string;
}

interface ColorForPrompt {
  name: string;
  hex: string;
}

interface ImageForPrompt {
  url: string;
  kitName?: string;
  description?: string;
}

interface BuildPromptParams {
  basePrompt: string;
  adTypes: AdTypeForPrompt[];
  colors: ColorForPrompt[];
  images: ImageForPrompt[];
  emotionalHooks: Array<{ name: string; description: string }>;
  customerQuotes: Array<{ quote: string; attribution: string }>;
  calloutFacts: string[];
  kitNames: string[];
  offer?: string;
  feedbackSummary?: string;
  trendBrief?: string;
}

export function buildSystemPrompt(params: BuildPromptParams): string {
  let prompt = params.basePrompt;

  // Inject ad types
  const adTypesText = params.adTypes
    .map((t, i) => {
      let entry = `${i + 1}. **${t.name}** (${t.category}): ${t.description}`;
      if (t.imagePromptTemplate) {
        entry += `\n   IMAGE PROMPT TEMPLATE: ${t.imagePromptTemplate}`;
      }
      if (t.exampleDescription) {
        entry += `\n   EXAMPLE: ${t.exampleDescription}`;
      }
      const reqs: string[] = [];
      if (t.requiresQuote) reqs.push("must include a customer quote");
      if (t.requiresBeforeAfter) reqs.push("must show before/after states");
      if (t.requiresComparison) reqs.push("must show a comparison");
      if (reqs.length > 0) {
        entry += `\n   REQUIREMENTS: ${reqs.join(", ")}`;
      }
      // Inject callout facts only for ad types that use them
      if (t.useCalloutFacts !== false && params.calloutFacts.length > 0) {
        const factsForType = params.calloutFacts.map((f) => `"${f}"`).join(", ");
        entry += `\n   CALLOUT FACTS (you may use 1-2 of these as badge/callout elements): ${factsForType}`;
      } else if (t.useCalloutFacts === false) {
        entry += `\n   NOTE: Do NOT include any callout fact badges or starburst elements for this ad type.`;
      }
      if (t.qualityNotes) {
        entry += `\n   QUALITY GUIDANCE (from user feedback): ${t.qualityNotes}`;
      }
      if (t.approvedExamples && t.approvedExamples.length > 0) {
        entry += `\n   APPROVED EXAMPLES (emulate this style):\n${JSON.stringify(t.approvedExamples, null, 2)}`;
      }
      return entry;
    })
    .join("\n\n");
  prompt = prompt.replace("{{AD_TYPES}}", adTypesText || "No ad types selected.");

  // Inject color palette
  const colorsText = params.colors
    .map((c) => `- ${c.name}: ${c.hex}`)
    .join("\n");
  prompt = prompt.replace("{{COLOR_PALETTE}}", colorsText || "No colors selected.");

  // Inject image catalogue
  const imagesText = params.images
    .map((img) => {
      let line = img.url;
      if (img.kitName) line += ` (${img.kitName})`;
      if (img.description) line += ` — ${img.description}`;
      return `- ${line}`;
    })
    .join("\n");
  prompt = prompt.replace("{{IMAGE_CATALOGUE}}", imagesText || "No images available.");

  // Inject emotional hooks
  const hooksText = params.emotionalHooks
    .map((h) => `- **${h.name}**: ${h.description}`)
    .join("\n");
  prompt = prompt.replace("{{EMOTIONAL_HOOKS}}", hooksText || "No emotional hooks defined.");

  // Inject customer quotes
  const quotesText = params.customerQuotes
    .map((q) => `- "${q.quote}" — ${q.attribution}`)
    .join("\n");
  prompt = prompt.replace("{{CUSTOMER_QUOTES}}", quotesText || "No customer quotes available.");

  // Remove global callout facts placeholder (callout facts are now injected per ad type)
  prompt = prompt.replace(/\n?.*\{\{CALLOUT_FACTS\}\}.*\n?/g, "\n");

  // Inject kit names (extracted from image library)
  const kitNamesText = params.kitNames.length > 0
    ? params.kitNames.join(", ")
    : "Various embroidery kits";
  prompt = prompt.replace("{{KIT_NAMES}}", kitNamesText);

  // Inject offer (optional — remove section if empty)
  if (params.offer && params.offer.trim()) {
    prompt = prompt.replace("{{CURRENT_OFFER}}", params.offer.trim());
  } else {
    // Remove the entire offer line/section if no offer
    prompt = prompt.replace(/\n?.*\{\{CURRENT_OFFER\}\}.*\n?/g, "\n");
  }

  // Inject feedback summary (optional)
  if (params.feedbackSummary && params.feedbackSummary.trim()) {
    prompt = prompt.replace("{{FEEDBACK_SUMMARY}}", params.feedbackSummary.trim());
  } else {
    prompt = prompt.replace(/\n?.*\{\{FEEDBACK_SUMMARY\}\}.*\n?/g, "");
  }

  // Inject trend brief (optional)
  if (params.trendBrief && params.trendBrief.trim()) {
    prompt = prompt.replace("{{TREND_BRIEF}}", params.trendBrief.trim());
  } else {
    prompt = prompt.replace(/\n?.*\{\{TREND_BRIEF\}\}.*\n?/g, "");
  }

  return prompt;
}
