import { CopyProvider, ImageProvider } from "./types";
import { AnthropicCopyProvider } from "./providers/anthropic";
import { OpenAICopyProvider } from "./providers/openai-copy";
import { GeminiImageProvider } from "./providers/gemini-image";
import { OpenAIImageProvider } from "./providers/openai-image";
import { decrypt } from "@/lib/encryption";

interface ProviderRecord {
  provider: string;
  apiKey: string;
  modelName: string;
}

export function createCopyProvider(record: ProviderRecord): CopyProvider {
  const apiKey = decrypt(record.apiKey);
  switch (record.provider) {
    case "anthropic":
      return new AnthropicCopyProvider(apiKey, record.modelName);
    case "openai":
      return new OpenAICopyProvider(apiKey, record.modelName);
    default:
      throw new Error(`Unknown copy provider: ${record.provider}`);
  }
}

export function createImageProvider(record: ProviderRecord): ImageProvider {
  const apiKey = decrypt(record.apiKey);
  switch (record.provider) {
    case "gemini":
      return new GeminiImageProvider(apiKey, record.modelName);
    case "openai":
      return new OpenAIImageProvider(apiKey, record.modelName);
    default:
      throw new Error(`Unknown image provider: ${record.provider}`);
  }
}
