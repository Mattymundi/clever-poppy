import Anthropic from "@anthropic-ai/sdk";
import { CopyProvider, AdCopyResult, GenerationConfig } from "../types";
import { extractJsonArray } from "../json-parser";

export class AnthropicCopyProvider implements CopyProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-sonnet-4-20250514") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateAdCopy(
    systemPrompt: string,
    config: GenerationConfig
  ): Promise<AdCopyResult[]> {
    // Scale max_tokens based on ad count (~800 tokens per ad + buffer)
    const tokensPerAd = 800;
    const maxTokens = Math.min(Math.max(config.count * tokensPerAd + 1024, 8192), 32000);

    // Use streaming to avoid timeout on large requests
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate EXACTLY ${config.count} unique ads — no more, no fewer. The JSON array must contain precisely ${config.count} objects. Return only valid JSON array. Make sure the JSON is complete and properly closed.`,
        },
      ],
    });

    const response = await stream.finalMessage();

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return extractJsonArray(text);
  }
}
