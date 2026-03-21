"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdTypeData {
  id?: string;
  name: string;
  category: string;
  description: string;
  imagePromptTemplate: string;
  exampleDescription: string;
  active: boolean;
}

const CATEGORIES = [
  "Product-first",
  "Benefit-first",
  "Offer-first",
  "Proof-first",
  "Comparison-first",
];

const emptyAdType: AdTypeData = {
  name: "",
  category: "Product-first",
  description: "",
  imagePromptTemplate: "",
  exampleDescription: "",
  active: true,
};

// ─── Ad Type Edit Page ──────────────────────────────────────────────────────

export default function AdTypeEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [adType, setAdType] = useState<AdTypeData>(emptyAdType);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const fetchAdType = useCallback(async () => {
    try {
      const res = await fetch(`/api/ad-types/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ad type");
      const data = await res.json();
      setAdType({
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description ?? "",
        imagePromptTemplate: data.imagePromptTemplate ?? "",
        exampleDescription: data.exampleDescription ?? "",
        active: data.active,
      });
    } catch {
      toast.error("Failed to load ad type");
      router.push("/ad-types");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isNew) fetchAdType();
  }, [isNew, fetchAdType]);

  function updateField<K extends keyof AdTypeData>(
    field: K,
    value: AdTypeData[K]
  ) {
    setAdType((prev) => ({ ...prev, [field]: value }));
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function save() {
    if (!adType.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!adType.category) {
      toast.error("Category is required");
      return;
    }
    if (!adType.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: adType.name,
        category: adType.category,
        description: adType.description,
        imagePromptTemplate: adType.imagePromptTemplate || null,
        exampleDescription: adType.exampleDescription || null,
        active: adType.active,
      };

      const url = isNew ? "/api/ad-types" : `/api/ad-types/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save ad type");
      }

      const saved = await res.json();
      toast.success(isNew ? "Ad type created" : "Ad type updated");

      if (isNew) {
        router.push(`/ad-types/${saved.id}`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save ad type");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5"
            onClick={() => router.push("/ad-types")}
          >
            <ArrowLeft />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {isNew ? "Create Ad Type" : "Edit Ad Type"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Define a new ad type for generation."
                : `Editing "${adType.name}"`}
            </p>
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Basic Information */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold">Basic Information</h2>
          <p className="text-sm text-muted-foreground">
            Name, category, and description for this ad type.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Hero Product Shot"
              value={adType.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={adType.category}
                onValueChange={(val) => updateField("category", val as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex h-9 items-center gap-2.5 rounded-lg border border-border/50 bg-background px-3">
                <Switch
                  checked={adType.active}
                  onCheckedChange={(checked) =>
                    updateField("active", checked as boolean)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {adType.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this ad type is used for..."
              value={adType.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />
            <p className="text-right text-xs text-muted-foreground">
              {adType.description.length.toLocaleString()} characters
            </p>
          </div>
        </div>
      </section>

      <hr className="border-border/40" />

      {/* Image Prompt Template */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold">Image Prompt Template</h2>
          <p className="text-sm text-muted-foreground">
            The template used to generate image prompts. Use {"{{variables}}"} for
            dynamic content.
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="A professional product photograph of {{product}}..."
            value={adType.imagePromptTemplate}
            onChange={(e) => updateField("imagePromptTemplate", e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            rows={10}
          />
          <p className="text-right text-xs text-muted-foreground">
            {adType.imagePromptTemplate.length.toLocaleString()} characters
          </p>
        </div>
      </section>

      <hr className="border-border/40" />

      {/* Example Description */}
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-semibold">Example Description</h2>
          <p className="text-sm text-muted-foreground">
            An example of what the generated ad description looks like.
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Example ad description..."
            value={adType.exampleDescription}
            onChange={(e) => updateField("exampleDescription", e.target.value)}
            rows={4}
          />
          <p className="text-right text-xs text-muted-foreground">
            {adType.exampleDescription.length.toLocaleString()} characters
          </p>
        </div>
      </section>

      {/* Bottom save */}
      <div className="flex justify-end border-t border-border/40 pt-6 pb-8">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          {isNew ? "Create Ad Type" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
