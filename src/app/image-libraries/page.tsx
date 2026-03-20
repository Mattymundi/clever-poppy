"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Database,
  FileSpreadsheet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImageLibrary {
  id: string;
  name: string;
  sourceType: string;
  googleSheetId: string | null;
  googleSheetRange: string | null;
  images: { url: string; kitName?: string; active?: boolean }[];
  active: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
}

// ─── Image Libraries List Page ──────────────────────────────────────────────

export default function ImageLibrariesPage() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<ImageLibrary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibraries = useCallback(async () => {
    try {
      const res = await fetch("/api/image-libraries");
      if (!res.ok) throw new Error("Failed to fetch image libraries");
      setLibraries(await res.json());
    } catch {
      toast.error("Failed to load image libraries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  async function toggleActive(library: ImageLibrary) {
    try {
      const res = await fetch(`/api/image-libraries/${library.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !library.active }),
      });
      if (!res.ok) throw new Error("Failed to update library");
      setLibraries((prev) =>
        prev.map((l) =>
          l.id === library.id ? { ...l, active: !l.active } : l
        )
      );
    } catch {
      toast.error("Failed to update library");
    }
  }

  async function deleteLibrary(id: string) {
    try {
      const res = await fetch(`/api/image-libraries/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete library");
      toast.success("Library deleted");
      setLibraries((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error("Failed to delete library");
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1 pt-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 pt-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Image Libraries
          </h1>
          <p className="text-muted-foreground">
            Manage image collections for ad generation.
          </p>
        </div>
        <Button
          className="shadow-sm"
          onClick={() => router.push("/image-libraries/new")}
        >
          <Plus className="mr-1.5" />
          Create Library
        </Button>
      </div>

      {/* Grid */}
      {libraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="rounded-full bg-muted p-3">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium">No image libraries yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first image library to start using images in ads.
          </p>
          <Button
            className="mt-5 shadow-sm"
            onClick={() => router.push("/image-libraries/new")}
          >
            <Plus className="mr-1.5" />
            Create Library
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <div
              key={library.id}
              className="group rounded-xl border bg-card p-5 transition-colors hover:bg-muted/30"
            >
              {/* Top row: name + badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-sm font-medium">
                  {library.name}
                </h3>
                <Badge variant="secondary" className="shrink-0 font-normal">
                  {library.sourceType === "google_sheet" ? (
                    <>
                      <FileSpreadsheet className="mr-1 size-3" />
                      Sheet
                    </>
                  ) : (
                    <>
                      <Database className="mr-1 size-3" />
                      Manual
                    </>
                  )}
                </Badge>
              </div>

              {/* Image count */}
              <p className="mt-1 text-sm text-muted-foreground">
                {library.images.length} image
                {library.images.length !== 1 ? "s" : ""}
              </p>

              {/* Thumbnail strip */}
              {library.images.length > 0 && (
                <div className="mt-3 flex gap-1.5 overflow-hidden">
                  {library.images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.kitName || `Image ${i + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                  {library.images.length > 4 && (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      +{library.images.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Sync info */}
              <p className="mt-3 text-xs text-muted-foreground">
                {library.lastSyncedAt
                  ? `Last synced ${new Date(library.lastSyncedAt).toLocaleDateString()}`
                  : "Never synced"}
              </p>

              {/* Footer: toggle + actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={library.active}
                    onCheckedChange={() => toggleActive(library)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {library.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      router.push(`/image-libraries/${library.id}`)
                    }
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteLibrary(library.id)}
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
