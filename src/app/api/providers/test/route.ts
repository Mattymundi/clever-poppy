import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const provider = await prisma.aiProvider.findUnique({ where: { id } });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    let apiKey: string;
    try {
      apiKey = decrypt(provider.apiKey);
    } catch {
      return NextResponse.json(
        { error: "Failed to decrypt API key. It may be corrupted." },
        { status: 500 }
      );
    }

    const providerType = provider.provider.toLowerCase();

    if (providerType === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/models", {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      });

      if (!res.ok) {
        const errBody = await res.text();
        return NextResponse.json(
          { success: false, error: `Anthropic API error (${res.status}): ${errBody}` },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Anthropic API key is valid" });
    }

    if (providerType === "openai") {
      const baseUrl = provider.endpointUrl || "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        const errBody = await res.text();
        return NextResponse.json(
          { success: false, error: `OpenAI API error (${res.status}): ${errBody}` },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "OpenAI API key is valid" });
    }

    if (providerType === "google" || providerType === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const errBody = await res.text();
        return NextResponse.json(
          { success: false, error: `Google API error (${res.status}): ${errBody}` },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: "Google API key is valid" });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported provider type: ${provider.provider}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to test provider:", error);
    return NextResponse.json(
      { error: "Failed to test provider" },
      { status: 500 }
    );
  }
}
