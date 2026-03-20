"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, ArrowDown, Sliders, FileText, Bot, ImageIcon, FolderOutput } from "lucide-react"

// ---------------------------------------------------------------------------
// Collapsible Section
// ---------------------------------------------------------------------------

function CollapsibleDetail({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        {title}
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Arrow connector
// ---------------------------------------------------------------------------

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center text-muted-foreground/50">
        <div className="h-5 w-px bg-border" />
        <ArrowDown className="size-4 -mt-0.5" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step box wrapper
// ---------------------------------------------------------------------------

function StepBox({
  step,
  icon: Icon,
  title,
  subtitle,
  accentColor = "#E8604A",
  bgTint,
  children,
}: {
  step: number
  icon: React.ElementType
  title: string
  subtitle: string
  accentColor?: string
  bgTint?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{ backgroundColor: bgTint }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
          style={{ backgroundColor: accentColor }}
        >
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 pl-11">
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tag pill
// ---------------------------------------------------------------------------

function Tag({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "coral" | "blue" | "green" | "purple" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    coral: "bg-[#E8604A]/8 text-[#E8604A] dark:bg-[#E8604A]/15",
    blue: "bg-blue-500/8 text-blue-600 dark:text-blue-400 dark:bg-blue-500/15",
    green: "bg-green-500/8 text-green-600 dark:text-green-400 dark:bg-green-500/15",
    purple: "bg-purple-500/8 text-purple-600 dark:text-purple-400 dark:bg-purple-500/15",
  }

  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SystemDiagramPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">How It Works</h1>
        <p className="text-muted-foreground">
          Visual overview of the ad generation pipeline, from configuration to final output.
        </p>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: User Configuration                                   */}
      {/* ============================================================ */}
      <StepBox
        step={1}
        icon={Sliders}
        title="User Configuration"
        subtitle="Select inputs on the Generate page"
        bgTint="var(--color-muted)"
      >
        <div className="flex flex-wrap gap-1.5">
          <Tag variant="coral">Persona</Tag>
          <Tag variant="coral">Image Libraries</Tag>
          <Tag variant="coral">Ad Types</Tag>
          <Tag variant="coral">Colors</Tag>
          <Tag variant="coral">Offer (optional)</Tag>
          <Tag variant="coral">Image Ratio</Tag>
          <Tag variant="coral">Ad Count</Tag>
          <Tag variant="coral">Copy Provider</Tag>
          <Tag variant="coral">Image Provider</Tag>
        </div>

        <CollapsibleDetail title="How inputs are used">
          <ul className="space-y-1.5 list-disc list-inside">
            <li><strong>Persona</strong> provides the base system prompt and emotional hooks, customer quotes, and brand voice.</li>
            <li><strong>Image Libraries</strong> supply product photos that get composited into the final ad images.</li>
            <li><strong>Ad Types</strong> define the creative formats (e.g. testimonial, before/after, comparison) with their own image prompt templates.</li>
            <li><strong>Colors</strong> constrain the palette Claude can assign to each ad&apos;s background.</li>
            <li><strong>Offer</strong> injects a current promotion (e.g. &quot;Buy 3+ kits, get 25% OFF&quot;) into the prompt.</li>
            <li><strong>Image Ratio</strong> sets output dimensions: 1:1 (1080x1080), 4:5 (1080x1350), or 9:16 (1080x1920).</li>
            <li><strong>Ad Count</strong> tells Claude how many ad variants to generate (1-100).</li>
          </ul>
        </CollapsibleDetail>
      </StepBox>

      <FlowArrow />

      {/* ============================================================ */}
      {/* STEP 2: Prompt Builder                                       */}
      {/* ============================================================ */}
      <StepBox
        step={2}
        icon={FileText}
        title="Prompt Builder"
        subtitle="Assembles the persona's system prompt with injected template variables"
        accentColor="#7C3AED"
        bgTint="var(--color-muted)"
      >
        <p className="text-xs text-muted-foreground mb-3">
          The persona&apos;s base system prompt contains placeholder tokens (highlighted in <span className="text-purple-600 dark:text-purple-400 font-semibold">purple</span>) that get replaced with real data from the database:
        </p>

        {/* Actual prompt preview */}
        <div className="rounded-lg bg-gray-950 p-4 text-xs font-mono leading-relaxed text-gray-300 overflow-x-auto max-h-[600px] overflow-y-auto">
          <p className="text-gray-500 italic mb-3">{"//"} Persona system prompt (editable on the Personas page)</p>

          <p className="text-gray-100">You are an expert ad creative director for Clever Poppy, a beginner embroidery kit company. Your job is to generate unique graphic-style ad concepts for Instagram and Facebook ads.</p>
          <br />
          <p className="text-gray-100">These are NOT lifestyle photography ads. These are bold, colorful, graphic-design-style ads with bright colored backgrounds, product photos, and eye-catching callout elements like arrows, speech bubbles, star bursts, checkmark lists, and before/after comparisons.</p>
          <br />

          <p className="text-gray-500">=== BRAND CONTEXT ===</p>
          <p className="text-gray-100">ABOUT: Clever Poppy makes it easy and enjoyable for complete beginners to learn embroidery...</p>
          <p className="text-gray-100">BRAND VOICE: Warm, encouraging, down-to-earth...</p>
          <p className="text-gray-100">TONE RULES: Punchy, confident, fun... NEVER use craft jargon... NEVER shame people for screen time...</p>
          <br />

          <p className="text-gray-500">=== TARGET PERSONA ===</p>
          <p className="text-gray-100">Age 18-55. Constantly on phone/laptop. Mentally overstimulated...</p>
          <br />

          <p className="text-gray-500">=== EMOTIONAL HOOKS ===</p>
          <p className="text-purple-400 font-semibold">{"{{EMOTIONAL_HOOKS}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to: - <strong>Screen Time Guilt</strong>: They feel bad about hours lost... <br />- <strong>Creative Identity</strong>: They want to see themselves as creative...</p>
          <br />

          <p className="text-gray-500">=== PRODUCT DETAILS ===</p>
          <p className="text-gray-100">EMBROIDERY KITS: <span className="text-purple-400 font-semibold">{"{{KIT_NAMES}}"}</span></p>
          <p className="text-gray-600 text-[10px]">→ Expands to: Bee Happy, Stitch Sampler, Flora the Cat, Sunset Meadow... (from image library)</p>
          <br />
          <p className="text-gray-100">EVERY KIT INCLUDES:</p>
          <p className="text-gray-100">- QR code linking to step-by-step video tutorials</p>
          <p className="text-gray-100">- Premium embroidery threads on bobbins — 100% Egyptian cotton</p>
          <p className="text-gray-100">- Pack of 6 Clever Poppy embroidery needles</p>
          <p className="text-gray-100">- Clever Poppy scissors (sea green handle)</p>
          <p className="text-gray-100">- Heat-erasable transfer pen</p>
          <p className="text-gray-100">- Beechwood display hoop</p>
          <p className="text-gray-400">  ...and more</p>
          <br />
          <p className="text-gray-100">CURRENT OFFER: <span className="text-purple-400 font-semibold">{"{{CURRENT_OFFER}}"}</span></p>
          <p className="text-gray-600 text-[10px]">→ Expands to: Buy 3+ kits, get 25% OFF (or removed entirely if blank)</p>
          <br />

          <p className="text-gray-500">=== KEY CALLOUT FACTS ===</p>
          <p className="text-purple-400 font-semibold">{"{{CALLOUT_FACTS}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to: - &quot;Step-by-step videos for EVERY pattern&quot;<br />- &quot;Everything you need in ONE box&quot;<br />- &quot;500K+ community&quot;...</p>
          <br />

          <p className="text-gray-500">=== AD TYPE STYLES ===</p>
          <p className="text-purple-400 font-semibold">{"{{AD_TYPES}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to numbered list with name, category, description, PLUS:<br />
          &nbsp;&nbsp;IMAGE PROMPT TEMPLATE: Create a bold graphic social media ad with...<br />
          &nbsp;&nbsp;EXAMPLE: Before: &quot;Sunday night dread&quot; (grey, muted) | After: &quot;Sunday night stitching&quot; (bright coral)...<br />
          &nbsp;&nbsp;REQUIREMENTS: must show before/after states</p>
          <br />

          <p className="text-gray-500">=== REAL CUSTOMER QUOTES BANK ===</p>
          <p className="text-purple-400 font-semibold">{"{{CUSTOMER_QUOTES}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to: - &quot;I&apos;m hooked. I&apos;m on my eighth kit and I can&apos;t stop.&quot; — Davina D.<br />- &quot;Cheaper than therapy — and way more fun!&quot;...</p>
          <br />

          <p className="text-gray-500">=== COLOR PALETTE ===</p>
          <p className="text-gray-100">Each ad MUST use one of these bold background colors:</p>
          <p className="text-purple-400 font-semibold">{"{{COLOR_PALETTE}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to: - Coral: #E8604A<br />- Cream: #FDF5F0<br />- Teal: #2ABFBF...</p>
          <br />

          <p className="text-gray-500">=== IMAGE CATALOGUE ===</p>
          <p className="text-purple-400 font-semibold">{"{{IMAGE_CATALOGUE}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Expands to: URLs of all product photos with kit names</p>
          <br />

          <p className="text-gray-500">=== OUTPUT INSTRUCTIONS ===</p>
          <p className="text-gray-100">Generate ads as a JSON array. Each ad object must have:</p>
          <p className="text-gray-100">- &quot;ad_type&quot;, &quot;headline&quot;, &quot;subheadline&quot;, &quot;body_copy&quot;, &quot;cta&quot;</p>
          <p className="text-gray-100">- &quot;background_color&quot;: hex value from the palette</p>
          <p className="text-gray-100">- &quot;image_prompt&quot;: A detailed prompt for the image generation AI</p>
          <p className="text-gray-100">- &quot;callout_texts&quot;, &quot;customer_quote&quot;, &quot;product_image_placement&quot;</p>
          <br />

          <p className="text-gray-500">=== IMAGE PROMPT RULES (CRITICAL) ===</p>
          <p className="text-gray-100">Every image_prompt must include:</p>
          <p className="text-gray-100">1. BACKGROUND: Exact hex color from palette</p>
          <p className="text-gray-100">2. PRODUCT PHOTO: Position and size</p>
          <p className="text-gray-100">3. CALLOUT ELEMENTS: Type, position, text, color</p>
          <p className="text-gray-100">4. TEXT: Spell out every word</p>
          <p className="text-gray-100">5. LAYOUT: Overall composition</p>
          <p className="text-gray-100">6. STYLE: Designed graphic ad, NOT photograph</p>
          <p className="text-gray-100">7. COMPOSITING: Product photo composited in</p>
          <p className="text-gray-100">8. RESTRICTION: Do NOT generate fictional packaging</p>
          <br />

          <p className="text-gray-500">=== VARIETY RULES ===</p>
          <p className="text-gray-100">Distribute evenly across ad types, colors, kit names. No two ads should look the same.</p>
          <br />

          <p className="text-purple-400 font-semibold">{"{{FEEDBACK_SUMMARY}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Optional: past performance feedback (removed if empty)</p>
          <br />
          <p className="text-purple-400 font-semibold">{"{{TREND_BRIEF}}"}</p>
          <p className="text-gray-600 text-[10px]">→ Optional: current design trends (removed if empty)</p>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 italic">
          This prompt is editable on the Personas page. The placeholder variables are replaced at generation time with data from the database.
        </p>
      </StepBox>

      <FlowArrow />

      {/* ============================================================ */}
      {/* STEP 3: Claude AI (Copy Provider)                            */}
      {/* ============================================================ */}
      <StepBox
        step={3}
        icon={Bot}
        title="Claude AI (Copy Provider)"
        subtitle="Generates structured ad copy as a JSON array"
        accentColor="#2563EB"
        bgTint="var(--color-muted)"
      >
        <p className="text-xs text-muted-foreground mb-2">
          Receives the assembled system prompt and returns a JSON array of ad objects, one per requested ad.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Tag variant="blue">headline</Tag>
          <Tag variant="blue">subheadline</Tag>
          <Tag variant="blue">body_copy</Tag>
          <Tag variant="blue">cta</Tag>
          <Tag variant="blue">background_color</Tag>
          <Tag variant="blue">image_prompt</Tag>
          <Tag variant="blue">callout_texts</Tag>
          <Tag variant="blue">ad_type</Tag>
          <Tag variant="blue">emotional_hook</Tag>
        </div>

        <CollapsibleDetail title="How the copy generation works">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>The system prompt tells Claude the exact JSON schema to follow.</li>
            <li>Claude picks ad types from the provided list and assigns a background color from the palette.</li>
            <li>Each ad&apos;s <code className="font-mono text-[11px]">image_prompt</code> is a detailed description of what the final visual should look like, including layout, text placement, and product photo positioning.</li>
            <li>The response is parsed with a JSON extractor that finds the array even if wrapped in markdown code fences.</li>
            <li>Count and image ratio are passed as generation parameters.</li>
          </ul>
        </CollapsibleDetail>
      </StepBox>

      <FlowArrow />

      {/* ============================================================ */}
      {/* STEP 4: Gemini AI (Image Provider)                           */}
      {/* ============================================================ */}
      <StepBox
        step={4}
        icon={ImageIcon}
        title="Gemini AI (Image Provider)"
        subtitle="Generates the final ad images from prompts + product photos"
        accentColor="#059669"
        bgTint="var(--color-muted)"
      >
        <p className="text-xs text-muted-foreground mb-2">
          For each ad, Gemini receives a composite prompt built from multiple parts:
        </p>
        <div className="space-y-1.5 rounded-lg bg-background/60 p-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-green-500" />
            <span><strong>Dimension rules</strong> &mdash; exact pixel dimensions (e.g. 1080x1080)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-green-500" />
            <span><strong>9:16 crop-safe zone rules</strong> (portrait only) &mdash; top/bottom padding zones filled with background color, all content in the center square</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-green-500" />
            <span><strong>Claude&apos;s image_prompt</strong> &mdash; the detailed layout and copy from step 3</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-green-500" />
            <span><strong>Design instructions</strong> &mdash; &quot;clean bold sans-serif fonts, scroll-stopping Instagram ad, no fictional packaging&quot;</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-green-500" />
            <span><strong>Product photo</strong> &mdash; a randomly selected image from the chosen libraries, sent as base64 inline data</span>
          </div>
        </div>

        <CollapsibleDetail title="Portrait (9:16) layout zones">
          <div className="flex flex-col items-center gap-1">
            <div className="w-28 rounded-t-md bg-green-500/10 p-2 text-center text-[10px] font-medium text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
              TOP ZONE<br />solid background color
            </div>
            <div className="w-28 bg-green-500/5 p-3 text-center text-[10px] font-medium text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
              MIDDLE ZONE<br />all content here<br />(center square)
            </div>
            <div className="w-28 rounded-b-md bg-green-500/10 p-2 text-center text-[10px] font-medium text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
              BOTTOM ZONE<br />solid background color
            </div>
          </div>
          <p className="mt-2 text-center">
            Top and bottom zones match the ad&apos;s background color. All text, images, graphics, and CTAs live in the center square.
          </p>
        </CollapsibleDetail>

        <CollapsibleDetail title="Concurrency">
          <p>Ads are processed in batches of <strong>5</strong> concurrent image generation requests. Progress is saved to the database after each batch, enabling real-time SSE streaming to the UI.</p>
        </CollapsibleDetail>
      </StepBox>

      <FlowArrow />

      {/* ============================================================ */}
      {/* STEP 5: Output                                               */}
      {/* ============================================================ */}
      <StepBox
        step={5}
        icon={FolderOutput}
        title="Output"
        subtitle="Images saved to disk, copy stored in the database"
        accentColor="#D97706"
        bgTint="var(--color-muted)"
      >
        <div className="space-y-1.5 rounded-lg bg-background/60 p-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-amber-500" />
            <span><strong>PNG images</strong> saved to <code className="font-mono text-[11px] bg-muted rounded px-1">public/generated/&lt;runId&gt;/ad-000.png</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-amber-500" />
            <span><strong>Ad copy JSON</strong> stored on the <code className="font-mono text-[11px] bg-muted rounded px-1">GenerationRun</code> record (headline, subheadline, body_copy, cta, image_prompt, status, etc.)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 mt-1 inline-block size-1.5 rounded-full bg-amber-500" />
            <span><strong>Run metadata</strong> &mdash; status, success/fail counts, duration, and optional Google Drive folder URL</span>
          </div>
        </div>

        <CollapsibleDetail title="File structure">
          <pre className="font-mono text-[11px] leading-relaxed whitespace-pre">
{`public/
  generated/
    <runId>/
      ad-000.png
      ad-001.png
      ad-002.png
      ...`}
          </pre>
          <p className="mt-2">Images are served statically at <code className="font-mono text-[11px]">/generated/&lt;runId&gt;/ad-000.png</code> and displayed in the progress grid on the Generate page.</p>
        </CollapsibleDetail>
      </StepBox>

      {/* Footer note */}
      <div className="rounded-xl bg-muted/50 p-4 text-center text-xs text-muted-foreground mb-8">
        The entire pipeline runs server-side. The Generate page connects via <strong>Server-Sent Events (SSE)</strong> to stream progress updates in real time.
      </div>
    </div>
  )
}
