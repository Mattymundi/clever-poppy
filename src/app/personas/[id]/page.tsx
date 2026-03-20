"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Quote,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmotionalHook {
  name: string;
  description: string;
}

interface CustomerQuote {
  quote: string;
  attribution: string;
}

interface PersonaData {
  id?: string;
  name: string;
  description: string;
  systemPrompt: string;
  emotionalHooks: EmotionalHook[];
  customerQuotes: CustomerQuote[];
  toneNotes: string;
  active: boolean;
}

const emptyPersona: PersonaData = {
  name: "",
  description: "",
  systemPrompt: "",
  emotionalHooks: [],
  customerQuotes: [],
  toneNotes: "",
  active: true,
};

// ─── Persona Edit Page ───────────────────────────────────────────────────────

export default function PersonaEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [persona, setPersona] = useState<PersonaData>(emptyPersona);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchPersona = useCallback(async () => {
    try {
      const res = await fetch(`/api/personas/${id}`);
      if (!res.ok) throw new Error("Failed to fetch persona");
      const data = await res.json();
      setPersona({
        id: data.id,
        name: data.name,
        description: data.description ?? "",
        systemPrompt: data.systemPrompt,
        emotionalHooks: data.emotionalHooks ?? [],
        customerQuotes: data.customerQuotes ?? [],
        toneNotes: data.toneNotes ?? "",
        active: data.active,
      });
    } catch {
      toast.error("Failed to load persona");
      router.push("/personas");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isNew) fetchPersona();
  }, [isNew, fetchPersona]);

  // ── Field updaters ─────────────────────────────────────────────────────────

  function updateField<K extends keyof PersonaData>(
    field: K,
    value: PersonaData[K]
  ) {
    setPersona((prev) => ({ ...prev, [field]: value }));
  }

  // ── Emotional hooks ────────────────────────────────────────────────────────

  function addHook() {
    updateField("emotionalHooks", [
      ...persona.emotionalHooks,
      { name: "", description: "" },
    ]);
  }

  function updateHook(index: number, field: keyof EmotionalHook, value: string) {
    const hooks = [...persona.emotionalHooks];
    hooks[index] = { ...hooks[index], [field]: value };
    updateField("emotionalHooks", hooks);
  }

  function removeHook(index: number) {
    updateField(
      "emotionalHooks",
      persona.emotionalHooks.filter((_, i) => i !== index)
    );
  }

  // ── Customer quotes ────────────────────────────────────────────────────────

  function addQuote() {
    updateField("customerQuotes", [
      ...persona.customerQuotes,
      { quote: "", attribution: "" },
    ]);
  }

  function updateQuote(
    index: number,
    field: keyof CustomerQuote,
    value: string
  ) {
    const quotes = [...persona.customerQuotes];
    quotes[index] = { ...quotes[index], [field]: value };
    updateField("customerQuotes", quotes);
  }

  function removeQuote(index: number) {
    updateField(
      "customerQuotes",
      persona.customerQuotes.filter((_, i) => i !== index)
    );
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function save() {
    if (!persona.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!persona.systemPrompt.trim()) {
      toast.error("System prompt is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: persona.name,
        description: persona.description || null,
        systemPrompt: persona.systemPrompt,
        emotionalHooks: persona.emotionalHooks.filter(
          (h) => h.name.trim() || h.description.trim()
        ),
        customerQuotes: persona.customerQuotes.filter(
          (q) => q.quote.trim() || q.attribution.trim()
        ),
        toneNotes: persona.toneNotes || null,
        active: persona.active,
      };

      const url = isNew ? "/api/personas" : `/api/personas/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save persona");
      }

      const saved = await res.json();
      toast.success(isNew ? "Persona created" : "Persona updated");

      if (isNew) {
        router.push(`/personas/${saved.id}`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save persona");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1 pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <Button
          variant="ghost"
          className="mb-1 -ml-2 text-muted-foreground"
          onClick={() => router.push("/personas")}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Personas
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isNew ? "Create Persona" : "Edit Persona"}
        </h1>
        <p className="text-muted-foreground">
          {isNew
            ? "Define a new brand persona for ad generation."
            : `Editing "${persona.name}"`}
        </p>
      </div>

      {/* ── Basic Info ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">Basic Information</h2>
          <p className="text-sm text-muted-foreground">
            Name and description for this persona.
          </p>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Friendly Expert"
              value={persona.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="A brief description of this persona's voice and style..."
              value={persona.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Helps you identify this persona at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={persona.active}
              onCheckedChange={(checked) => updateField("active", checked as boolean)}
            />
            <div>
              <Label className="text-sm font-medium">Active</Label>
              <p className="text-sm text-muted-foreground">
                Only active personas appear in the generation workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── System Prompt ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">System Prompt</h2>
          <p className="text-sm text-muted-foreground">
            The core instructions that define how this persona writes ad copy.
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Textarea
            placeholder="You are a skilled copywriter who..."
            value={persona.systemPrompt}
            onChange={(e) => updateField("systemPrompt", e.target.value)}
            className="min-h-[240px] font-mono text-sm"
            rows={12}
          />
          <p className="text-right text-sm text-muted-foreground">
            {persona.systemPrompt.length.toLocaleString()} characters
          </p>
        </div>
      </div>

      {/* ── Emotional Hooks ── */}
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-muted-foreground" />
              Emotional Hooks
            </h2>
            <p className="text-sm text-muted-foreground">
              Define emotional triggers that resonate with the target audience.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addHook}>
            <Plus className="mr-1.5 size-3.5" />
            Add Hook
          </Button>
        </div>
        <Separator />
        {persona.emotionalHooks.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-muted p-3">
              <Sparkles className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No emotional hooks added yet.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={addHook}>
              <Plus className="mr-1.5 size-3.5" />
              Add Hook
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {persona.emotionalHooks.map((hook, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Hook name (e.g. Fear of Missing Out)"
                      value={hook.name}
                      onChange={(e) => updateHook(i, "name", e.target.value)}
                    />
                    <Textarea
                      placeholder="Description of how to use this hook..."
                      value={hook.description}
                      onChange={(e) =>
                        updateHook(i, "description", e.target.value)
                      }
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeHook(i)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Customer Quotes ── */}
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Quote className="size-4 text-muted-foreground" />
              Customer Quotes
            </h2>
            <p className="text-sm text-muted-foreground">
              Real customer testimonials to weave into ad copy.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addQuote}>
            <Plus className="mr-1.5 size-3.5" />
            Add Quote
          </Button>
        </div>
        <Separator />
        {persona.customerQuotes.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <div className="rounded-full bg-muted p-3">
              <Quote className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No customer quotes added yet.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={addQuote}>
              <Plus className="mr-1.5 size-3.5" />
              Add Quote
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {persona.customerQuotes.map((cq, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Customer quote text..."
                      value={cq.quote}
                      onChange={(e) => updateQuote(i, "quote", e.target.value)}
                      rows={2}
                    />
                    <Input
                      placeholder="Attribution (e.g. Sarah M., verified buyer)"
                      value={cq.attribution}
                      onChange={(e) =>
                        updateQuote(i, "attribution", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeQuote(i)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tone Notes ── */}
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">Tone Notes</h2>
          <p className="text-sm text-muted-foreground">
            Additional notes about writing tone, style, or constraints.
          </p>
        </div>
        <Separator />
        <Textarea
          placeholder="e.g. Keep it conversational, avoid jargon, use short sentences..."
          value={persona.toneNotes}
          onChange={(e) => updateField("toneNotes", e.target.value)}
          rows={4}
        />
      </div>

      {/* ── Bottom save ── */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/personas")}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back
        </Button>
        <Button onClick={save} disabled={saving} className="shadow-sm">
          {saving ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          {isNew ? "Create Persona" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
