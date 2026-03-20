import { ImageProvider, ImageConfig } from "../types";

export class GeminiImageProvider implements ImageProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-2.0-flash-preview-image-generation") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateAdImage(
    imagePrompt: string,
    productImage: Buffer,
    config: ImageConfig
  ): Promise<Buffer> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Prepend dimension instructions to the prompt
    let dimensionPrompt = `Generate this image at exactly ${config.width}x${config.height} pixels (width x height).`;

    // For 9:16 (portrait/story), add crop-safe instructions
    if (config.height > config.width) {
      const topPadding = Math.round((config.height - config.width) / 2);
      dimensionPrompt += ` CRITICAL LAYOUT RULE: This is a ${config.width}x${config.height} portrait image. The image has three zones stacked vertically:
1. TOP ZONE (top ${topPadding}px): Fill this ENTIRELY with the ad's background color (the same color used in the ad design). No text, no graphics, no images — just a solid flat rectangle of the background color.
2. MIDDLE ZONE (center ${config.width}x${config.width}px square): ALL content goes here — every piece of text, every image, every graphic, every callout, every quote, the product photo, the CTA, the URL, everything. Design the entire ad layout within this square.
3. BOTTOM ZONE (bottom ${topPadding}px): Fill this ENTIRELY with the ad's background color (the same color used in the ad design). No text, no graphics, no images — just a solid flat rectangle of the background color.
IMPORTANT: The top and bottom color bands MUST match the ad's background color exactly. Do NOT use grey, white, or any other neutral color — use the SAME background color from the ad design. The result should look like the ad is centered on a taller canvas of the same color.`;
    }

    dimensionPrompt += ` ${imagePrompt}

This is a designed social media advertisement, NOT a photograph. Use clean bold sans-serif fonts for all text. All text must be spelled correctly and clearly legible. The design should feel fun, bold, and energetic — like a scroll-stopping Instagram ad. Place the provided product photo prominently in the design as specified in the layout description. Do NOT generate any fictional packaging, boxes, kit contents, or branded materials — only use the exact product photo provided. Everything else should be graphic design elements only.`;

    const body = {
      contents: [
        {
          parts: [
            { text: dimensionPrompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: productImage.toString("base64"),
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Search all candidates and parts for image data
    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          return Buffer.from(part.inlineData.data, "base64");
        }
      }
    }

    throw new Error(
      "Gemini returned no image data. The model may have refused the request due to safety filters."
    );
  }
}
