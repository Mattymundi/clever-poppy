import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runGenerationPipeline } from "@/lib/generation-pipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      personaId,
      adCount,
      imageRatio,
      imageLibraryIds,
      adTypeIds,
      colorIds,
      copyProviderId,
      imageProviderId,
      driveFolderUrl,
      offer,
      forceOffer,
    } = body;

    if (!personaId || !adCount || !imageRatio) {
      return NextResponse.json(
        { error: "personaId, adCount, and imageRatio are required" },
        { status: 400 }
      );
    }

    // Verify persona exists
    const persona = await prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const config = {
      personaId,
      imageLibraryIds: imageLibraryIds || [],
      adTypeIds: adTypeIds || [],
      imageRatio,
      adCount,
      colorIds: colorIds || [],
      copyProviderId: copyProviderId || "",
      imageProviderId: imageProviderId || "",
      driveFolderUrl: driveFolderUrl || "",
      offer: offer || "",
      forceOffer: !!forceOffer,
    };

    const run = await prisma.generationRun.create({
      data: {
        personaId,
        adCount,
        imageRatio,
        config: JSON.stringify(config),
        status: "pending",
      },
    });

    // Fire and forget — start the pipeline in the background
    runGenerationPipeline(run.id, config).catch((err) => {
      console.error("Background generation pipeline failed:", err);
    });

    return NextResponse.json(
      {
        ...run,
        config: JSON.parse(run.config),
        ads: JSON.parse(run.ads),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create generation run:", error);
    return NextResponse.json(
      { error: "Failed to create generation run" },
      { status: 500 }
    );
  }
}
