"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Search,
  Quote,
  ArrowLeftRight,
  ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdType {
  id: string;
  name: string;
  category: string;
  description: string;
  imagePromptTemplate: string | null;
  exampleDescription: string | null;
  requiresQuote: boolean;
  requiresBeforeAfter: boolean;
  requiresComparison: boolean;
  active: boolean;
  typeNumber: number | null;
  sortOrder: number;
}

const CATEGORIES = [
  "All",
  "Product-first",
  "Benefit-first",
  "Offer-first",
  "Proof-first",
  "Comparison-first",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "Product-first": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "Benefit-first": "bg-green-500/15 text-green-700 dark:text-green-400",
  "Offer-first": "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  "Proof-first": "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  "Comparison-first": "bg-red-500/15 text-red-700 dark:text-red-400",
};

// ─── Ad Types List Page ─────────────────────────────────────────────────────

export default function AdTypesPage() {
  const router = useRouter();
  const [adTypes, setAdTypes] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const fetchAdTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/ad-types");
      if (!res.ok) throw new Error("Failed to fetch ad types");
      setAdTypes(await res.json());
    } catch {
      toast.error("Failed to load ad types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdTypes();
  }, [fetchAdTypes]);

  const filtered = useMemo(() => {
    let list = adTypes;
    if (categoryFilter !== "All") {
      list = list.filter((t) => t.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [adTypes, categoryFilter, search]);

  const activeCount = adTypes.filter((t) => t.active).length;

  // ── Toggle active ──────────────────────────────────────────────────────

  async function toggleActive(adType: AdType) {
    try {
      const res = await fetch(`/api/ad-types/${adType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !adType.active }),
      });
      if (!res.ok) throw new Error("Failed to update ad type");
      setAdTypes((prev) =>
        prev.map((t) =>
          t.id === adType.id ? { ...t, active: !t.active } : t
        )
      );
    } catch {
      toast.error("Failed to update ad type");
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────

  async function deleteAdType(id: string) {
    try {
      const res = await fetch(`/api/ad-types/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete ad type");
      toast.success("Ad type deleted");
      setAdTypes((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete ad type");
    }
  }

  // ── Bulk actions ───────────────────────────────────────────────────────

  async function bulkSetActive(active: boolean) {
    const ids = adTypes.map((t) => t.id);
    if (ids.length === 0) return;
    try {
      const res = await fetch("/api/ad-types/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, active }),
      });
      if (!res.ok) throw new Error("Failed to bulk update");
      setAdTypes((prev) => prev.map((t) => ({ ...t, active })));
      toast.success(active ? "All ad types selected" : "All ad types deselected");
    } catch {
      toast.error("Failed to bulk update ad types");
    }
  }

  // ── Reorder ──────────────────────────────────────────────────────────

  async function moveAdType(id: string, direction: "up" | "down") {
    const index = adTypes.findIndex((t) => t.id === id);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= adTypes.length) return;

    const reordered = [...adTypes];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setAdTypes(reordered);

    try {
      const res = await fetch("/api/ad-types/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
    } catch {
      toast.error("Failed to reorder ad types");
      setAdTypes(adTypes); // revert
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pt-2">
        <div className="space-y-1">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Ad Types</h1>
          <p className="text-muted-foreground">
            {activeCount} of {adTypes.length} ad types active
          </p>
        </div>
        <Button onClick={() => router.push("/ad-types/new")}>
          <Plus className="mr-1.5" />
          Create Ad Type
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ad types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      {/* Filter pills + bulk actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? "default" : "secondary"}
              size="sm"
              className="rounded-full"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => bulkSetActive(true)}>
            Select all
          </Button>
          <span className="text-muted-foreground text-xs">|</span>
          <Button variant="ghost" size="sm" onClick={() => bulkSetActive(false)}>
            Deselect all
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <LayoutGrid className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium">No ad types found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {adTypes.length === 0
              ? "Create your first ad type to get started."
              : "Try adjusting your filters."}
          </p>
          {adTypes.length === 0 && (
            <Button
              className="mt-5"
              onClick={() => router.push("/ad-types/new")}
            >
              <Plus className="mr-1.5" />
              Create Ad Type
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((adType) => (
            <div
              key={adType.id}
              className="group rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-muted/30"
            >
              {/* Top row: name + category */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {adType.typeNumber != null && (
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground/70">
                      #{adType.typeNumber}
                    </span>
                  )}
                  <h3 className="truncate text-sm font-medium leading-snug">
                    {adType.name}
                  </h3>
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 font-normal text-xs ${
                    CATEGORY_COLORS[adType.category] ?? ""
                  }`}
                >
                  {adType.category}
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                {adType.description || "No description"}
              </p>

              {/* Requirement badges */}
              {(adType.requiresQuote ||
                adType.requiresBeforeAfter ||
                adType.requiresComparison) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {adType.requiresQuote && (
                    <Badge variant="secondary" className="font-normal text-xs">
                      <Quote className="mr-1 size-3" />
                      Quote
                    </Badge>
                  )}
                  {adType.requiresBeforeAfter && (
                    <Badge variant="secondary" className="font-normal text-xs">
                      <ImageIcon className="mr-1 size-3" />
                      Before/After
                    </Badge>
                  )}
                  {adType.requiresComparison && (
                    <Badge variant="secondary" className="font-normal text-xs">
                      <ArrowLeftRight className="mr-1 size-3" />
                      Comparison
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer: toggle + actions */}
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={adType.active}
                    onCheckedChange={() => toggleActive(adType)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {adType.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveAdType(adType.id, "up")}
                    disabled={adTypes.indexOf(adType) === 0}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => moveAdType(adType.id, "down")}
                    disabled={adTypes.indexOf(adType) === adTypes.length - 1}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => router.push(`/ad-types/${adType.id}`)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteAdType(adType.id)}
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
