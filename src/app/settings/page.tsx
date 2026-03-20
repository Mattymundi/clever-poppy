"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  FlaskConical,
  Loader2,
  Settings2,
  Palette,
  Cpu,
  Info,
  List,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  type: string;
  provider: string;
  apiKey: string;
  modelName: string;
  endpointUrl: string | null;
  active: boolean;
}

interface Color {
  id: string;
  name: string;
  hex: string;
  active: boolean;
}

interface ProviderForm {
  name: string;
  type: string;
  provider: string;
  apiKey: string;
  modelName: string;
  endpointUrl: string;
}

const emptyProviderForm: ProviderForm = {
  name: "",
  type: "copy",
  provider: "anthropic",
  apiKey: "",
  modelName: "",
  endpointUrl: "",
};

// ─── Settings Page ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Providers state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [providerForm, setProviderForm] = useState<ProviderForm>(emptyProviderForm);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [savingProvider, setSavingProvider] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  // Colors state
  const [colors, setColors] = useState<Color[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [savingColor, setSavingColor] = useState(false);

  // Callout facts state
  const [calloutFacts, setCalloutFacts] = useState<{ id: string; text: string; active: boolean }[]>([]);
  const [loadingFacts, setLoadingFacts] = useState(true);
  const [factDialogOpen, setFactDialogOpen] = useState(false);
  const [newFactText, setNewFactText] = useState("");
  const [savingFact, setSavingFact] = useState(false);
  const [sheetSyncDialogOpen, setSheetSyncDialogOpen] = useState(false);
  const [sheetId, setSheetId] = useState("");
  const [sheetRange, setSheetRange] = useState("");
  const [syncingSheet, setSyncingSheet] = useState(false);

  // ── Fetch providers ──────────────────────────────────────────────────────

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/providers");
      if (!res.ok) throw new Error("Failed to fetch providers");
      setProviders(await res.json());
    } catch {
      toast.error("Failed to load providers");
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  // ── Fetch colors ─────────────────────────────────────────────────────────

  const fetchColors = useCallback(async () => {
    try {
      const res = await fetch("/api/colors");
      if (!res.ok) throw new Error("Failed to fetch colors");
      setColors(await res.json());
    } catch {
      toast.error("Failed to load colors");
    } finally {
      setLoadingColors(false);
    }
  }, []);

  // ── Fetch callout facts ─────────────────────────────────────────────────

  const fetchCalloutFacts = useCallback(async () => {
    try {
      const res = await fetch("/api/callout-facts");
      if (!res.ok) throw new Error("Failed to fetch callout facts");
      setCalloutFacts(await res.json());
    } catch {
      toast.error("Failed to load callout facts");
    } finally {
      setLoadingFacts(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
    fetchColors();
    fetchCalloutFacts();
  }, [fetchProviders, fetchColors, fetchCalloutFacts]);

  // ── Provider CRUD ────────────────────────────────────────────────────────

  function openAddProvider() {
    setEditingProviderId(null);
    setProviderForm(emptyProviderForm);
    setProviderDialogOpen(true);
  }

  function openEditProvider(p: Provider) {
    setEditingProviderId(p.id);
    setProviderForm({
      name: p.name,
      type: p.type,
      provider: p.provider,
      apiKey: "",
      modelName: p.modelName,
      endpointUrl: p.endpointUrl ?? "",
    });
    setProviderDialogOpen(true);
  }

  async function saveProvider() {
    if (!providerForm.name || !providerForm.modelName) {
      toast.error("Name and model are required");
      return;
    }
    if (!editingProviderId && !providerForm.apiKey) {
      toast.error("API key is required for new providers");
      return;
    }

    setSavingProvider(true);
    try {
      const body: Record<string, unknown> = {
        name: providerForm.name,
        type: providerForm.type,
        provider: providerForm.provider,
        modelName: providerForm.modelName,
        endpointUrl: providerForm.endpointUrl || null,
      };
      if (providerForm.apiKey) body.apiKey = providerForm.apiKey;

      const url = editingProviderId
        ? `/api/providers/${editingProviderId}`
        : "/api/providers";
      const method = editingProviderId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save provider");
      }

      toast.success(editingProviderId ? "Provider updated" : "Provider created");
      setProviderDialogOpen(false);
      fetchProviders();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save provider");
    } finally {
      setSavingProvider(false);
    }
  }

  async function deleteProvider(id: string) {
    try {
      const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete provider");
      toast.success("Provider deleted");
      fetchProviders();
    } catch {
      toast.error("Failed to delete provider");
    }
  }

  async function testProvider(id: string) {
    setTestingProviderId(id);
    try {
      const res = await fetch("/api/providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Connection successful");
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch {
      toast.error("Failed to test provider");
    } finally {
      setTestingProviderId(null);
    }
  }

  // ── Color CRUD ───────────────────────────────────────────────────────────

  function openAddColor() {
    setColorName("");
    setColorHex("#000000");
    setColorDialogOpen(true);
  }

  async function saveColor() {
    if (!colorName || !colorHex) {
      toast.error("Name and hex are required");
      return;
    }
    setSavingColor(true);
    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: colorName, hex: colorHex }),
      });
      if (!res.ok) throw new Error("Failed to create color");
      toast.success("Color added");
      setColorDialogOpen(false);
      fetchColors();
    } catch {
      toast.error("Failed to add color");
    } finally {
      setSavingColor(false);
    }
  }

  async function toggleColor(color: Color) {
    try {
      const res = await fetch("/api/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: color.id, active: !color.active }),
      });
      if (!res.ok) throw new Error("Failed to update color");
      setColors((prev) =>
        prev.map((c) => (c.id === color.id ? { ...c, active: !c.active } : c))
      );
    } catch {
      toast.error("Failed to update color");
    }
  }

  async function deleteColor(id: string) {
    try {
      const res = await fetch(`/api/colors?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete color");
      toast.success("Color deleted");
      fetchColors();
    } catch {
      toast.error("Failed to delete color");
    }
  }

  // ── Callout Facts CRUD ──────────────────────────────────────────────────

  async function addCalloutFact() {
    if (!newFactText.trim()) {
      toast.error("Fact text is required");
      return;
    }
    setSavingFact(true);
    try {
      const res = await fetch("/api/callout-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newFactText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add fact");
      toast.success("Callout fact added");
      setFactDialogOpen(false);
      setNewFactText("");
      fetchCalloutFacts();
    } catch {
      toast.error("Failed to add callout fact");
    } finally {
      setSavingFact(false);
    }
  }

  async function toggleFact(fact: { id: string; active: boolean }) {
    try {
      const res = await fetch("/api/callout-facts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: fact.id, active: !fact.active }),
      });
      if (!res.ok) throw new Error("Failed to update fact");
      setCalloutFacts((prev) =>
        prev.map((f) => (f.id === fact.id ? { ...f, active: !f.active } : f))
      );
    } catch {
      toast.error("Failed to update callout fact");
    }
  }

  async function deleteFact(id: string) {
    try {
      const res = await fetch(`/api/callout-facts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete fact");
      toast.success("Callout fact deleted");
      fetchCalloutFacts();
    } catch {
      toast.error("Failed to delete callout fact");
    }
  }

  async function syncFromSheet() {
    if (!sheetId.trim()) {
      toast.error("Google Sheet ID is required");
      return;
    }
    setSyncingSheet(true);
    try {
      const res = await fetch("/api/callout-facts/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleSheetId: sheetId.trim(),
          googleSheetRange: sheetRange.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync");
      toast.success(data.message || "Synced successfully");
      setSheetSyncDialogOpen(false);
      fetchCalloutFacts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to sync from sheet");
    } finally {
      setSyncingSheet(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Page header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage AI providers, color palette, and defaults.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* AI Providers Section                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">AI Providers</h2>
          </div>
          <Button className="shadow-sm" onClick={openAddProvider}>
            <Plus className="mr-1.5" />
            Add Provider
          </Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Configure AI providers for copy and image generation.
        </p>

        {loadingProviders ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <div className="rounded-full bg-muted p-3">
              <Cpu className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No providers configured yet.
            </p>
            <Button className="mt-4 shadow-sm" onClick={openAddProvider}>
              <Plus className="mr-1.5" />
              Add Provider
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((p) => (
                  <TableRow key={p.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {p.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.provider}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.modelName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.apiKey}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.active ? "default" : "outline"} className="font-normal">
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => testProvider(p.id)}
                          disabled={testingProviderId === p.id}
                        >
                          {testingProviderId === p.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <FlaskConical />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditProvider(p)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteProvider(p.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Provider Dialog */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProviderId ? "Edit Provider" : "Add Provider"}
            </DialogTitle>
            <DialogDescription>
              {editingProviderId
                ? "Update the provider configuration. Leave API key blank to keep existing."
                : "Configure a new AI provider for generation."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="prov-name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="prov-name"
                placeholder="e.g. Claude Sonnet"
                value={providerForm.name}
                onChange={(e) =>
                  setProviderForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={providerForm.type}
                  onValueChange={(val) =>
                    setProviderForm((f) => ({ ...f, type: val as string }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copy">Copy</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-sm font-medium">Provider</Label>
                <Select
                  value={providerForm.provider}
                  onValueChange={(val) =>
                    setProviderForm((f) => ({ ...f, provider: val as string }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prov-key" className="text-sm font-medium">
                API Key{editingProviderId && " (leave blank to keep existing)"}
              </Label>
              <Input
                id="prov-key"
                type="password"
                placeholder={editingProviderId ? "••••••••" : "sk-..."}
                value={providerForm.apiKey}
                onChange={(e) =>
                  setProviderForm((f) => ({ ...f, apiKey: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prov-model" className="text-sm font-medium">
                Model Name
              </Label>
              <Input
                id="prov-model"
                placeholder="e.g. claude-sonnet-4-20250514"
                value={providerForm.modelName}
                onChange={(e) =>
                  setProviderForm((f) => ({ ...f, modelName: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prov-endpoint" className="text-sm font-medium">
                Endpoint URL (optional)
              </Label>
              <Input
                id="prov-endpoint"
                placeholder="https://api.openai.com/v1"
                value={providerForm.endpointUrl}
                onChange={(e) =>
                  setProviderForm((f) => ({ ...f, endpointUrl: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button className="shadow-sm" onClick={saveProvider} disabled={savingProvider}>
              {savingProvider && <Loader2 className="mr-1.5 animate-spin" />}
              {editingProviderId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Color Palette Section                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Color Palette</h2>
          </div>
          <Button className="shadow-sm" onClick={openAddColor}>
            <Plus className="mr-1.5" />
            Add Color
          </Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Manage brand colors used in ad generation. Click a swatch to toggle active/inactive.
        </p>

        {loadingColors ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-24 rounded-xl" />
            ))}
          </div>
        ) : colors.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <div className="rounded-full bg-muted p-3">
              <Palette className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No colors added yet.
            </p>
            <Button className="mt-4 shadow-sm" onClick={openAddColor}>
              <Plus className="mr-1.5" />
              Add Color
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <div key={c.id} className="group relative">
                <button
                  onClick={() => toggleColor(c)}
                  className={`relative flex h-24 w-24 flex-col items-center justify-center rounded-xl transition-all ${
                    c.active
                      ? "shadow-sm ring-1 ring-border"
                      : "opacity-40 ring-1 ring-dashed ring-border"
                  }`}
                  title={`${c.name} (${c.hex}) - Click to ${c.active ? "deactivate" : "activate"}`}
                >
                  <div
                    className="size-11 rounded-lg shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="mt-1.5 text-[10px] font-medium leading-tight truncate max-w-[80px]">
                    {c.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {c.hex}
                  </span>
                </button>
                <button
                  onClick={() => deleteColor(c.id)}
                  className="absolute -top-1.5 -right-1.5 hidden size-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Color Dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add Color</DialogTitle>
            <DialogDescription>
              Add a new color to the brand palette.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="color-name" className="text-sm font-medium">
                Color Name
              </Label>
              <Input
                id="color-name"
                placeholder="e.g. Brand Red"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color-hex" className="text-sm font-medium">
                Hex Value
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-input"
                />
                <Input
                  id="color-hex"
                  placeholder="#FF0000"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <div
                className="size-10 rounded-xl shadow-sm"
                style={{ backgroundColor: colorHex }}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button className="shadow-sm" onClick={saveColor} disabled={savingColor}>
              {savingColor && <Loader2 className="mr-1.5 animate-spin" />}
              Add Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Callout Facts Section                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Key Callout Facts</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSheetSyncDialogOpen(true)}>
              <RefreshCw className="mr-1.5" />
              Sync from Sheet
            </Button>
            <Button className="shadow-sm" onClick={() => setFactDialogOpen(true)}>
              <Plus className="mr-1.5" />
              Add Fact
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Short copy snippets used in ad callouts, badges, arrows, and checklists.
        </p>

        {loadingFacts ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : calloutFacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
            <div className="rounded-full bg-muted p-3">
              <List className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No callout facts added yet.
            </p>
            <Button
              className="mt-4 shadow-sm"
              onClick={() => setFactDialogOpen(true)}
            >
              <Plus className="mr-1.5" />
              Add Fact
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {calloutFacts.map((fact) => (
              <div
                key={fact.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-muted/30 ${
                  fact.active ? "" : "opacity-50"
                }`}
              >
                <button
                  onClick={() => toggleFact(fact)}
                  className="flex flex-1 items-center gap-3 text-left"
                  title={`Click to ${fact.active ? "deactivate" : "activate"}`}
                >
                  <Switch checked={fact.active} tabIndex={-1} />
                  <span className={fact.active ? "" : "line-through"}>
                    {fact.text}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-2 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteFact(fact.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Fact Dialog */}
      <Dialog open={factDialogOpen} onOpenChange={setFactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Callout Fact</DialogTitle>
            <DialogDescription>
              Add a short copy snippet for use in ad callouts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="fact-text" className="text-sm font-medium">
                Fact Text
              </Label>
              <Input
                id="fact-text"
                placeholder='e.g. "Everything you need in ONE box"'
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button className="shadow-sm" onClick={addCalloutFact} disabled={savingFact}>
              {savingFact && <Loader2 className="mr-1.5 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet Sync Dialog */}
      <Dialog open={sheetSyncDialogOpen} onOpenChange={setSheetSyncDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sync from Google Sheet</DialogTitle>
            <DialogDescription>
              Import callout facts from a Google Sheet. This will replace all existing facts.
              The sheet should have one fact per row in the first column.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sheet-id" className="text-sm font-medium">
                Google Sheet ID
              </Label>
              <Input
                id="sheet-id"
                placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuV"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The ID from your sheet URL: docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sheet-range" className="text-sm font-medium">
                Range (optional)
              </Label>
              <Input
                id="sheet-range"
                placeholder="e.g. Sheet1!A:A"
                value={sheetRange}
                onChange={(e) => setSheetRange(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button className="shadow-sm" onClick={syncFromSheet} disabled={syncingSheet}>
              {syncingSheet && <Loader2 className="mr-1.5 animate-spin" />}
              Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Default Settings Section                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="space-y-4 pb-8">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Default Settings</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Configure default generation settings and integrations.
        </p>

        <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Google Drive / Sheets Integration</p>
            <p className="mt-1 text-sm text-muted-foreground">
              OAuth integration for Google Drive and Google Sheets is coming
              soon. This will allow automatic export of generated ads and
              syncing of image libraries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
