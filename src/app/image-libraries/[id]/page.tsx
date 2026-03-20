"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LibraryImage {
  url: string;
  kitName?: string;
  active?: boolean;
}

interface LibraryData {
  id?: string;
  name: string;
  sourceType: "manual" | "google_sheet";
  googleSheetId: string;
  googleSheetRange: string;
  images: LibraryImage[];
  active: boolean;
}

const emptyLibrary: LibraryData = {
  name: "",
  sourceType: "manual",
  googleSheetId: "",
  googleSheetRange: "",
  images: [],
  active: true,
};

// ─── Image Library Edit Page ────────────────────────────────────────────────

export default function ImageLibraryEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [library, setLibrary] = useState<LibraryData>(emptyLibrary);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const fetchLibrary = useCallback(async () => {
    try {
      const res = await fetch(`/api/image-libraries/${id}`);
      if (!res.ok) throw new Error("Failed to fetch library");
      const data = await res.json();
      setLibrary({
        id: data.id,
        name: data.name,
        sourceType: data.sourceType ?? "manual",
        googleSheetId: data.googleSheetId ?? "",
        googleSheetRange: data.googleSheetRange ?? "",
        images: data.images ?? [],
        active: data.active,
      });
    } catch {
      toast.error("Failed to load image library");
      router.push("/image-libraries");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!isNew) fetchLibrary();
  }, [isNew, fetchLibrary]);

  function updateField<K extends keyof LibraryData>(
    field: K,
    value: LibraryData[K]
  ) {
    setLibrary((prev) => ({ ...prev, [field]: value }));
  }

  // ── Image management ───────────────────────────────────────────────────

  function addImages() {
    const text = newImageUrl.trim();
    if (!text) return;

    // Support pasting multiple URLs (one per line or comma-separated)
    const urls = text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const newImages: LibraryImage[] = urls.map((url) => ({
      url,
      active: true,
    }));

    updateField("images", [...library.images, ...newImages]);
    setNewImageUrl("");
    toast.success(`Added ${newImages.length} image${newImages.length !== 1 ? "s" : ""}`);
  }

  function removeImage(index: number) {
    updateField(
      "images",
      library.images.filter((_, i) => i !== index)
    );
  }

  function toggleImageActive(index: number) {
    const images = [...library.images];
    images[index] = { ...images[index], active: !images[index].active };
    updateField("images", images);
  }

  // ── Sync from Sheet ────────────────────────────────────────────────────

  async function syncFromSheet() {
    if (!library.id) {
      toast.error("Save the library first before syncing");
      return;
    }
    if (!library.googleSheetId.trim()) {
      toast.error("Please enter a Google Sheet ID first");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch(`/api/image-libraries/${library.id}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync");

      // Update local state with synced images
      setLibrary((prev) => ({
        ...prev,
        images: data.images ?? [],
      }));

      toast.success(`Synced ${data.syncedCount} images from Google Sheet`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to sync from sheet");
    } finally {
      setSyncing(false);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function save() {
    if (!library.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: library.name,
        sourceType: library.sourceType,
        googleSheetId: library.googleSheetId || null,
        googleSheetRange: library.googleSheetRange || null,
        images: library.images,
        active: library.active,
      };

      const url = isNew
        ? "/api/image-libraries"
        : `/api/image-libraries/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save library");
      }

      const saved = await res.json();
      toast.success(isNew ? "Library created" : "Library updated");

      if (isNew) {
        router.push(`/image-libraries/${saved.id}`);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save library");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/image-libraries")}
          >
            <ArrowLeft />
          </Button>
          <div className="space-y-1 pt-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {isNew ? "Create Image Library" : "Edit Image Library"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Set up a new image collection."
                : `Editing "${library.name}"`}
            </p>
          </div>
        </div>
        <Button className="shadow-sm" onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* ── Basic Info ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Basic Information</h2>
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Product Lifestyle Photos"
              value={library.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={library.active}
              onCheckedChange={(checked) =>
                updateField("active", checked as boolean)
              }
            />
            <Label className="text-sm font-medium">Active</Label>
          </div>
        </div>
      </section>

      {/* ── Source ──────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Source</h2>
          <p className="text-sm text-muted-foreground">
            Choose how images are added to this library.
          </p>
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="sourceType"
                value="manual"
                checked={library.sourceType === "manual"}
                onChange={() => updateField("sourceType", "manual")}
                className="accent-primary"
              />
              <span className="text-sm font-medium">Manual</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="sourceType"
                value="google_sheet"
                checked={library.sourceType === "google_sheet"}
                onChange={() => updateField("sourceType", "google_sheet")}
                className="accent-primary"
              />
              <span className="text-sm font-medium">Google Sheet</span>
            </label>
          </div>

          {library.sourceType === "google_sheet" && (
            <div className="space-y-4 rounded-lg bg-muted/40 p-4">
              <div className="space-y-2">
                <Label htmlFor="sheetId" className="text-sm font-medium">
                  Google Sheet ID
                </Label>
                <Input
                  id="sheetId"
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                  value={library.googleSheetId}
                  onChange={(e) =>
                    updateField("googleSheetId", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetRange" className="text-sm font-medium">
                  Sheet Range
                </Label>
                <Input
                  id="sheetRange"
                  placeholder="e.g. Sheet1!A:C"
                  value={library.googleSheetRange}
                  onChange={(e) =>
                    updateField("googleSheetRange", e.target.value)
                  }
                />
              </div>
              <Button
                variant="outline"
                onClick={syncFromSheet}
                disabled={syncing || isNew}
                className="w-fit"
              >
                {syncing ? (
                  <Loader2 className="mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5" />
                )}
                Sync from Sheet
              </Button>
              {isNew && (
                <p className="text-xs text-muted-foreground">
                  Save the library first to enable syncing.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Images ─────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <ImageIcon className="size-4" />
            Images
          </h2>
          <p className="text-sm text-muted-foreground">
            {library.images.length} image
            {library.images.length !== 1 ? "s" : ""} in this library.
          </p>
        </div>

        {/* Add Image URL */}
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL(s) - one per line or comma-separated"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addImages();
              }
            }}
            className="flex-1"
          />
          <Button variant="outline" onClick={addImages}>
            <Plus className="mr-1.5" />
            Add
          </Button>
        </div>

        {/* Image grid */}
        {library.images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No images added yet. Paste URLs above to add images.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {library.images.map((img, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl border bg-card transition-colors hover:bg-muted/30"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.kitName || `Image ${i + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="size-8 text-muted-foreground/20" />
                  </div>
                </div>

                {/* Info + controls */}
                <div className="p-3">
                  {/* Kit name */}
                  {img.kitName && (
                    <p className="truncate text-xs font-medium">
                      {img.kitName}
                    </p>
                  )}
                  {/* URL (truncated) */}
                  <p className="truncate text-xs text-muted-foreground">
                    {img.url}
                  </p>

                  {/* Controls */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={img.active !== false}
                        onCheckedChange={() => toggleImageActive(i)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {img.active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeImage(i)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <Button className="shadow-sm" onClick={save} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-1.5 animate-spin" />
          ) : (
            <Save className="mr-1.5" />
          )}
          {isNew ? "Create Library" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
