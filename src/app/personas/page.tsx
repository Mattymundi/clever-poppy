"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Sparkles,
  Quote,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Persona {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  emotionalHooks: { name: string; description: string }[];
  customerQuotes: { quote: string; attribution: string }[];
  toneNotes: string | null;
  active: boolean;
}

// ─── Personas List Page ──────────────────────────────────────────────────────

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Failed to fetch personas");
      setPersonas(await res.json());
    } catch {
      toast.error("Failed to load personas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  async function toggleActive(persona: Persona) {
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !persona.active }),
      });
      if (!res.ok) throw new Error("Failed to update persona");
      setPersonas((prev) =>
        prev.map((p) =>
          p.id === persona.id ? { ...p, active: !p.active } : p
        )
      );
    } catch {
      toast.error("Failed to update persona");
    }
  }

  async function deletePersona(id: string) {
    try {
      const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete persona");
      toast.success("Persona deleted");
      setPersonas((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete persona");
    }
  }

  function createPersona() {
    router.push("/personas/new");
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-1 pt-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">
            Manage brand personas for ad generation.
          </p>
        </div>
        <Button onClick={createPersona} className="shadow-sm">
          <Plus className="mr-1.5" />
          Create Persona
        </Button>
      </div>

      {/* Empty state */}
      {personas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-3">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium">No personas yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first persona to start generating personalized ads.
          </p>
          <Button className="mt-5 shadow-sm" onClick={createPersona}>
            <Plus className="mr-1.5" />
            Create Persona
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="group rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30 cursor-pointer"
              onClick={() => router.push(`/personas/${persona.id}`)}
            >
              {/* Card top: name + badge */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-medium truncate">
                  {persona.name}
                </h3>
                <Badge variant="secondary" className="font-normal shrink-0">
                  {persona.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {persona.description || "No description"}
              </p>

              {/* Stats row */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {persona.emotionalHooks.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3" />
                    {persona.emotionalHooks.length} hook{persona.emotionalHooks.length !== 1 && "s"}
                  </span>
                )}
                {persona.customerQuotes.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Quote className="size-3" />
                    {persona.customerQuotes.length} quote{persona.customerQuotes.length !== 1 && "s"}
                  </span>
                )}
                {persona.systemPrompt && (
                  <span className="flex items-center gap-1">
                    <FileText className="size-3" />
                    {persona.systemPrompt.length.toLocaleString()} chars
                  </span>
                )}
              </div>

              {/* Footer: toggle + actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Switch
                    checked={persona.active}
                    onCheckedChange={() => toggleActive(persona)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {persona.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => router.push(`/personas/${persona.id}`)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deletePersona(persona.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
