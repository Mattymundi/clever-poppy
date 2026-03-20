import OpenAI from "openai";
import { ImageProvider, ImageConfig } from "../types";

export class OpenAIImageProvider implements ImageProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "dall-e-3") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateAdImage(
    imagePrompt: string,
    _productImage: Buffer,
    config: ImageConfig
  ): Promise<Buffer> {
    const size =
      config.width === config.height
        ? ("1024x1024" as const)
        : ("1024x1792" as const);

    const response = await this.client.images.generate({
      model: this.model,
      prompt: imagePrompt,
      n: 1,
      size,
      response_format: "b64_json",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data");
    return Buffer.from(b64, "base64");
  }
}
