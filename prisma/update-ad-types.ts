import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, "..", "dev.db"));

const updates: Array<{ id: string; imagePromptTemplate: string; exampleDescription: string }> = [

  // ============================================================
  // COMPARISON-FIRST (skip before-after-split — keep existing)
  // ============================================================

  {
    id: "problem-solution-split",
    imagePromptTemplate: `Create a bold graphic social media ad with a clear two-panel layout (left and right, or top and bottom). PAIN PANEL: Use a muted, desaturated, or dark-toned background. Show "{{problem_text}}" in large bold white or light font. Include a simple visual that represents the pain state — stress lines, tangled threads, a clock icon, or a frustrated silhouette. Keep it visually heavy and uncomfortable. SOLUTION PANEL: Use a vibrant {{background_color}} background. Show "{{solution_text}}" in large bold white font. Place the provided product photo prominently, taking up 40-60% of the panel. Add a simple arrow, chevron, or "→" graphic between the two panels to show transformation. Include 2-3 small callout badges from {{callout_texts}}. Use clean bold sans-serif fonts for all text. This is a designed graphic ad, NOT a photograph. The contrast between pain and solution should be immediate and dramatic. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Pain panel: "Anxious hands, nothing to do" (dark muted background, stress doodles, heavy feel). Arrow pointing right. Solution panel: "Calm hands, beautiful hoop" (bright coral background, Beginner Stitch Sampler displayed proudly, callouts: "Zero experience needed", "Finishable in days"). The shift from heavy to light is immediate and the arrow makes the transformation story obvious.`
  },

  {
    id: "comparison",
    imagePromptTemplate: `Create a bold graphic social media ad with a clean vertical split down the middle. LEFT SIDE: Label "{{competitor_label}}" at the top in bold text. Use a plain, dull background (white or light grey). Show a simple illustration or icon representing a generic/inferior option — plain packaging, question marks, missing items. Add 3-4 short negative bullet points with ✗ marks in red. RIGHT SIDE: Label "{{brand_label}}" at the top in bold text on a vibrant {{background_color}} background. Place the provided product photo prominently, taking up 40-50% of this half. Add 3-4 short positive bullet points with ✓ marks in green or white. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts for all text. This is a designed graphic ad, NOT a photograph. The comparison should make the right side the obvious winner through colour, energy, and detail. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Left: "Generic Kit" (grey background, plain box icon, bullets: "✗ Cheap threads that tangle", "✗ No instructions", "✗ Missing tools", "✗ No support"). Right: "Clever Poppy Kit" (vibrant coral background, Beautiful Bouquet hoop photo, bullets: "✓ Premium Egyptian cotton threads", "✓ Step-by-step video tutorials", "✓ All tools included", "✓ 500K+ community"). The left side looks bare and risky, the right side looks premium and complete.`
  },

  {
    id: "comparison-scorecard",
    imagePromptTemplate: `Create a bold graphic social media ad featuring a clean scorecard/comparison table. Use {{background_color}} as the background. Place a bold headline "{{headline}}" at the top. Below, create a simple table or grid with 4-6 rows comparing criteria. Each row has: a feature name on the left, a ✗ (red/grey) in the "Others" column, and a ✓ (green/white) in the "Clever Poppy" column. Criteria should include things from {{callout_texts}}. Place the provided product photo in the bottom-right corner at about 25-30% of the canvas. Add the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The table should be instantly scannable — the row of ticks on the Clever Poppy side should create a clear visual pattern of superiority. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Not all kits are created equal" on coral background. Scorecard comparing "Others" vs "Clever Poppy" across 5 rows: Video tutorials (✗ vs ✓), Premium threads (✗ vs ✓), Beechwood hoop (✗ vs ✓), Pattern printed on fabric (✗ vs ✓), Community access (✗ vs ✓). Bee Happy hoop photo in bottom corner. The column of green ticks makes the winner obvious at a glance.`
  },

  {
    id: "faq-mini-card-top-objections",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a mini FAQ card. Use {{background_color}} as the background. Place a bold headline "{{headline}}" at the top (e.g., "Your questions, answered"). Below, show 2-3 FAQ items, each with a bold question in white/dark text and a short one-line answer in a slightly smaller or lighter font. Use visual separators (lines or spacing) between each Q&A pair. Place the provided product photo on one side or bottom corner at about 25-30% of the canvas. Add the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts for all text. This is a designed graphic ad, NOT a photograph. The layout should feel clean, helpful, and confidence-building — like a friend answering your doubts. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "But wait... can I actually do this?" on soft green background. Three Q&As: "Is it really beginner-friendly?" → "Zero experience needed. We mean it." | "How long does it take?" → "Most finish in 2-4 evenings." | "What if I mess up?" → "Unpick and redo — thread is forgiving." Autumn Leaf hoop photo in bottom right. The tone is warm and reassuring, instantly crushing the top 3 objections.`
  },

  {
    id: "this-or-that-choice-card",
    imagePromptTemplate: `Create a bold graphic social media ad with a "This or That" choice layout. Split the canvas vertically into two equal halves with a bold "VS" or "or" divider in the centre. LEFT SIDE: Show option A with a simple label "{{option_a}}" in bold text on a muted or contrasting background. Use a simple icon or illustration representing the less desirable option. RIGHT SIDE: Show option B with a label "{{option_b}}" in bold text on a vibrant {{background_color}} background. Place the provided product photo prominently on this side. Add subtle visual cues that make the right side more appealing (brighter, more energetic, sparkle or highlight effects). Add the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The viewer should mentally pick a side — and the design nudges them toward the product. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Left: "Another night scrolling" (muted grey-blue background, phone icon with infinite scroll arrows, dull and flat). Bold "OR" divider in the centre. Right: "A night creating something beautiful" (warm coral background, Flora the Cat hoop displayed prominently, warm glow feel). The right side is visually warmer and more inviting — the choice feels obvious.`
  },

  // ============================================================
  // BENEFIT-FIRST
  // ============================================================

  {
    id: "big-text-hero",
    imagePromptTemplate: `Create a bold graphic social media ad where the headline text dominates 60-70% of the canvas. Use {{background_color}} as the background. Place "{{headline}}" in very large, bold, clean sans-serif font — it should be the first and biggest thing the viewer sees. The text should be white or high-contrast against the background. Place the provided product photo as an anchor in one corner (bottom-right or bottom-left), taking up about 25-30% of the canvas. Add "{{subheadline}}" in smaller text below the headline. Include the cleverpoppy.com URL small at the bottom. This is a designed graphic ad, NOT a photograph. The headline should feel like it's shouting from the feed — impossible to scroll past. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Massive headline "Your Hands Deserve Better Than Scrolling" in bold white text taking up most of the coral background. Subheadline: "Beginner embroidery kits that actually get finished." Bee Happy hoop photo anchored in bottom-right corner. The text dominates and stops the scroll — the product is the supporting proof.`
  },

  {
    id: "checklist-benefits",
    imagePromptTemplate: `Create a bold graphic social media ad with a two-column layout. LEFT SIDE (or RIGHT SIDE): Place the provided product photo prominently, taking up about 45-50% of the canvas, on a clean {{background_color}} background. OTHER SIDE: Show a high-contrast checklist of 4-6 benefits, each with a ✓ checkmark icon in green or white. Benefits should be drawn from {{callout_texts}}. Each item should be short (3-5 words max). Add a bold headline "{{headline}}" at the top spanning both columns. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The checklist should be instantly scannable — benefits should jump off the page. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Everything you need in one box" at the top. Left side: Beautiful Bouquet hoop photo on coral background. Right side: White/cream panel with checklist: "✓ Premium Egyptian cotton threads", "✓ Beechwood display frame", "✓ Step-by-step video tutorials", "✓ Pattern printed on fabric", "✓ All tools included". Clean, scannable, and convincing.`
  },

  {
    id: "data-point-hero",
    imagePromptTemplate: `Create a bold graphic social media ad where one huge statistic or data point dominates the canvas. Use {{background_color}} as the background. Place "{{stat}}" (e.g., "500K+" or "4.9★") in enormous bold font — it should take up 40-50% of the canvas and be the unmissable focal point. Below or beside the stat, add "{{stat_context}}" in smaller but still bold text explaining what it means (e.g., "happy stitchers worldwide"). Place the provided product photo as a secondary element in one corner at about 20-25% of the canvas. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The number should hit the viewer before anything else — it's a trust signal that does the selling. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Enormous "4.91★" in bold white text dominating the centre of a deep coral background. Below: "from 12,000+ verified reviews" in smaller white text. Beginner Stitch Sampler hoop photo in bottom-right corner. The rating is so large it's impossible to miss — instant credibility before the viewer even processes the product.`
  },

  {
    id: "problem-headline-solution-subhead",
    imagePromptTemplate: `Create a bold graphic social media ad with a clear two-line text hierarchy. Use {{background_color}} as the background. TOP LINE: Place "{{problem_headline}}" in very large, bold sans-serif font — this calls out the pain point and should feel slightly uncomfortable or provocative. SECOND LINE: Place "{{solution_subheadline}}" in slightly smaller but still prominent font directly below — this promises relief and should feel warm and inviting. Place the provided product photo below or beside the text, taking up about 30-40% of the canvas. Add 2-3 small callout badges from {{callout_texts}} near the product. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The one-two punch of problem then solution should create an instant "yes, that's me" reaction. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Top line: "Tired of staring at screens all evening?" in massive bold white text (feels confrontational). Second line: "Pick up a needle instead. You'll thank yourself." in warm, inviting slightly smaller text. Bee Kind hoop photo below with callout badges: "Zero experience needed" and "Finishable in days". The problem hooks them, the solution pulls them in.`
  },

  {
    id: "punchy-one-liner-over-lifestyle",
    imagePromptTemplate: `Create a bold graphic social media ad featuring one punchy line of copy overlaid on a mood/lifestyle background. Use a lifestyle-feel background related to the product — a cosy evening scene, hands crafting, a styled desk, or a calm creative space — rendered in a stylised, graphic way (not photorealistic). Overlay "{{one_liner}}" in very large, bold, clean sans-serif font with a semi-transparent colour band or shadow behind it for readability. The text should take up 40-50% of the canvas. Place the provided product photo in a corner or bottom section at about 25-30% of the canvas. Tint the background slightly with {{background_color}}. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The vibe should feel aspirational and scroll-stopping — one line that makes them pause and feel something. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Stylised cosy evening scene with warm lighting. Massive overlay text: "It's basically meditation you can frame." with a semi-transparent coral band behind it. Sunset Meadow hoop photo in bottom-right corner. The lifestyle mood draws them in, the one-liner seals the deal — it feels like a friend's recommendation.`
  },

  {
    id: "question-hook-bold-question",
    imagePromptTemplate: `Create a bold graphic social media ad where a provocative question dominates the canvas. Use {{background_color}} as the background. Place "{{question}}" in very large, bold sans-serif font taking up 50-60% of the canvas. The question mark should be especially prominent. Below the question, add a short answer line "{{answer}}" in smaller but confident text. Place the provided product photo as supporting evidence in the lower portion at about 25-30% of the canvas. Add 1-2 small callout badges from {{callout_texts}} near the product. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The question should force the viewer to mentally answer it while scrolling — creating engagement before they even click. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Huge question: "What if your evenings left you with something to show for them?" in bold white text on deep teal background, question mark extra large. Answer below: "Beginner embroidery kits. Everything included. Finished in days." Autumn Leaf hoop photo in lower section with badge: "Free shipping over $70". The question is impossible to scroll past without mentally engaging.`
  },

  {
    id: "text-overlay-deal",
    imagePromptTemplate: `Create a bold graphic social media ad where the offer/deal text is front and centre. Use {{background_color}} as the background. Place the offer "{{offer_text}}" in enormous, bold, attention-grabbing font — it should dominate 50-60% of the canvas. Use a starburst, banner, or highlight effect around the offer to make it pop. Below the offer, add "{{supporting_line}}" explaining how to claim it or what it applies to. Place the provided product photo as a secondary element at about 20-25% of the canvas. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The offer should be the only thing the viewer sees first — everything else supports it. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Massive "25% OFF" in bold white text with a yellow starburst behind it on coral background. Supporting line: "Buy 3 kits or more. Code: POPPY25". Bee Happy hoop photo in bottom corner. The deal is impossible to miss — it does all the work in the first half-second.`
  },

  {
    id: "value-prop-stack-3-5-bullets-icons",
    imagePromptTemplate: `Create a bold graphic social media ad with an icon-driven value proposition layout. Use {{background_color}} as the background. Place a bold headline "{{headline}}" at the top. Below, show 3-5 value propositions, each as a row with: a simple icon (circle with symbol) on the left, and 2-4 words of benefit text on the right. Icons should be clean, simple, and white or high-contrast. Space the rows evenly for easy scanning. Place the provided product photo on one side or bottom at about 30-35% of the canvas. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The icon tiles should make the benefits feel tangible and real — each one is a mini promise. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Why 500K+ people chose Clever Poppy" on deep green background. Five icon rows: 🎯 "Zero experience needed", 📦 "Everything in one box", 🎥 "Video tutorials included", ⏱ "Finish in days, not months", 🌍 "Free shipping over $70". Beautiful Bouquet hoop photo on the right side. Each icon tile is a quick trust signal — scannable in under 3 seconds.`
  },

  // ============================================================
  // OFFER-FIRST
  // ============================================================

  {
    id: "starburst-offer",
    imagePromptTemplate: `Create a bold graphic social media ad with a prominent starburst or badge shape as the central element. Use {{background_color}} as the background. Place a large starburst/badge shape in the centre-top area containing "{{offer_text}}" in bold, high-contrast text inside it. The starburst should take up 30-40% of the canvas and be the clear focal point. Place the provided product photo below or beside the starburst at about 35-40% of the canvas. Add "{{supporting_line}}" in clean text near the product. Include 1-2 callout badges from {{callout_texts}} in small circles or pills. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The starburst should pop like a price tag in a shop window — it's the scroll-stopper. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Large yellow starburst on coral background containing "25% OFF 3+ Kits" in bold black text. Below: Bee Happy hoop photo with supporting line "Use code POPPY25 at checkout". Small callout badges: "Free shipping over $70" and "500K+ community". The starburst catches the eye like a shop window sale sign.`
  },

  {
    id: "promo-code-card",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a promo code card. Use {{background_color}} as the background. Place a large code block in the centre — a rounded rectangle or dashed-border box containing "{{promo_code}}" in big, bold, monospace-style font. Above the code, add "{{headline}}" explaining the offer. Below the code, add a one-line instruction "{{instruction}}" (e.g., "Enter at checkout"). Place the provided product photo as a smaller element at about 20-25% of the canvas in one corner. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The code should feel copy-paste ready — big, clear, and impossible to misread. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Your first kit is 20% off" on teal background. Large dashed-border code box: "POPPY20" in bold white monospace text. Below: "Enter at checkout → cleverpoppy.com". Bee Kind hoop photo in bottom-left corner. The code is so big and clear you could read it from across the room.`
  },

  {
    id: "was-now-price-anchor",
    imagePromptTemplate: `Create a bold graphic social media ad with a clear price comparison. Use {{background_color}} as the background. Place the old price "{{was_price}}" in large text with a bold red strikethrough line through it. Next to or below it, place the new price "{{now_price}}" in even larger, bolder text in white or green — it should feel like a deal. Add "{{headline}}" above the prices. Place the provided product photo prominently at about 35-40% of the canvas. Keep the rest minimal — the price contrast does the selling. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The strikethrough-to-bold price shift should trigger instant "deal" recognition. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "This weekend only" on deep coral background. Struck-through price "$53" in grey with red line. Bold new price "$40" in large white text beside it. Beautiful Bouquet hoop photo taking up the left side. Minimal — the price drop speaks for itself.`
  },

  {
    id: "buy-more-save-more-tiers",
    imagePromptTemplate: `Create a bold graphic social media ad showing 2-4 savings tiers as large visual blocks. Use {{background_color}} as the background. Place "{{headline}}" at the top in bold text. Below, show 2-4 tier blocks arranged horizontally or as stacked rows. Each tier has a quantity (e.g., "1 Kit", "2 Kits", "3+ Kits") and a corresponding offer or price. Make the highest-value tier visually largest or most prominent (bigger, brighter, or highlighted with a "Best Value" badge). Place the provided product photo as a small anchor element. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The tiers should make the viewer do quick mental maths and gravitate to the best deal. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "The more you stitch, the more you save" on coral background. Three tier blocks: "1 Kit → $40" (small, plain), "2 Kits → $36 each" (medium, highlighted), "3+ Kits → $30 each ★ BEST VALUE" (largest, yellow highlight, star badge). Small Bee Happy hoop photo in corner. The tiered layout nudges the viewer toward buying three.`
  },

  {
    id: "free-shipping-fast-dispatch-badge",
    imagePromptTemplate: `Create a bold graphic social media ad featuring a prominent shipping/dispatch badge. Use {{background_color}} as the background. Place a large badge or shield shape containing "{{shipping_promise}}" (e.g., "FREE SHIPPING") in bold text — the badge should take up 25-35% of the canvas. Place the provided product photo prominently beside or below the badge at about 35-40% of the canvas. Add "{{supporting_line}}" explaining the threshold or details. Include 1-2 small callout elements from {{callout_texts}}. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The badge should feel official and trustworthy — like a guarantee stamp that removes the last purchase hesitation. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Large green shield badge: "FREE SHIPPING" in bold white text on coral background. Supporting line: "On all orders over $70". Beginner Stitch Sampler hoop photo on the right side. Small callout: "Ships in 1-2 business days". The shipping badge removes the last barrier to purchase — clean and trustworthy.`
  },

  {
    id: "risk-reversal-badge",
    imagePromptTemplate: `Create a bold graphic social media ad featuring a prominent guarantee seal/badge. Use {{background_color}} as the background. Place a large circular or shield-shaped guarantee seal in the centre containing "{{guarantee_text}}" (e.g., "Love it or return it") in bold text. Add a decorative border or ribbon around the seal for an official feel. Place the provided product photo beside or below the seal at about 30-35% of the canvas. Add "{{supporting_line}}" — a short explanatory line about the guarantee. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The seal should feel like an official promise — it eliminates purchase risk and builds instant trust. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Large gold-bordered circular seal: "100% Satisfaction Guarantee" in bold text on soft green background. Supporting line: "Not loving it? Return within 30 days. No questions asked." Bee Happy hoop photo on the left. The guarantee seal looks official and removes all purchase anxiety.`
  },

  {
    id: "bonus-gift-with-purchase",
    imagePromptTemplate: `Create a bold graphic social media ad with a split layout showing a main product and a bonus item. Use {{background_color}} as the background. Place a bold headline "{{headline}}" at the top. MAIN SECTION: Place the provided product photo prominently at about 40-45% of the canvas with a label like "Your Kit". BONUS SECTION: Show a "+" symbol and a bonus item illustration or label "{{bonus_item}}" with a "FREE" badge or ribbon overlaid. Use a slight visual separation (dashed line, colour shift, or "+" divider) between main and bonus. Add "{{supporting_line}}" explaining the offer conditions. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The bonus should feel like a genuine extra — the "+" and "FREE" label should trigger excitement. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Your kit + a free gift" on coral background. Left: Beginner Stitch Sampler hoop photo with "Your Kit" label. Large "+" in the centre. Right: "FREE Scissor Set" with a "FREE" ribbon badge. Supporting line: "With any kit purchase this week". The bonus feels like a genuine surprise extra.`
  },

  {
    id: "limited-time-countdown-motif",
    imagePromptTemplate: `Create a bold graphic social media ad with urgency and countdown elements. Use {{background_color}} as the background. Place "{{headline}}" in large bold text at the top — it should communicate urgency. Add a timer/countdown graphic element (clock icon, countdown boxes, or "ENDS {{deadline}}" in a banner). Place the provided product photo prominently at about 35-40% of the canvas. Add "{{offer_text}}" explaining what the limited offer is. Use red or orange accent elements to reinforce urgency. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The countdown should create genuine FOMO — the viewer should feel the offer slipping away. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Last chance — ends Sunday" in large white text on deep red background. Timer graphic showing countdown boxes. Beautiful Bouquet hoop photo on the right. Offer text: "25% off all kits — code POPPY25". Red and orange accents create urgency. The countdown makes it feel real and time-sensitive.`
  },

  {
    id: "back-in-stock-restock-alert",
    imagePromptTemplate: `Create a bold graphic social media ad announcing a product restock. Use {{background_color}} as the background. Place "{{headline}}" (e.g., "BACK IN STOCK") in enormous, bold, all-caps text — it should dominate 40-50% of the canvas and feel like an exciting announcement. Add a subtle "sold out → back" visual cue (e.g., struck-through "Sold Out" text above). Place the provided product photo prominently at about 35-40% of the canvas. Add "{{supporting_line}}" below (e.g., "Limited quantities available"). Keep the layout minimal — the announcement does the work. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The restock announcement should feel like exciting news — scarcity and demand implied. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Struck-through "SOLD OUT" in small grey text at the top. Massive "BACK IN STOCK" in bold white text on coral background. Bee Happy hoop photo prominently displayed. Supporting line: "Limited run — don't miss it again". The announcement feels like genuine news — scarcity implied, urgency created.`
  },

  {
    id: "seasonal-occasion",
    imagePromptTemplate: `Create a bold graphic social media ad with seasonal/occasion theming. Use {{background_color}} as the base, enhanced with seasonal colour accents and simple graphic elements appropriate to "{{occasion}}" (e.g., hearts for Valentine's, flowers for Mother's Day, snowflakes for Christmas, leaves for autumn). Place "{{headline}}" in large bold text incorporating the occasion. Place the provided product photo prominently at about 35-40% of the canvas, styled to feel like a gift or seasonal item. Add "{{supporting_line}}" with an occasion-specific CTA (e.g., "The perfect Mother's Day gift"). Include seasonal decorative elements (but keep them simple — graphic, not photographic). Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The seasonal framing should make the product feel timely and gift-worthy. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Mother's Day theme: Soft pink and coral background with simple flower and heart graphics. Headline: "A gift she'll actually love making". Bee Kind hoop photo styled as a gift (subtle ribbon graphic). Supporting line: "Mother's Day kits — free gift wrapping included". The seasonal elements make it feel timely without being cheesy.`
  },

  {
    id: "event-timed-pain-point",
    imagePromptTemplate: `Create a bold graphic social media ad that ties a pain point to a specific calendar moment. Use {{background_color}} as the background. Place "{{headline}}" in large bold text — it should connect a time-specific event to the viewer's problem (e.g., "Sunday night blues? We've got you."). Add a simple calendar, clock, or date icon graphic as a visual anchor. Place the provided product photo at about 30-35% of the canvas as the solution. Add "{{supporting_line}}" that positions the product as the answer to the event-timed problem. Include 1-2 small callout badges from {{callout_texts}}. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The calendar/timing hook should make the viewer think "that's me right now." Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Sunday night dread? Make it Sunday night stitching." on deep teal background with a simple calendar icon showing "SUN". Beginner Stitch Sampler hoop photo below. Supporting line: "Transform your evenings with a kit that's actually finishable." Callout badges: "2-4 hour projects" and "Video tutorials included". The timing hook makes it feel personal and immediate.`
  },

  {
    id: "launch-new-drop",
    imagePromptTemplate: `Create a bold graphic social media ad announcing a new product launch. Use {{background_color}} as the background. Place "{{headline}}" (e.g., "NEW" or "Just Dropped") in large, bold, energetic text with a "new" badge, ribbon, or highlight effect. Place the provided product photo as the hero — it should take up 40-50% of the canvas and be the star of the ad. Add "{{product_name}}" and "{{supporting_line}}" below the product. Keep supporting copy minimal — the new product is the focus. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The launch should feel exciting and fresh — like opening a present. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Bold "NEW" badge in yellow at top-left corner. Headline: "Just dropped: Sunset Meadow" on coral background. Sunset Meadow hoop photo as hero, large and prominent. Supporting line: "Our most requested design is finally here." Minimal and focused — the new product speaks for itself.`
  },

  // ============================================================
  // PRODUCT-FIRST
  // ============================================================

  {
    id: "feature-callout",
    imagePromptTemplate: `Create a bold graphic social media ad with the product centred and feature callout arrows. Use {{background_color}} as a bold, clean background. Place the provided product photo as the hero in the centre of the canvas, taking up 40-50% of the space. Add 3-5 thin arrows or lines pointing from different parts of the product to short feature labels arranged around it (e.g., "Premium threads", "Beechwood hoop", "Printed pattern"). Labels should be in clean white or high-contrast text with small backgrounds/pills for readability. Add a bold headline "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The arrows should make it feel like an interactive product breakdown — each label adds a reason to buy. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Everything you need. Nothing you don't." on coral background. Bee Happy hoop centred as hero. Five arrows pointing to features: "Premium Egyptian cotton threads", "Beechwood display hoop", "Pattern printed on fabric", "QR code to video tutorials", "Embroidery needles included". Each label is a mini selling point — the product is the proof.`
  },

  {
    id: "feature-spotlight-numbered-tiles",
    imagePromptTemplate: `Create a bold graphic social media ad with numbered feature tiles alongside the product. Use {{background_color}} as the background. Place the provided product photo on one side (left or right), taking up about 40% of the canvas. On the other side, arrange 3-5 feature tiles vertically, each with a bold number (1, 2, 3...), a simple icon, and a short feature description (3-5 words). Tiles should be on slightly contrasting coloured rectangles or rounded cards. Add a bold headline "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The numbered tiles should make the features feel systematic and complete — like a product spec sheet made visual. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "5 reasons to start tonight" on deep green background. Left: Beginner Stitch Sampler hoop photo. Right: Five numbered tiles: "1. Zero experience needed", "2. Video tutorials via QR", "3. Premium threads included", "4. Beechwood frame included", "5. Finish in 2-4 evenings". Clean, scannable, and persuasive.`
  },

  {
    id: "what-s-in-the-box-flat-lay",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a flat-lay showing kit contents. Use {{background_color}} or a clean light/white background. Arrange the provided product photo as the centrepiece. Around it, illustrate or graphically represent the kit components in a top-down flat-lay arrangement: thread spools, hoop, needles, fabric, scissors, instruction card, pattern. Each component should have a small clean label. Add a bold headline "{{headline}}" (e.g., "What's in the box") at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The flat lay should make the kit feel complete and premium — every item is a reason to buy. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for the finished hoop; other items should be simple graphic illustrations.`,
    exampleDescription: `Headline: "Everything in one box" on cream background. Centre: Beautiful Bouquet hoop photo. Arranged around it: illustrated thread spools (labelled "Premium threads"), hoop (labelled "Beechwood frame"), needle set (labelled "Embroidery needles"), fabric (labelled "Printed pattern"), scissors (labelled "Sharp scissors"), QR code card (labelled "Video tutorials"). The flat lay makes the kit feel generous and complete.`
  },

  {
    id: "exploded-kit-labels",
    imagePromptTemplate: `Create a bold graphic social media ad with an "exploded view" of kit components. Use {{background_color}} as the background. Place the provided product photo (the finished hoop) in the centre. Arrange graphic representations of individual components spread out around it in an "exploded diagram" style — as if the kit has been carefully unpacked and each piece floated apart. Draw thin lines from each component to a clean label (e.g., "6-strand cotton threads", "Beechwood hoop", "Printed fabric"). Add a bold headline "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The exploded view should make the kit feel premium and thorough — nothing is hidden. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for the finished hoop; components should be simple graphic illustrations.`,
    exampleDescription: `Headline: "Unbox your new hobby" on coral background. Bee Happy hoop photo in centre. Exploded around it: thread spool cluster (labelled "Egyptian cotton threads"), wooden hoop (labelled "Beechwood display frame"), needle pack (labelled "Quality needles"), printed fabric (labelled "Pre-printed pattern"), scissors (labelled "Embroidery scissors"), card (labelled "QR to video tutorials"). Premium exploded-view feel.`
  },

  {
    id: "macro-detail-proof",
    imagePromptTemplate: `Create a bold graphic social media ad featuring a large close-up detail alongside the full product. Use {{background_color}} as the background. PRIMARY ELEMENT: A large close-up crop showing texture/material detail of embroidery work — the stitching, thread quality, fabric weave — taking up about 50-60% of the canvas. This should feel tactile and premium. SECONDARY ELEMENT: A small product hero (the full finished hoop from the provided product photo) in one corner at about 20-25% of the canvas. Add "{{headline}}" in bold text — it should speak to quality or craftsmanship. Add one benefit line from {{callout_texts}}. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The macro detail should make the viewer feel the quality — like they can almost touch the stitching. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Large close-up of detailed embroidery stitching filling 60% of canvas — you can see individual thread strands and fabric texture. Small Beginner Stitch Sampler hoop in bottom-right corner. Headline: "Feel the quality in every stitch" on coral background. Benefit line: "100% Egyptian cotton threads". The macro detail sells premium quality without words.`
  },

  {
    id: "3-step-how-it-works",
    imagePromptTemplate: `Create a bold graphic social media ad showing a simple 3-step process. Use {{background_color}} as the background. Place a bold headline "{{headline}}" (e.g., "3 steps to your first hoop") at the top. Below, show three clearly numbered steps arranged horizontally (or vertically for portrait): Step 1 with a simple icon and label "{{step_1}}", Step 2 with icon and label "{{step_2}}", Step 3 with icon and label "{{step_3}}". Connect the steps with arrows or dotted lines. Place the provided product photo as the "result" element near step 3 or below all steps. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The 3 steps should make it feel absurdly simple — any barrier to starting disappears. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Your first hoop in 3 steps" on teal background. Step 1: Box icon + "Open your kit" → Step 2: Phone icon + "Scan QR for tutorials" → Step 3: Hoop icon + "Stitch & display". Arrows connecting each step. Bee Happy hoop photo as the finished result below step 3. It looks so simple that not starting feels harder than starting.`
  },

  {
    id: "step-by-step-mini-storyboard",
    imagePromptTemplate: `Create a bold graphic social media ad with a 3-4 frame storyboard layout. Use {{background_color}} as the background. Divide the canvas into 3-4 equal panels (like a comic strip — horizontal or 2x2 grid). Each panel shows a stage of the crafting journey: Frame 1 "{{frame_1}}" (e.g., opening the kit), Frame 2 "{{frame_2}}" (e.g., starting to stitch), Frame 3 "{{frame_3}}" (e.g., progress shot), Frame 4 "{{frame_4}}" (e.g., finished hoop displayed). Each frame has a small label. Use the provided product photo in the final frame as the finished result. The first 3 frames can use simple graphic illustrations. Add a bold headline "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The storyboard should tell a satisfying story in 4 frames — open to finished. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for the final frame.`,
    exampleDescription: `Headline: "From box to wall in one weekend" on coral background. 2x2 grid: Frame 1 "Open" (illustrated kit box), Frame 2 "Learn" (phone showing QR tutorial), Frame 3 "Stitch" (illustrated hands with needle and hoop), Frame 4 "Display!" (Autumn Leaf hoop photo on a styled wall). The story makes the journey feel short and satisfying.`
  },

  {
    id: "beginner-quickstart-card",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a quickstart card for beginners. Use {{background_color}} as the background. Place a bold, reassuring headline "{{headline}}" (e.g., "Start in 10 minutes") at the top. Below, add one big promise line and 2-3 bullet points that crush beginner anxiety — things like "No experience needed", "Video tutorials for every stitch", "Everything included". Use checkmarks or simple icons beside each bullet. Place the provided product photo at about 30-35% of the canvas as the thing they'll be making. Add a confident CTA text "{{cta}}" near the bottom. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The card should make a complete beginner think "I could actually do this tonight." Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Never embroidered? Start tonight." on warm green background. Promise: "Your first hoop in 2-4 hours." Bullets: "✓ Zero experience needed", "✓ Step-by-step video for every stitch", "✓ All tools and threads included". Bee Happy hoop photo on the right. CTA: "Shop Beginner Kits". It feels doable, safe, and exciting for someone who's never tried.`
  },

  {
    id: "specs-sheet",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a clean specifications sheet. Use {{background_color}} or a clean white/light background. Place a bold headline "{{headline}}" (e.g., "The specs") at the top. Below, create a clean list of specifications in a structured layout: rows of "Spec label: Value" pairs covering things like dimensions, materials, included tools, time to complete, skill level. Use alternating subtle row backgrounds for readability. Place the provided product photo at about 25-30% of the canvas in one corner. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The specs sheet should make the product feel transparent and premium — nothing to hide, everything to brag about. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "The details" on clean white background with coral accents. Specs list: "Skill level: Complete beginner", "Time: 2-4 evenings", "Hoop size: 6 inch beechwood", "Threads: Egyptian cotton, pre-sorted", "Pattern: Printed on fabric", "Tutorials: QR-linked video for each stitch", "Display: Hang-ready in hoop". Bee Kind hoop photo in top-right corner. Clean, premium, transparent.`
  },

  {
    id: "design-variant-grid-grid-swap",
    imagePromptTemplate: `Create a bold graphic social media ad showing multiple product variants in a neat grid layout. Use {{background_color}} as the background. Place a bold headline "{{headline}}" (e.g., "Pick your first design") at the top. Below, arrange 4-6 product variants in a clean grid (2x2, 2x3, or 3x2). Each grid cell has a different product/design on a slightly contrasting coloured background square, with the design name in small text below. Use the provided product photo as one of the featured designs (make it slightly larger or highlighted with a border). Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The grid should make the viewer browse and pick a favourite — it's a "which one speaks to you?" layout. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for one cell; other cells should show simple graphic representations of different hoop designs.`,
    exampleDescription: `Headline: "20+ designs. Which one's yours?" on coral background. 2x3 grid showing 6 different hoop designs on alternating cream and coral cells: Bee Happy (provided photo, highlighted with gold border), Flora the Cat, Sunset Meadow, Beginner Stitch Sampler, Autumn Leaf, Beautiful Bouquet. Each with name below. The variety makes them want to browse the full collection.`
  },

  {
    id: "bundle-stack",
    imagePromptTemplate: `Create a bold graphic social media ad showing a bundle of products stacked together. Use {{background_color}} as the background. Place a bold headline "{{headline}}" (e.g., "The Ultimate Bundle") at the top. Show the provided product photo as the hero with 2-3 additional product illustrations arranged behind or around it in a stacked/overlapping composition — creating a feeling of abundance. Add a "Bundle includes:" line with 2-3 items listed. If there's a bundle offer, add it prominently (e.g., "Save 25%"). Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The bundle should feel like incredible value — more than the sum of its parts. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for the hero; other items should be simple graphic representations.`,
    exampleDescription: `Headline: "The Bee Bundle — 3 kits, one price" on coral background. Bee Happy hoop photo as hero in front, with Bee Kind and Bee on the Go illustrated hoops stacked behind it. "Bundle includes: Bee Happy + Bee Kind + Bee on the Go" below. Yellow starburst: "Save 25%". The stacked composition makes it feel like a generous deal.`
  },

  {
    id: "bento-box-layout",
    imagePromptTemplate: `Create a bold graphic social media ad with a modern bento-box (multi-panel) layout. Divide the canvas into 4-6 clean panels of varying sizes (like a bento box or dashboard layout). Use {{background_color}} as the base with slightly contrasting panel backgrounds. LARGEST PANEL: Place the provided product photo (hero shot). OTHER PANELS: Allocate one panel each to: a key feature (with icon + short text), a proof element (star rating or short quote), an offer or CTA, and optionally a close-up detail. Each panel is clean and focused on one thing. Add the cleverpoppy.com URL in one of the smaller panels. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The bento layout should feel modern and info-dense without being cluttered — every panel earns its space. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `6-panel bento on coral/cream palette. Large panel: Beautiful Bouquet hoop photo. Feature panel: "✓ Everything included" with box icon. Proof panel: "★★★★★ 4.91 from 12K+ reviews". Offer panel: "25% off 3+ kits". Detail panel: Close-up of embroidery stitching. URL panel: "cleverpoppy.com". Modern, dense, and every panel sells.`
  },

  {
    id: "illustrated-diagram",
    imagePromptTemplate: `Create a bold graphic social media ad using simple illustration or iconography to explain the product experience. Use {{background_color}} as the background. Place a bold headline "{{headline}}" at the top. The main visual should be a simple, clean illustration or diagram showing what the embroidery experience looks/feels like — e.g., a simple drawing of hands stitching, a hoop with emanating calm/joy lines, or an illustrated journey from kit to finished art. Keep the illustration style clean, modern, and flat (not photographic). Place the provided product photo as a supporting reference at about 20-25% of the canvas. Add "{{supporting_line}}" below. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The illustration should communicate the feeling of the product — calm, creative, satisfying. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "What your evenings could feel like" on soft teal background. Simple flat illustration showing hands holding a hoop with stitching in progress, surrounded by radiating calm lines and small hearts/stars. Bee Happy hoop photo in bottom corner as the real product. Supporting line: "Beginner embroidery kits — everything included." The illustration sells the feeling before the product.`
  },

  {
    id: "lifestyle-micro-labels",
    imagePromptTemplate: `Create a bold graphic social media ad featuring a lifestyle scene with small callout labels. Use a stylised lifestyle background — a cosy room scene, hands crafting, or a styled workspace — rendered in graphic style with a {{background_color}} tint. The provided product photo should be placed prominently within the scene (displayed on a wall, held in hands, or on a table). Add 2-3 tiny callout labels with thin lines pointing to key elements in the scene (e.g., "Your finished hoop" pointing to the product, "Only took 3 evenings" pointing to a calendar, "Frame-ready" pointing to the wall). Keep labels small and clean with pill-shaped backgrounds. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The micro labels should add info without disrupting the lifestyle mood. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Stylised cosy living room scene with warm tones and coral tint. Autumn Leaf hoop photo displayed on the wall. Micro labels: "Your finished hoop →" pointing to hoop, "← 3 evenings from start to wall" pointing to calendar on desk, "Everything included in one kit ↓" pointing to a small kit illustration. The scene sells the outcome — the product already part of their life.`
  },

  // ============================================================
  // PROOF-FIRST
  // ============================================================

  {
    id: "speech-bubble-quote",
    imagePromptTemplate: `Create a bold graphic social media ad with an oversized speech bubble as the main visual element. Use {{background_color}} as the background. Place a large speech bubble shape taking up 50-60% of the canvas containing "{{quote}}" in bold, slightly informal font — it should feel like a real person talking. Below the speech bubble, add the attribution "— {{customer_name}}" and a star rating "★★★★★". Place the provided product photo as a supporting element at about 25-30% of the canvas, positioned near the speech bubble tail. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The speech bubble should feel authentic and conversational — like overhearing a friend's recommendation. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Large white speech bubble on coral background: "Better than Netflix. I said what I said." in bold casual text. Attribution: "— Jess K. ★★★★★" below the bubble. Bee Happy hoop photo beside the bubble tail. The quote is so relatable it feels like a friend texted it to you.`
  },

  {
    id: "social-proof-showcase",
    imagePromptTemplate: `Create a bold graphic social media ad combining a product photo with a testimonial overlay and trust badge. Use {{background_color}} as the background. Place the provided product photo as the hero, taking up about 45-50% of the canvas. Overlay a semi-transparent testimonial card on or beside the product containing "{{quote}}" in clean text with "— {{customer_name}}" attribution. Add a trust badge element — star rating (★★★★★), review count, or verified purchase badge — in a prominent position. Add "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The combination of real product + real quote + rating should create triple-layered trust. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "See why 12,000+ people rated us 4.91★" on coral background. Beautiful Bouquet hoop photo as hero. Semi-transparent white testimonial card overlaid: "My therapist told me to find a screen-free hobby. This is it. — Lauren T." Gold star rating badge: "★★★★★ 4.91". Product + quote + stars = triple trust hit.`
  },

  {
    id: "review-screenshot-platform-native-review-card",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a platform-native review card or screenshot. Use {{background_color}} as the background. Create a large, clean review card in the centre of the canvas that looks like a stylised review from a shopping platform — with star rating row (★★★★★), reviewer name "{{customer_name}}", review date, and review text "{{quote}}". The card should have a white or light background with subtle shadow for depth. Place the provided product photo either inside the review card or beside it at about 25-30% of the canvas. Add a small headline "{{headline}}" at the top or bottom. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The review card should feel authentic — like a screenshot someone shared because the review was that good. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Clean review card on coral background: ★★★★★, "Sarah M." with date, review text: "I've never embroidered in my life and I just finished my first hoop. The video tutorials made it SO easy. Already ordering my second kit!" Bee Happy hoop photo beside the card. Small headline: "Real review, real beginner." It feels like an organic screenshot share.`
  },

  {
    id: "star-rating-hero",
    imagePromptTemplate: `Create a bold graphic social media ad where the star rating is the dominant visual element. Use {{background_color}} as the background. Place "★★★★★" in enormous size — the stars should take up 30-40% of the canvas width and be the first thing seen. Below the stars, add "{{rating}}" (e.g., "4.91 out of 5") in large bold text. Below that, add "{{review_count}}" (e.g., "from 12,000+ reviews") in slightly smaller text. Place the provided product photo as a secondary element at about 20-25% of the canvas in the lower portion. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The massive star rating should be an instant trust injection — the product barely needs to sell itself. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Enormous gold ★★★★★ stars across the top on deep teal background. "4.91 out of 5" in huge bold white text. "From 12,000+ verified reviews" in smaller text. Beginner Stitch Sampler hoop photo in bottom section. The rating is so prominent it does all the heavy lifting — instant credibility.`
  },

  {
    id: "social-proof-wall",
    imagePromptTemplate: `Create a bold graphic social media ad with many short customer quotes scattered across the background. Use {{background_color}} as the background. Scatter 8-12 short customer quotes across the canvas in various sizes, angles, and white/cream text — creating a "wall of love" effect. Quotes should be 3-8 words each (e.g., "Better than Netflix", "My new favourite hobby", "So relaxing!", "Already on kit #3"). Add small star ratings (★★★★★) next to some quotes. Place the provided product photo in the centre at about 30-35% of the canvas, slightly overlapping some quotes. Add "{{headline}}" at the top in bold text. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The scattered quotes should create overwhelming social proof through sheer volume — "all these people love it." Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Headline: "Don't just take our word for it" on coral background. Scattered quotes in various sizes: "Better than Netflix ★★★★★", "My new favourite hobby", "So relaxing!", "Already on kit #3", "My therapist approves", "Best gift I've received", "Finished it in a weekend!", "Obsessed ★★★★★". Bee Happy hoop photo centred among the quotes. Volume of praise creates irresistible social proof.`
  },

  {
    id: "ugc-photo-collage",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a collage of customer photos. Use {{background_color}} as the background or border. Arrange 4-6 photo-style frames in a grid or scattered collage layout. Each frame should show a simple graphic representation of a customer moment: hands holding a finished hoop, a hoop on a wall, someone stitching, an unboxing moment. Use the provided product photo in the largest/most prominent frame. Other frames should be simple illustrations that feel like customer snapshots. Add small elements like heart icons, star ratings, or short captions ("My first hoop!", "Weekend project ✓"). Add "{{headline}}" at the top. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The collage should feel like a community gallery — real people, real results. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided for the main frame.`,
    exampleDescription: `Headline: "Made by beginners like you" on coral background. 6-frame collage: Large centre frame with Beginner Stitch Sampler hoop photo, surrounded by illustrated frames showing: hands stitching (caption "My first stitch!"), hoop on wall ("Frame-worthy ★★★★★"), unboxing moment ("Kit day!"), close-up of stitching ("So satisfying"), group stitching ("Craft night!"). Heart icons scattered. Feels like a real community gallery.`
  },

  {
    id: "profile-endorsement-card",
    imagePromptTemplate: `Create a bold graphic social media ad styled as a customer profile endorsement card. Use {{background_color}} as the background. Create a clean card layout with: a simple avatar circle or silhouette at the top, the customer name "{{customer_name}}" in bold, a short profile line "{{customer_profile}}" (e.g., "Marketing manager, zero craft experience"), then a testimonial quote "{{quote}}" in larger text. Add star rating ★★★★★ below the quote. Place the provided product photo beside or below the card at about 25-30% of the canvas. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The profile card should make the reviewer feel like a real, relatable person — "someone like me tried it and loved it." Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Profile card on teal background: Avatar circle with silhouette. "Meg R." in bold. Profile: "Busy mum, never crafted before." Quote: "I actually finished something creative for once. The video tutorials are genius." ★★★★★ below. Bee Kind hoop photo beside the card. The profile makes Meg feel like a real person — relatable and trustworthy.`
  },

  {
    id: "unboxing-proof-card",
    imagePromptTemplate: `Create a bold graphic social media ad capturing the unboxing moment. Use {{background_color}} as the background. Show a stylised top-down view of a kit being unboxed — an open box graphic with the provided product photo visible inside or just lifted out, surrounded by tissue paper or packaging elements. Add small labels pointing to visible contents. Include "{{headline}}" (e.g., "This just arrived") at the top in a casual, excited tone. Add "{{first_impression}}" — a short line capturing the unboxing excitement (e.g., "That new kit feeling"). Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The unboxing should trigger that "new thing" dopamine hit — the viewer should want to open one themselves. Do NOT generate any fictional packaging, boxes, or branded materials beyond a simple illustrated box outline — use the exact product photo provided.`,
    exampleDescription: `Headline: "Just arrived ✨" on coral background. Illustrated open box with tissue paper, Autumn Leaf hoop photo visible inside/lifted out. Small labels: "Premium threads", "Beechwood hoop", "Everything you need". First impression line: "That moment when you open a kit and just KNOW you're going to love it." Captures the excitement of receiving something special.`
  },

  {
    id: "pr-as-seen-in-bar",
    imagePromptTemplate: `Create a bold graphic social media ad featuring press/media credibility. Use {{background_color}} as the background. Place "{{headline}}" (e.g., "As featured in") at the top in clean text. Below, show a row of 3-5 publication/media logos or names in a clean horizontal bar (e.g., newspaper names, magazine names, blog names). Below the logo bar, add a short pull quote "{{pull_quote}}" from one of the publications, in italics with attribution. Place the provided product photo at about 30-35% of the canvas below the press section. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The media logos should create instant authority — "if these outlets featured them, they must be good." Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided. Publication names should be rendered as clean text, not fake logos.`,
    exampleDescription: `Headline: "As seen in" on cream background with coral accents. Media bar with text names: "USA Today • BuzzFeed • Real Simple • Country Living • Martha Stewart". Pull quote: "'The perfect gift for anyone who needs a screen break' — USA Today" in italics. Beautiful Bouquet hoop photo below. The press bar creates instant credibility.`
  },

  {
    id: "community-milestone-people-like-you-proof",
    imagePromptTemplate: `Create a bold graphic social media ad highlighting a community achievement. Use {{background_color}} as the background. Place "{{milestone}}" (e.g., "500K+ community") in very large, bold text — it should dominate 40-50% of the canvas. Add "{{supporting_line}}" below explaining what the milestone means (e.g., "Join half a million people who chose creativity over scrolling"). Optionally add simple illustrated avatars/silhouettes or a crowd graphic to visualise the community. Place the provided product photo at about 25-30% of the canvas. Include the cleverpoppy.com URL at the bottom. Use clean bold sans-serif fonts. This is a designed graphic ad, NOT a photograph. The milestone number should trigger "fear of missing out" — half a million people can't be wrong. Do NOT generate any fictional packaging, boxes, or branded materials — only use the exact product photo provided.`,
    exampleDescription: `Massive "500,000+" in bold white text on coral background. Supporting line: "...people have discovered their new favourite hobby." Simple row of diverse silhouette avatars below the text. Bee Happy hoop photo in bottom section. The huge number creates instant FOMO — "if this many people love it, I should try it too."`
  },

];

// Run all updates
const stmt = db.prepare(`
  UPDATE AdType
  SET imagePromptTemplate = ?, exampleDescription = ?, updatedAt = datetime('now')
  WHERE id = ?
`);

let updated = 0;
let skipped = 0;

for (const u of updates) {
  const result = stmt.run(u.imagePromptTemplate, u.exampleDescription, u.id);
  if (result.changes > 0) {
    updated++;
    console.log(`✓ Updated: ${u.id}`);
  } else {
    skipped++;
    console.log(`✗ Skipped (not found): ${u.id}`);
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
console.log(`Before/After Split was NOT modified (as requested).`);

db.close();
