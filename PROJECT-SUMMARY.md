# Clever Poppy Ad Generator — Project Summary

## What It Does

A full-stack web app that generates Facebook/Instagram ad creative (copy + images) for Clever Poppy embroidery kits. You configure a persona, select ad types, pick source images, and hit generate — Claude writes the ad copy, Gemini creates the images.

## Tech Stack

- **Framework:** Next.js 15.5 (App Router, Turbopack, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI variant)
- **Database:** SQLite via Prisma 7 + better-sqlite3 adapter
- **AI Providers:**
  - **Claude (Anthropic)** — generates ad copy JSON (headlines, body, CTAs, image prompts)
  - **Gemini (Google)** — generates ad images from prompts + product photos
  - **OpenAI** — available as alternative for both copy and images
- **Other:** AES-256-GCM encryption for API keys, SSE streaming for real-time progress

## How the Generation Pipeline Works

```
1. User configures: persona + ad types + image libraries + colors + offer
                                    ↓
2. Prompt Builder assembles system prompt from:
   - Persona's base system prompt
   - Ad type descriptions + image prompt templates + requirements
   - Available product images & kit names (from image library)
   - Color palette hex values
   - Key callout facts
   - Customer quotes & emotional hooks
   - Offer text (if provided)
                                    ↓
3. Claude receives the system prompt + "Generate N ads"
   → Returns JSON array of ads, each with:
      headline, subheadline, body_copy, cta, background_color,
      image_prompt, product_image_placement, callout_texts
                                    ↓
4. For each ad, the pipeline:
   - Picks a random product photo from the image library
   - Sends image_prompt + product photo + dimension instructions to Gemini
   - Gemini generates the final ad image
   - Image saved to public/generated/<runId>/ad-NNN.png
                                    ↓
5. Results stored in DB, streamed to browser via SSE
```

## Pages (11 routes)

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/` | Stats, recent runs, quick actions |
| Generate | `/generate` | Configure + launch ad generation with real-time progress |
| History | `/history` | Paginated table of all past runs |
| Personas | `/personas` | List all personas |
| Edit Persona | `/personas/[id]` | Edit persona's system prompt, hooks, quotes |
| Ad Types | `/ad-types` | Filterable list with category tabs, bulk toggle |
| Edit Ad Type | `/ad-types/[id]` | Edit name, description, image prompt template, requirements |
| Image Libraries | `/image-libraries` | List libraries with sync status |
| Edit Library | `/image-libraries/[id]` | Edit library, sync from Google Sheet, manage images |
| Settings | `/settings` | AI provider CRUD + test, color palette manager, callout facts |
| System Diagram | `/system-diagram` | Visual reference showing how the pipeline works |

## API Routes (15 endpoints)

- **Generation:** `POST /api/generate`, `GET /api/generate/[id]`, `GET /api/generate/[id]/stream`
- **Personas:** `GET/POST /api/personas`, `GET/PUT/DELETE /api/personas/[id]`
- **Ad Types:** `GET/POST /api/ad-types`, `GET/PUT/DELETE /api/ad-types/[id]`, `PUT /api/ad-types/bulk`
- **Image Libraries:** `GET/POST /api/image-libraries`, `GET/PUT/DELETE /api/image-libraries/[id]`, `POST /api/image-libraries/[id]/sync`
- **Providers:** `GET/POST /api/providers`, `GET/PUT/DELETE /api/providers/[id]`, `POST /api/providers/test`
- **Colors:** `GET/POST /api/colors`, `GET/PUT/DELETE /api/colors/[id]`
- **Callout Facts:** `GET/POST/PUT /api/callout-facts`, `POST /api/callout-facts/sync`
- **History:** `GET /api/history`

## Database Models (Prisma)

| Model | Purpose |
|-------|---------|
| `Persona` | Brand voice — system prompt, emotional hooks, customer quotes |
| `AdType` | Ad format templates — description, image prompt template, requirement flags |
| `ImageLibrary` | Collections of product photos (manual upload or Google Sheet sync) |
| `AiProvider` | Encrypted API credentials for Claude/Gemini/OpenAI |
| `ColorPalette` | Brand colors with hex values |
| `CalloutFact` | Key selling points (e.g. "Free shipping over $70") with sort order |
| `CalloutFactSource` | Google Sheet source for syncing callout facts |
| `GenerationRun` | Output record with config, generated ads JSON, status, timing |
| `User` | Auth placeholder (not yet wired up) |

## Key Library Files

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Prisma client singleton with better-sqlite3 adapter |
| `src/lib/encryption.ts` | AES-256-GCM encrypt/decrypt for API keys |
| `src/lib/prompt-builder.ts` | Assembles system prompt with all template variables |
| `src/lib/generation-pipeline.ts` | Full pipeline orchestration — copy → images → save to disk |
| `src/lib/ai/types.ts` | CopyProvider/ImageProvider interfaces, dimension helpers |
| `src/lib/ai/json-parser.ts` | Extracts JSON arrays from AI responses with fallback parsing |
| `src/lib/ai/provider-factory.ts` | Creates provider instances from DB records |
| `src/lib/ai/providers/anthropic.ts` | Claude streaming copy generation |
| `src/lib/ai/providers/gemini-image.ts` | Gemini image generation with dimension/crop-safe instructions |
| `src/lib/ai/providers/openai-copy.ts` | OpenAI copy generation (alternative) |
| `src/lib/ai/providers/openai-image.ts` | DALL-E image generation (alternative) |

## Generated Images

Images are saved to disk at `public/generated/<runId>/ad-000.png`, `ad-001.png`, etc. The database stores just the URL path (e.g. `/generated/abc123/ad-000.png`). Next.js serves these automatically.

## How to Run

```bash
cd "C:/Users/matth/OneDrive/Desktop/Claude Code/clever-poppy"
export PATH="/c/Program Files/nodejs:$PATH"
npx next dev --turbopack
```

Then open http://localhost:3000

**PowerShell alternative:**
```powershell
cd "C:\Users\matth\OneDrive\Desktop\Claude Code\clever-poppy"
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npx.cmd next dev --turbopack
```

## Environment Requirements

- **Windows 11 ARM64**
- **Node.js v24+** (installed at `C:\Program Files\nodejs`)
- `.env` file with `ENCRYPTION_KEY` (for API key encryption)
- No Docker needed — uses SQLite (file: `dev.db` in project root)

## Known Issues / Not Yet Implemented

1. **Auth** — NextAuth installed but no login/signup pages or route protection
2. **Google Drive upload** — pipeline saves locally but doesn't upload to Drive
3. **Dark mode** — theme infrastructure in place but may need CSS tuning
4. **Monaco editor** — installed but not used (personas use plain textarea)
