export interface AdCopyResult {
  ad_type: string;
  headline: string;
  subheadline?: string;
  body_copy?: string;
  cta: string;
  background_color: string;
  image_prompt: string;
  product_image_placement?: string;
  callout_texts?: string[];
}

export interface GenerationConfig {
  count: number;
  imageRatio: string;
}

export interface ImageConfig {
  width: number;
  height: number;
}

export interface CopyProvider {
  generateAdCopy(
    systemPrompt: string,
    config: GenerationConfig
  ): Promise<AdCopyResult[]>;
}

export interface ImageProvider {
  generateAdImage(
    imagePrompt: string,
    productImage: Buffer,
    config: ImageConfig
  ): Promise<Buffer>;
}

export function getImageDimensions(ratio: string): { width: number; height: number } {
  switch (ratio) {
    case "4:5":
      return { width: 1080, height: 1350 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
    default:
      return { width: 1080, height: 1080 };
  }
}
