import OpenAI from "openai";
import { CopyProvider, AdCopyResult, GenerationConfig } from "../types";
import { extractJsonArray } from "../json-parser";

export class OpenAICopyProvider implements CopyProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateAdCopy(
    systemPrompt: string,
    config: GenerationConfig
  ): Promise<AdCopyResult[]> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate ${config.count} unique ads now. Return only valid JSON array.`,
        },
      ],
      max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content || "";
    return extractJsonArray(text);
  }
}
