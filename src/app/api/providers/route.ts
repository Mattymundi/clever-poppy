import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export async function GET() {
  try {
    const providers = await prisma.aiProvider.findMany({
      orderBy: { createdAt: "desc" },
    });

    const masked = providers.map((p) => ({
      ...p,
      apiKey: maskApiKey(p.apiKey.includes(":") ? "encrypted" : p.apiKey),
    }));

    return NextResponse.json(masked);
  } catch (error) {
    console.error("Failed to list providers:", error);
    return NextResponse.json(
      { error: "Failed to list providers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, provider, apiKey, modelName, endpointUrl, active } = body;

    if (!name || !type || !provider || !apiKey || !modelName) {
      return NextResponse.json(
        { error: "name, type, provider, apiKey, and modelName are required" },
        { status: 400 }
      );
    }

    const encryptedKey = encrypt(apiKey);

    const aiProvider = await prisma.aiProvider.create({
      data: {
        name,
        type,
        provider,
        apiKey: encryptedKey,
        modelName,
        endpointUrl: endpointUrl ?? null,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      { ...aiProvider, apiKey: maskApiKey(apiKey) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}
