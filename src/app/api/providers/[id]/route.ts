import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const provider = await prisma.aiProvider.findUnique({ where: { id } });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...provider,
      apiKey: maskApiKey(provider.apiKey.includes(":") ? "encrypted" : provider.apiKey),
    });
  } catch (error) {
    console.error("Failed to get provider:", error);
    return NextResponse.json(
      { error: "Failed to get provider" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.type !== undefined) data.type = body.type;
    if (body.provider !== undefined) data.provider = body.provider;
    if (body.modelName !== undefined) data.modelName = body.modelName;
    if (body.endpointUrl !== undefined) data.endpointUrl = body.endpointUrl;
    if (body.active !== undefined) data.active = body.active;

    // Re-encrypt apiKey if it was changed
    if (body.apiKey !== undefined) {
      data.apiKey = encrypt(body.apiKey);
    }

    const provider = await prisma.aiProvider.update({ where: { id }, data });

    return NextResponse.json({
      ...provider,
      apiKey: maskApiKey(body.apiKey ?? "encrypted"),
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    console.error("Failed to update provider:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.aiProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    console.error("Failed to delete provider:", error);
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}
