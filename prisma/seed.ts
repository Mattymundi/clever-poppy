import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname2, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Seed Colors
  const colors = [
    { name: "Coral", hex: "#E8614D" },
    { name: "Cream", hex: "#FDF5F0" },
    { name: "Teal", hex: "#2ABFBF" },
    { name: "Bright Yellow", hex: "#FFD23F" },
    { name: "Hot Pink", hex: "#FF6B9D" },
    { name: "Electric Blue", hex: "#4A90D9" },
    { name: "Fresh Green", hex: "#4ECB71" },
    { name: "Deep Purple", hex: "#7B61FF" },
    { name: "Warm Orange", hex: "#FF8C42" },
    { name: "Dusty Rose", hex: "#D4818A" },
    { name: "Sage Green", hex: "#8FB996" },
    { name: "Soft Lavender", hex: "#B8A9E8" },
    { name: "Sunshine Peach", hex: "#FFAB76" },
    { name: "Bold Red", hex: "#E63946" },
    { name: "Sky Blue", hex: "#7EC8E3" },
    { name: "Mint", hex: "#98E4C9" },
  ];

  for (const color of colors) {
    await prisma.colorPalette.upsert({
      where: { id: color.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { id: color.name.toLowerCase().replace(/\s+/g, "-"), ...color, active: true },
    });
  }
  console.log(`Seeded ${colors.length} colors`);

  // Seed Ad Types
  const adTypes: Array<{
    name: string;
    category: string;
    description: string;
    requiresQuote?: boolean;
    requiresBeforeAfter?: boolean;
    requiresComparison?: boolean;
  }> = [
    // Product-first (14)
    { name: "Feature Callout", category: "Product-first", description: "Product hero centred on bold background; 3-5 arrows/labels pointing to components/features." },
    { name: "Feature Spotlight (numbered tiles)", category: "Product-first", description: "Product photo plus 3-5 big feature tiles (often numbered, with icons)." },
    { name: "What's in the box flat lay", category: "Product-first", description: "Top-down layout showing every included item, labelled." },
    { name: "Exploded kit + labels", category: "Product-first", description: "Components arranged 'exploded view' style, each with a short label." },
    { name: "Macro detail proof", category: "Product-first", description: "1 large close-up (texture/material/finish) + small product hero + one benefit line." },
    { name: "3-step How it works", category: "Product-first", description: "Three numbered steps with simple verbs plus product anchor." },
    { name: "Step-by-step mini storyboard", category: "Product-first", description: "3-4 frames in one image (open → start → progress → finished)." },
    { name: "Beginner quickstart card", category: "Product-first", description: "'Start in 10 minutes' style layout: 1 promise + 2-3 bullets." },
    { name: "Specs sheet", category: "Product-first", description: "Clean 'Specs' layout (dimensions, materials, included tools, time required)." },
    { name: "Design/variant grid (Grid Swap)", category: "Product-first", description: "Multiple SKUs/variants in a neat grid with colour backgrounds." },
    { name: "Bundle stack", category: "Product-first", description: "'Bundle' hero shot with components behind/around it + 'bundle includes' line." },
    { name: "Bento-box layout", category: "Product-first", description: "One canvas split into 4-6 clean panels (product hero, one feature, one proof, one offer)." },
    { name: "Illustrated diagram", category: "Product-first", description: "Simple illustration or iconography explaining what the product does." },
    { name: "Lifestyle + micro labels", category: "Product-first", description: "Product in-use photo with 2-3 tiny labels calling out key moments/benefits." },
    // Benefit-first (8)
    { name: "Checklist Benefits", category: "Benefit-first", description: "Product on one side; high-contrast checklist on the other." },
    { name: "Value prop stack (3-5 bullets + icons)", category: "Benefit-first", description: "Like checklist, but with icon tiles and fewer words." },
    { name: "Big Text Hero", category: "Benefit-first", description: "Headline dominates ~60-70% of canvas; product is a corner anchor." },
    { name: "Text Overlay Deal", category: "Benefit-first", description: "Offer is front-and-centre as text overlay." },
    { name: "Punchy one-liner over lifestyle", category: "Benefit-first", description: "Big line of copy over a mood/outcome photo." },
    { name: "Data-point hero", category: "Benefit-first", description: "One huge stat or quantified claim as the main visual element." },
    { name: "Problem headline → solution subhead", category: "Benefit-first", description: "Top line calls out pain; second line promises relief." },
    { name: "Question hook (bold question)", category: "Benefit-first", description: "Big, slightly provocative question to force a mental 'answer.'" },
    // Offer-first (12)
    { name: "Starburst Offer", category: "Offer-first", description: "Offer badge/starburst carries the single key promotion or authority stat." },
    { name: "Promo code card", category: "Offer-first", description: "Big code block + one-line instruction + small product hero." },
    { name: "Was/Now price anchor", category: "Offer-first", description: "Strikethrough old price; bold new price; minimal copy." },
    { name: "Buy-more-save-more tiers", category: "Offer-first", description: "2-4 tiers presented as big blocks." },
    { name: "Free shipping / fast dispatch badge", category: "Offer-first", description: "Shipping promise in a badge + product." },
    { name: "Risk reversal badge", category: "Offer-first", description: "'Money-back guarantee' / 'love it or return it' as a seal." },
    { name: "Bonus/gift-with-purchase", category: "Offer-first", description: "Split layout showing main item plus 'free bonus' item." },
    { name: "Limited-time countdown motif", category: "Offer-first", description: "'Ends Sunday' / '48 hours' with timer graphic." },
    { name: "Back-in-stock / restock alert", category: "Offer-first", description: "Bold 'Back' headline + product hero." },
    { name: "Seasonal/occasion", category: "Offer-first", description: "Holiday/occasion framing with seasonal colours/graphics." },
    { name: "Event-timed pain point", category: "Offer-first", description: "Calendar-timed hook (e.g., 'Mother's Day gift solved')." },
    { name: "Launch/new drop", category: "Offer-first", description: "'New pattern' / 'New kit' as headline; product hero." },
    // Proof-first (10)
    { name: "Speech Bubble Quote", category: "Proof-first", description: "Oversized speech bubble with verbatim customer quote; attribution below.", requiresQuote: true },
    { name: "Social proof showcase", category: "Proof-first", description: "Product photo + testimonial overlay + rating/badge.", requiresQuote: true },
    { name: "Review screenshot / platform-native review card", category: "Proof-first", description: "Stylised screenshot of a real review.", requiresQuote: true },
    { name: "Star rating hero", category: "Proof-first", description: "Big '★★★★★' + average rating + review count; product secondary." },
    { name: "Social Proof Wall", category: "Proof-first", description: "Background scattered with many short quotes + stars; product centred.", requiresQuote: true },
    { name: "UGC photo collage", category: "Proof-first", description: "Grid of customer photos with minimal overlay." },
    { name: "Profile endorsement card", category: "Proof-first", description: "Named customer 'profile' panel: who they are + pain point + result.", requiresQuote: true },
    { name: "Unboxing proof card", category: "Proof-first", description: "Still image of packaging + contents + one line about first impression." },
    { name: "PR / As seen in bar", category: "Proof-first", description: "Publication logos + short pull quote." },
    { name: "Community milestone / people like you proof", category: "Proof-first", description: "'Join 10,000+ customers' / '500K+ community' + product." },
    // Comparison-first (6)
    { name: "Before/After Split", category: "Comparison-first", description: "Muted 'before' vs bold 'after' to visualise transformation.", requiresBeforeAfter: true },
    { name: "Problem-Solution split", category: "Comparison-first", description: "'Pain state' + 'solution state' with arrows or labels." },
    { name: "Comparison", category: "Comparison-first", description: "Side-by-side 'Generic kit vs Clever Poppy kit' with callouts.", requiresComparison: true },
    { name: "Comparison scorecard", category: "Comparison-first", description: "Small table with 4-6 criteria and ticks/crosses.", requiresComparison: true },
    { name: "This or that choice card", category: "Comparison-first", description: "Two options, viewer mentally chooses." },
    { name: "FAQ mini card (top objections)", category: "Comparison-first", description: "2-3 questions with one-line answers." },
  ];

  for (const adType of adTypes) {
    const slug = adType.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.adType.upsert({
      where: { id: slug },
      update: {},
      create: {
        id: slug,
        name: adType.name,
        category: adType.category,
        description: adType.description,
        requiresQuote: adType.requiresQuote ?? false,
        requiresBeforeAfter: adType.requiresBeforeAfter ?? false,
        requiresComparison: adType.requiresComparison ?? false,
        active: true,
      },
    });
  }
  console.log(`Seeded ${adTypes.length} ad types`);

  // Seed Personas
  const personas = [
    {
      id: "digital-addict",
      name: "Digital Addict",
      description: "Always-online, screen-fatigued creative who craves a tactile escape from digital overload.",
      systemPrompt: `=== BRAND CONTEXT ===
Clever Poppy is a modern embroidery brand that makes creative kits for beginners.
Voice: Warm, encouraging, slightly playful. Never condescending.
Tone: Like a creative best friend who gets it.

=== TARGET PERSONA: Digital Addict ===
Demographics: 25-40, predominantly female, urban/suburban
Characteristics: High screen time (8+ hrs/day), feels guilty about phone usage, creative-curious but intimidated
Fears: Wasting money on a hobby they won't stick with, being "bad at crafts"
Desires: A phone-free activity, something to show for their time, creative confidence

=== EMOTIONAL HOOKS ===
{{EMOTIONAL_HOOKS}}

=== AD TYPE STYLES ===
{{AD_TYPES}}

=== REAL CUSTOMER QUOTES BANK ===
{{CUSTOMER_QUOTES}}

=== COLOR PALETTE ===
{{COLOR_PALETTE}}

=== IMAGE CATALOGUE ===
{{IMAGE_CATALOGUE}}

=== OUTPUT INSTRUCTIONS ===
Generate ads as a JSON array. Each ad object must have:
- "ad_type": the name of the ad type used
- "headline": the main headline text
- "subheadline": optional secondary text
- "body_copy": any additional copy
- "cta": call-to-action text
- "background_color": hex value from the palette
- "image_prompt": a detailed prompt for the image generation AI describing exactly what the final ad image should look like
- "product_image_placement": where the product photo should go
- "callout_texts": array of any label/callout texts

Rules:
- Use VARIETY across ad types, hooks, colors, and copy angles
- Never repeat the same headline structure twice
- Mix emotional and rational appeals
- Keep headlines under 10 words
- CTAs should be action-oriented
- image_prompt must describe layout, text placement, colors, and style in detail`,
      emotionalHooks: JSON.stringify([
        { name: "Screen Time Swap", description: "Position embroidery as a satisfying replacement for mindless scrolling" },
        { name: "Tangible Pride", description: "Emphasize the joy of creating something physical you can touch and display" },
        { name: "Creative Permission", description: "Give them permission to be a beginner; lower the bar to entry" },
        { name: "Mindful Minutes", description: "Frame stitching as meditation, stress relief, phone-free calm" },
        { name: "Skill Surprise", description: "Challenge the assumption that embroidery is hard or old-fashioned" },
        { name: "Gift Flex", description: "Handmade gifts = thoughtful, impressive, and uniquely personal" },
        { name: "Community Belonging", description: "You're joining 10,000+ others who chose creativity over scrolling" },
      ]),
      customerQuotes: JSON.stringify([
        { quote: "I'm literally hooked! Haven't touched my phone all evening.", attribution: "Davina D." },
        { quote: "I was terrified I'd be terrible at it. My first hoop is now framed on my wall!", attribution: "Sarah M." },
        { quote: "Better than Netflix. I said what I said.", attribution: "Jess K." },
        { quote: "The instructions are so clear. I actually finished something creative for once.", attribution: "Meg R." },
        { quote: "My therapist told me to find a screen-free hobby. This is it.", attribution: "Lauren T." },
      ]),
      toneNotes: "Playful, relatable, slightly self-deprecating humor about screen addiction. Never preachy about phone usage.",
    },
    {
      id: "mental-wellness-seeker",
      name: "Mental Wellness Seeker",
      description: "Stressed professional seeking calm, mindful activities to support mental health and creative expression.",
      systemPrompt: `=== BRAND CONTEXT ===
Clever Poppy is a modern embroidery brand that makes creative kits for beginners.
Voice: Calm, supportive, gently motivating. Like a yoga teacher who also crafts.
Tone: Soothing but not clinical. Warm but not fluffy.

=== TARGET PERSONA: Mental Wellness Seeker ===
Demographics: 28-45, health-conscious, invests in self-care
Characteristics: Practices or aspires to mindfulness, overwhelmed by busy life, seeks calm activities
Fears: Another thing that adds to their to-do list, spending money on wellness trends that don't work
Desires: Genuine stress relief, a creative outlet that feels therapeutic, visible progress

=== EMOTIONAL HOOKS ===
{{EMOTIONAL_HOOKS}}

=== AD TYPE STYLES ===
{{AD_TYPES}}

=== REAL CUSTOMER QUOTES BANK ===
{{CUSTOMER_QUOTES}}

=== COLOR PALETTE ===
{{COLOR_PALETTE}}

=== IMAGE CATALOGUE ===
{{IMAGE_CATALOGUE}}

=== OUTPUT INSTRUCTIONS ===
Generate ads as a JSON array. Each ad object must have:
- "ad_type": the name of the ad type used
- "headline": the main headline text
- "subheadline": optional secondary text
- "body_copy": any additional copy
- "cta": call-to-action text
- "background_color": hex value from the palette
- "image_prompt": a detailed prompt for the image generation AI describing exactly what the final ad image should look like
- "product_image_placement": where the product photo should go
- "callout_texts": array of any label/callout texts

Rules:
- Use VARIETY across ad types, hooks, colors, and copy angles
- Never repeat the same headline structure twice
- Balance wellness messaging with creative excitement
- Keep headlines under 10 words
- CTAs should feel inviting, not pushy
- image_prompt must describe layout, text placement, colors, and style in detail`,
      emotionalHooks: JSON.stringify([
        { name: "Stitch & Breathe", description: "Frame embroidery as active meditation — rhythmic, calming, present" },
        { name: "Progress You Can See", description: "Unlike therapy or meditation, you get a visible result to hold" },
        { name: "Gentle Start", description: "No pressure, no perfection needed — just start and see what happens" },
        { name: "Self-Care That Creates", description: "Position as self-care that produces something beautiful, not just consumption" },
        { name: "Anxiety Anchor", description: "Hands busy = mind quiet. Give anxious hands something meaningful to do" },
        { name: "Slow Living", description: "Embroidery as rebellion against hustle culture and constant productivity" },
        { name: "Wellness Investment", description: "Compare cost-per-hour to therapy, apps, classes — embroidery wins" },
      ]),
      customerQuotes: JSON.stringify([
        { quote: "It's the only time my mind actually goes quiet.", attribution: "Rachel H." },
        { quote: "My anxiety is so much better since I started stitching. Not even kidding.", attribution: "Emma P." },
        { quote: "I replaced doomscrolling before bed with embroidery. I sleep so much better now.", attribution: "Kate W." },
        { quote: "It's like meditation but you get to keep the result.", attribution: "Nina L." },
        { quote: "I bought it for stress relief and got a new passion. Win-win.", attribution: "Aisha B." },
      ]),
      toneNotes: "Calm and grounding. Use wellness language authentically — not as a gimmick. Acknowledge real stress without being heavy.",
    },
  ];

  for (const persona of personas) {
    await prisma.persona.upsert({
      where: { id: persona.id },
      update: {},
      create: {
        id: persona.id,
        name: persona.name,
        description: persona.description,
        systemPrompt: persona.systemPrompt,
        emotionalHooks: persona.emotionalHooks,
        customerQuotes: persona.customerQuotes,
        toneNotes: persona.toneNotes,
        active: true,
      },
    });
  }
  console.log(`Seeded ${personas.length} personas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
