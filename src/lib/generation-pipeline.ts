import { prisma } from "@/lib/db";
import { createCopyProvider, createImageProvider } from "@/lib/ai/provider-factory";
import { buildSystemPrompt } from "@/lib/prompt-builder";
import { getImageDimensions } from "@/lib/ai/types";
import { createDriveFolder, uploadFileToDrive, formatRunFolderName } from "@/lib/google-drive";

interface GenerationConfig {
  personaId: string;
  imageLibraryIds: string[];
  adTypeIds: string[];
  imageRatio: string;
  adCount: number;
  colorIds: string[];
  copyProviderId: string;
  imageProviderId: string;
  driveFolderUrl?: string;
  offer?: string;
  forceOffer?: boolean;
}

export async function runGenerationPipeline(runId: string, config: GenerationConfig) {
  const startTime = Date.now();

  try {
    // Update status to running
    await prisma.generationRun.update({
      where: { id: runId },
      data: { status: "running" },
    });

    // Load all needed data
    const [persona, adTypes, imageLibraries, colors, copyProviderRecord, imageProviderRecord, calloutFacts] =
      await Promise.all([
        prisma.persona.findUniqueOrThrow({ where: { id: config.personaId } }),
        prisma.adType.findMany({ where: { id: { in: config.adTypeIds } } }),
        prisma.imageLibrary.findMany({ where: { id: { in: config.imageLibraryIds } } }),
        prisma.colorPalette.findMany({ where: { id: { in: config.colorIds } } }),
        prisma.aiProvider.findUniqueOrThrow({ where: { id: config.copyProviderId } }),
        prisma.aiProvider.findUniqueOrThrow({ where: { id: config.imageProviderId } }),
        prisma.calloutFact.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      ]);

    // Create a Google Drive subfolder for this run
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    let driveFolderId: string | null = null;
    let driveFolderUrl: string | null = null;

    if (rootFolderId) {
      const folderName = formatRunFolderName(adTypes.map((t) => t.name));
      const folder = await createDriveFolder(folderName, rootFolderId);
      driveFolderId = folder.folderId;
      driveFolderUrl = folder.webViewLink;
      console.log(`Created Drive folder: ${folderName} → ${driveFolderUrl}`);
    } else {
      console.warn("GOOGLE_DRIVE_FOLDER_ID not set — images will not be uploaded to Drive");
    }

    // Pool all active images from selected libraries
    const allImages: Array<{ url: string; kitName?: string; description?: string }> = [];
    for (const lib of imageLibraries) {
      const images = JSON.parse(lib.images || "[]");
      for (const img of images) {
        if (img.active !== false) {
          allImages.push(img);
        }
      }
    }

    // Parse persona JSON fields
    const emotionalHooks = JSON.parse(persona.emotionalHooks || "[]");
    const customerQuotes = JSON.parse(persona.customerQuotes || "[]");

    // Extract unique kit names from image library
    const kitNameSet = new Set<string>();
    for (const img of allImages) {
      if (img.kitName) kitNameSet.add(img.kitName);
    }
    const kitNames = Array.from(kitNameSet);

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      basePrompt: persona.systemPrompt,
      adTypes: adTypes.map((t) => ({
        name: t.name,
        category: t.category,
        description: t.description,
        imagePromptTemplate: t.imagePromptTemplate || undefined,
        exampleDescription: t.exampleDescription || undefined,
        requiresQuote: t.requiresQuote,
        requiresBeforeAfter: t.requiresBeforeAfter,
        requiresComparison: t.requiresComparison,
        useCalloutFacts: t.useCalloutFacts,
        qualityNotes: t.qualityNotes || undefined,
        approvedExamples: t.approvedExamples ? JSON.parse(t.approvedExamples) : undefined,
      })),
      colors: colors.map((c) => ({ name: c.name, hex: c.hex })),
      images: allImages,
      emotionalHooks,
      customerQuotes,
      calloutFacts: calloutFacts.map((f) => f.text),
      kitNames,
      offer: config.offer,
      forceOffer: config.forceOffer,
    });

    // Create copy provider and generate ad copy
    const copyProvider = createCopyProvider(copyProviderRecord);
    const adCopies = await copyProvider.generateAdCopy(systemPrompt, {
      count: config.adCount,
      imageRatio: config.imageRatio,
    });

    // Create image provider
    const imageProvider = createImageProvider(imageProviderRecord);
    const dimensions = getImageDimensions(config.imageRatio);

    const ads: any[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process ads with concurrency limit
    const CONCURRENCY = 5;
    for (let i = 0; i < adCopies.length; i += CONCURRENCY) {
      const batch = adCopies.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async (adCopy, batchIdx) => {
          const adIndex = i + batchIdx;
          try {
            // Pick a random product image
            let imageBuffer: Buffer | null = null;
            if (allImages.length > 0) {
              const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
              try {
                const response = await fetch(randomImage.url);
                if (response.ok) {
                  imageBuffer = Buffer.from(await response.arrayBuffer());
                }
              } catch {
                // If we can't download, continue without product image
              }
            }

            // Generate ad image
            let driveFileUrl: string | null = null;
            let imageGenerated = false;
            let imageError: string | null = null;

            if (imageBuffer) {
              try {
                const result = await imageProvider.generateAdImage(
                  adCopy.image_prompt,
                  imageBuffer,
                  dimensions
                );
                imageGenerated = true;

                // Upload to Google Drive
                if (driveFolderId) {
                  try {
                    const adTypeName = (adCopy.ad_type || "ad").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
                    const filename = `${String(adIndex + 1).padStart(3, "0")}-${adTypeName}.png`;
                    const uploaded = await uploadFileToDrive(filename, result, driveFolderId);
                    driveFileUrl = uploaded.webViewLink;
                    console.log(`Uploaded ad ${adIndex} → ${driveFileUrl}`);
                  } catch (uploadErr: any) {
                    imageError = `Drive upload failed: ${uploadErr.message}`;
                    console.error(`Drive upload failed for ad ${adIndex}:`, uploadErr.message);
                  }
                }
              } catch (err: any) {
                imageError = `Image generation failed: ${err.message}`;
                console.error(`Image generation failed for ad ${adIndex}:`, err.message || err);
              }
            } else {
              imageError = "No product image available (download failed or no images in library)";
            }

            const adStatus = imageGenerated && (driveFileUrl || !driveFolderId) ? "success" : "image_failed";

            return {
              index: adIndex,
              ...adCopy,
              generated_image: driveFileUrl,
              status: adStatus,
              ...(imageError ? { error: imageError } : {}),
            };
          } catch (err: any) {
            return {
              index: adIndex,
              ...adCopy,
              status: "failed",
              error: err.message,
            };
          }
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          const ad = result.value;
          ads.push(ad);
          if (ad.status === "success") successCount++;
          else failCount++;
        } else {
          failCount++;
          ads.push({ status: "failed", error: result.reason?.message });
        }
      }

      // Update progress in DB after each batch
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      await prisma.generationRun.update({
        where: { id: runId },
        data: {
          successCount,
          failCount,
          ads: JSON.stringify(ads),
          durationSeconds: elapsed,
        },
      });
    }

    // Mark complete
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    await prisma.generationRun.update({
      where: { id: runId },
      data: {
        status: "complete",
        successCount,
        failCount,
        ads: JSON.stringify(ads),
        durationSeconds: elapsed,
        driveFolderUrl,
      },
    });

    console.log(`Generation run ${runId} complete: ${successCount} success, ${failCount} failed.${driveFolderUrl ? ` Drive folder: ${driveFolderUrl}` : ""}`);
  } catch (err: any) {
    console.error("Generation pipeline failed:", err);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    await prisma.generationRun.update({
      where: { id: runId },
      data: {
        status: "failed",
        durationSeconds: elapsed,
        ads: JSON.stringify([{ error: err.message }]),
      },
    });
  }
}
