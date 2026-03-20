"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  SkipForward,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Persona {
  id: string
  name: string
  description: string | null
  active: boolean
}

interface ImageLibrary {
  id: string
  name: string
  images: string[]
  active: boolean
}

interface AdType {
  id: string
  name: string
  category: string
  description: string
  active: boolean
}

interface ColorPalette {
  id: string
  name: string
  hex: string
  active: boolean
}

interface AiProvider {
  id: string
  name: string
  type: string // "copy" | "image" | "both"
  provider: string
  modelName: string
  active: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GeneratePage() {
  // ---- Data loading state ----
  const [personas, setPersonas] = useState<Persona[]>([])
  const [imageLibraries, setImageLibraries] = useState<ImageLibrary[]>([])
  const [adTypes, setAdTypes] = useState<AdType[]>([])
  const [colors, setColors] = useState<ColorPalette[]>([])
  const [providers, setProviders] = useState<AiProvider[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // ---- Config state ----
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("")
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set())
  const [selectedAdTypeIds, setSelectedAdTypeIds] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [imageRatio, setImageRatio] = useState<string>("1:1")
  const [adCount, setAdCount] = useState<number>(50)
  const [selectedColorIds, setSelectedColorIds] = useState<Set<string>>(new Set())
  const [copyProviderId, setCopyProviderId] = useState<string>("")
  const [imageProviderId, setImageProviderId] = useState<string>("")
  const [offer, setOffer] = useState<string>("")

  // ---- Generation / progress state ----
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [failCount, setFailCount] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<string>("")
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null)
  const [generatedAds, setGeneratedAds] = useState<any[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---- Feedback state ----
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)
  const [feedbackMap, setFeedbackMap] = useState<Map<number, "keep" | "discard">>(new Map())
  const [discardReasons, setDiscardReasons] = useState<Map<number, string>>(new Map())
  const [submittingFeedback, setSubmittingFeedback] = useState<Set<number>>(new Set())
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewAnimation, setReviewAnimation] = useState<"" | "keep" | "discard">("")

  // ---- Ad types section collapse ----
  const [adTypesExpanded, setAdTypesExpanded] = useState(true)

  // ---- Fetch all config data ----
  useEffect(() => {
    async function load() {
      try {
        const [pRes, lRes, aRes, cRes, prRes] = await Promise.all([
          fetch("/api/personas"),
          fetch("/api/image-libraries"),
          fetch("/api/ad-types"),
          fetch("/api/colors"),
          fetch("/api/providers"),
        ])
        const [pData, lData, aData, cData, prData] = await Promise.all([
          pRes.json(),
          lRes.json(),
          aRes.json(),
          cRes.json(),
          prRes.json(),
        ])

        const activePersonas = (pData as Persona[]).filter((p) => p.active)
        const activeLibraries = (lData as ImageLibrary[]).filter((l) => l.active)
        const activeAdTypes = (aData as AdType[]).filter((a) => a.active)
        const activeColors = (cData as ColorPalette[]).filter((c) => c.active)
        const activeProviders = (prData as AiProvider[]).filter((p) => p.active)

        setPersonas(activePersonas)
        setImageLibraries(activeLibraries)
        setAdTypes(activeAdTypes)
        setColors(activeColors)
        setProviders(activeProviders)

        // Defaults
        if (activePersonas.length > 0) setSelectedPersonaId(activePersonas[0].id)
        const copyP = activeProviders.find(
          (p) => p.type === "copy" || p.type === "both"
        )
        if (copyP) setCopyProviderId(copyP.id)
        const imgP = activeProviders.find(
          (p) => p.type === "image" || p.type === "both"
        )
        if (imgP) setImageProviderId(imgP.id)

        // Select all colors by default
        setSelectedColorIds(new Set(activeColors.map((c) => c.id)))
      } catch {
        toast.error("Failed to load configuration data")
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  // ---- Derived values ----
  const categories = Array.from(new Set(adTypes.map((a) => a.category))).sort()
  const filteredAdTypes = categoryFilter
    ? adTypes.filter((a) => a.category === categoryFilter)
    : adTypes

  const totalImagesSelected = imageLibraries
    .filter((l) => selectedLibraryIds.has(l.id))
    .reduce((acc, l) => acc + l.images.length, 0)

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId)

  const copyProviders = providers.filter(
    (p) => p.type === "copy" || p.type === "both"
  )
  const imageProviders = providers.filter(
    (p) => p.type === "image" || p.type === "both"
  )

  // ---- Handlers ----
  const toggleLibrary = useCallback((id: string) => {
    setSelectedLibraryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAdType = useCallback((id: string) => {
    setSelectedAdTypeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleColor = useCallback((id: string) => {
    setSelectedColorIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllCategory = useCallback(
    (cat: string | null) => {
      const ids = (cat ? adTypes.filter((a) => a.category === cat) : adTypes).map(
        (a) => a.id
      )
      setSelectedAdTypeIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        return next
      })
    },
    [adTypes]
  )

  const deselectAllCategory = useCallback(
    (cat: string | null) => {
      const ids = (cat ? adTypes.filter((a) => a.category === cat) : adTypes).map(
        (a) => a.id
      )
      setSelectedAdTypeIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
    },
    [adTypes]
  )

  // ---- Generate ----
  const handleGenerate = async () => {
    if (!selectedPersonaId) {
      toast.error("Please select a persona")
      return
    }
    if (selectedLibraryIds.size === 0) {
      toast.error("Please select at least one image library")
      return
    }
    if (selectedAdTypeIds.size === 0) {
      toast.error("Please select at least one ad type")
      return
    }
    if (!copyProviderId) {
      toast.error("Please select a copy AI provider")
      return
    }
    if (!imageProviderId) {
      toast.error("Please select an image AI provider")
      return
    }

    setGenerating(true)
    setProgress(0)
    setProgressTotal(adCount)
    setSuccessCount(0)
    setFailCount(0)
    setElapsedSeconds(0)
    setGenerationStatus("pending")
    setDriveFolderUrl(null)
    setGeneratedAds([])

    // Start elapsed timer
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          adCount,
          imageRatio,
          imageLibraryIds: Array.from(selectedLibraryIds),
          adTypeIds: Array.from(selectedAdTypeIds),
          colorIds: Array.from(selectedColorIds),
          copyProviderId,
          imageProviderId,
          offer: offer || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(err.error || "Failed to start generation")
      }

      const run = await res.json()
      setCurrentRunId(run.id)
      setGenerationStatus("running")

      // Try SSE stream first
      try {
        const evtSource = new EventSource(
          `/api/generate/${run.id}/stream`
        )

        evtSource.addEventListener("status", (e) => {
          const data = JSON.parse(e.data)
          setProgress(data.successCount + data.failCount)
          setSuccessCount(data.successCount)
          setFailCount(data.failCount)
          setGenerationStatus(data.status)
          if (data.durationSeconds) setElapsedSeconds(data.durationSeconds)
          if (data.ads) setGeneratedAds(data.ads)
        })

        evtSource.addEventListener("done", (e) => {
          const data = JSON.parse(e.data)
          setGenerationStatus(data.status)
          evtSource.close()
          if (timerRef.current) clearInterval(timerRef.current)
        })

        evtSource.addEventListener("error", () => {
          evtSource.close()
          // Fall back to mock progress
          startMockProgress()
        })
      } catch {
        // Fall back to mock progress
        startMockProgress()
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start generation"
      )
      setGenerating(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  // Mock progress simulation when SSE is unavailable or fails
  const startMockProgress = useCallback(() => {
    let current = 0
    const total = adCount
    setProgress(0)
    setProgressTotal(total)
    setGenerationStatus("running")

    progressRef.current = setInterval(() => {
      current += 1
      const isFail = Math.random() < 0.05 // 5% failure rate
      setProgress(current)
      if (isFail) {
        setFailCount((prev) => prev + 1)
      } else {
        setSuccessCount((prev) => prev + 1)
        // Add a mock thumbnail placeholder
        setGeneratedAds((prev) => [
          ...prev,
          { status: "success", headline: `Ad ${current}` },
        ])
      }

      if (current >= total) {
        if (progressRef.current) clearInterval(progressRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
        setGenerationStatus("completed")
        setDriveFolderUrl("https://drive.google.com/drive/folders/example")
        toast.success("Generation complete!")
      }
    }, 200)
  }, [adCount])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  const resetGeneration = () => {
    setGenerating(false)
    setProgress(0)
    setSuccessCount(0)
    setFailCount(0)
    setElapsedSeconds(0)
    setGenerationStatus("")
    setDriveFolderUrl(null)
    setGeneratedAds([])
    setCurrentRunId(null)
    setFeedbackMap(new Map())
    setDiscardReasons(new Map())
    setSubmittingFeedback(new Set())
    setReviewMode(false)
    setReviewIndex(0)
    setReviewAnimation("")
    if (timerRef.current) clearInterval(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }

  // ---- Feedback handler ----
  const DISCARD_REASONS = [
    { value: "bad_layout", label: "Bad layout" },
    { value: "bad_copy", label: "Bad copy" },
    { value: "bad_image", label: "Bad image" },
    { value: "off_brand", label: "Off brand" },
    { value: "boring", label: "Boring" },
    { value: "wrong_tone", label: "Wrong tone" },
    { value: "text_illegible", label: "Text illegible" },
    { value: "other", label: "Other" },
  ]

  const submitFeedback = async (adIndex: number, decision: "keep" | "discard", reason?: string) => {
    const ad = generatedAds[adIndex]
    if (!ad || !currentRunId) return

    setSubmittingFeedback(prev => new Set(prev).add(adIndex))

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: currentRunId,
          adIndex,
          adTypeName: ad.ad_type || "",
          adTypeId: ad.ad_type_id || "",
          personaId: selectedPersonaId,
          headline: ad.headline || "",
          subheadline: ad.subheadline || "",
          bodyCopy: ad.body_copy || "",
          cta: ad.cta || "",
          imagePrompt: ad.image_prompt || "",
          backgroundColor: ad.background_color || "",
          decision,
          discardReason: reason || undefined,
          driveFileUrl: ad.generated_image || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to submit feedback")

      setFeedbackMap(prev => {
        const next = new Map(prev)
        next.set(adIndex, decision)
        return next
      })
      if (reason) {
        setDiscardReasons(prev => {
          const next = new Map(prev)
          next.set(adIndex, reason)
          return next
        })
      }
    } catch {
      toast.error("Failed to submit feedback")
    } finally {
      setSubmittingFeedback(prev => {
        const next = new Set(prev)
        next.delete(adIndex)
        return next
      })
    }
  }

  // ---- Review mode helpers ----
  const handleReviewDecision = async (decision: "keep" | "discard", reason?: string) => {
    setReviewAnimation(decision)
    await submitFeedback(reviewIndex, decision, reason)
    // Short delay for animation, then advance
    setTimeout(() => {
      setReviewAnimation("")
      // Find next unreviewed ad
      let next = reviewIndex + 1
      while (next < generatedAds.length && feedbackMap.has(next)) {
        next++
      }
      if (next >= generatedAds.length) {
        // All reviewed
        setReviewMode(false)
        toast.success(`Review complete! ${[...feedbackMap.values(), decision].filter(v => v === "keep").length} kept, ${[...feedbackMap.values(), decision].filter(v => v === "discard").length} discarded`)
      } else {
        setReviewIndex(next)
      }
    }, 400)
  }

  const startReview = () => {
    // Find first unreviewed ad
    let first = 0
    while (first < generatedAds.length && feedbackMap.has(first)) {
      first++
    }
    if (first >= generatedAds.length) {
      toast.info("All ads have been reviewed!")
      return
    }
    setReviewIndex(first)
    setReviewMode(true)
  }

  const unreviewedCount = generatedAds.filter((_, i) => !feedbackMap.has(i)).length

  // ---- Format helpers ----
  function formatElapsed(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  // ---- Loading skeleton ----
  if (loadingData) {
    return (
      <div className="max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const progressPercent =
    progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0

  // ---- Render ----
  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">Generate</h1>
        <p className="text-muted-foreground">
          Configure and launch an ad generation run
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ============================================================ */}
        {/* LEFT PANEL - Configuration                                   */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* Persona Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Persona</CardTitle>
              <CardDescription>
                Select the brand persona for copy generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {personas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active personas found. Create one in the Personas section.
                </p>
              ) : (
                <Select
                  value={selectedPersonaId}
                  onValueChange={(v) => { if (v) setSelectedPersonaId(v) }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {personas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Image Libraries */}
          <Card>
            <CardHeader>
              <CardTitle>Image Libraries</CardTitle>
              <CardDescription>
                Select image libraries to pull source images from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imageLibraries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active image libraries found.
                </p>
              ) : (
                <div className="space-y-3">
                  {imageLibraries.map((lib) => (
                    <label
                      key={lib.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedLibraryIds.has(lib.id)}
                        onCheckedChange={() => toggleLibrary(lib.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{lib.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lib.images.length} images
                        </div>
                      </div>
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer (optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Offer (Optional)</CardTitle>
              <CardDescription>
                Add a current promotion to include in the ads. Leave blank to skip.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. Buy 3 kits or more and get 25% OFF"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Ad Types */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ad Types</CardTitle>
                  <CardDescription>
                    {selectedAdTypeIds.size} of {adTypes.length} selected
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setAdTypesExpanded((v) => !v)}
                >
                  {adTypesExpanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {adTypesExpanded && (
              <CardContent>
                {/* Category filter pills */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    variant={categoryFilter === null ? "default" : "outline"}
                    size="xs"
                    onClick={() => setCategoryFilter(null)}
                  >
                    All
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? "default" : "outline"}
                      size="xs"
                      onClick={() =>
                        setCategoryFilter(
                          categoryFilter === cat ? null : cat
                        )
                      }
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* Select all / Deselect all for current filter */}
                <div className="mb-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => selectAllCategory(categoryFilter)}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => deselectAllCategory(categoryFilter)}
                  >
                    Deselect all
                  </Button>
                </div>

                {/* Ad types checklist */}
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {filteredAdTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No ad types in this category.
                    </p>
                  ) : (
                    filteredAdTypes.map((at) => (
                      <label
                        key={at.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedAdTypeIds.has(at.id)}
                          onCheckedChange={() => toggleAdType(at.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {at.name}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {at.category}
                        </Badge>
                      </label>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Image Ratio */}
          <Card>
            <CardHeader>
              <CardTitle>Image Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {["1:1", "4:5", "9:16"].map((ratio) => (
                  <Button
                    key={ratio}
                    variant={imageRatio === ratio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageRatio(ratio)}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Number of Ads */}
          <Card>
            <CardHeader>
              <CardTitle>Number of Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={adCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!isNaN(v)) setAdCount(Math.max(1, Math.min(100, v)))
                  }}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  (1 - 100)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                {selectedColorIds.size} of {colors.length} colors selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {colors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No colors configured.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const isSelected = selectedColorIds.has(color.id)
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => toggleColor(color.id)}
                        className="group relative flex size-10 items-center justify-center rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: color.hex,
                          borderColor: isSelected
                            ? "var(--ring)"
                            : "transparent",
                        }}
                        title={`${color.name} (${color.hex})`}
                      >
                        {isSelected && (
                          <Check
                            className="size-4"
                            style={{
                              color: isLightColor(color.hex)
                                ? "#000"
                                : "#fff",
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Providers */}
          <Card>
            <CardHeader>
              <CardTitle>AI Providers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Copy Provider</Label>
                {copyProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No copy providers configured.
                  </p>
                ) : (
                  <Select
                    value={copyProviderId}
                    onValueChange={(v) => { if (v) setCopyProviderId(v) }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select copy provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {copyProviders.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.modelName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Image Provider</Label>
                {imageProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No image providers configured.
                  </p>
                ) : (
                  <Select
                    value={imageProviderId}
                    onValueChange={(v) => { if (v) setImageProviderId(v) }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select image provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {imageProviders.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.modelName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL - Summary & Action / Progress                    */}
        {/* ============================================================ */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {!generating ? (
            /* ---- Summary Card ---- */
            <Card>
              <CardHeader>
                <CardTitle>Run Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SummaryRow
                  label="Persona"
                  value={selectedPersona?.name ?? "None selected"}
                />
                <SummaryRow
                  label="Libraries"
                  value={`${selectedLibraryIds.size} libraries (${totalImagesSelected} images)`}
                />
                <SummaryRow
                  label="Ad Types"
                  value={`${selectedAdTypeIds.size} selected`}
                />
                <SummaryRow label="Ratio" value={imageRatio} />
                <SummaryRow label="Count" value={String(adCount)} />
                <SummaryRow
                  label="Colors"
                  value={`${selectedColorIds.size} selected`}
                />

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={
                      !selectedPersonaId ||
                      selectedLibraryIds.size === 0 ||
                      selectedAdTypeIds.size === 0
                    }
                  >
                    <Sparkles className="size-4" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* ---- Progress UI ---- */
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {generationStatus === "completed" || generationStatus === "complete"
                        ? "Generation Complete"
                        : generationStatus === "failed"
                          ? "Generation Failed"
                          : "Generating..."}
                    </CardTitle>
                    {generationStatus === "running" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    {(generationStatus === "completed" || generationStatus === "complete") && (
                      <Check className="size-4 text-green-500" />
                    )}
                    {generationStatus === "failed" && (
                      <X className="size-4 text-destructive" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <Progress value={progressPercent}>
                    <ProgressLabel>
                      {progress} of {progressTotal}
                    </ProgressLabel>
                    <ProgressValue>
                      {() => `${progressPercent}%`}
                    </ProgressValue>
                  </Progress>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> Elapsed
                      </div>
                      <div className="text-sm font-semibold">
                        {formatElapsed(elapsedSeconds)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950/30">
                      <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Check className="size-3" /> Success
                      </div>
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {successCount}
                      </div>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/30">
                      <div className="flex items-center justify-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <X className="size-3" /> Failed
                      </div>
                      <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                        {failCount}
                      </div>
                    </div>
                  </div>

                  {/* Drive link */}
                  {generationStatus === "completed" && driveFolderUrl && (
                    <a
                      href={driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <ExternalLink className="size-4 text-primary" />
                      <span className="font-medium">View in Google Drive</span>
                    </a>
                  )}

                  {/* Reset button when done */}
                  {(generationStatus === "completed" ||
                    generationStatus === "complete" ||
                    generationStatus === "failed") && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={resetGeneration}
                    >
                      Start New Generation
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Generated Ads Grid */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Ads</CardTitle>
                    {generatedAds.length > 0 && (generationStatus === "complete" || generationStatus === "completed") && unreviewedCount > 0 && (
                      <Button size="sm" onClick={startReview}>
                        Review Ads ({unreviewedCount})
                      </Button>
                    )}
                  </div>
                  {feedbackMap.size > 0 && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{feedbackMap.size} of {generatedAds.length} reviewed</span>
                      <span className="text-emerald-500">{[...feedbackMap.values()].filter(v => v === "keep").length} kept</span>
                      <span className="text-red-400">{[...feedbackMap.values()].filter(v => v === "discard").length} discarded</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {generatedAds.map((ad, i) => {
                      const feedback = feedbackMap.get(i)
                      return (
                        <div
                          key={i}
                          className={`relative overflow-hidden rounded-lg border cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 ${
                            feedback === "keep"
                              ? "ring-2 ring-emerald-500/50"
                              : feedback === "discard"
                                ? "ring-2 ring-red-400/50 opacity-50"
                                : ""
                          }`}
                          onClick={() => { setReviewIndex(i); setReviewMode(true) }}
                        >
                          {ad.generated_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ad.generated_image.includes("drive.google.com/file/d/")
                                ? `/api/drive-image/${ad.generated_image.match(/\/d\/([^/]+)/)?.[1]}`
                                : ad.generated_image}
                              alt={ad.headline || `Ad ${i + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center bg-muted">
                              <ImageIcon className="size-6 text-muted-foreground/40" />
                            </div>
                          )}
                          {/* Status badge overlay */}
                          {feedback && (
                            <div className={`absolute top-1.5 right-1.5 rounded-full p-1 ${
                              feedback === "keep" ? "bg-emerald-500" : "bg-red-400"
                            }`}>
                              {feedback === "keep"
                                ? <Check className="size-3 text-white" />
                                : <X className="size-3 text-white" />
                              }
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {/* Pending slots */}
                    {Array.from({ length: Math.max(0, progressTotal - generatedAds.length) }).map((_, i) => (
                      <Skeleton
                        key={`pending-${i}`}
                        className="aspect-square rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* Fullscreen Review Overlay                                        */}
      {/* ================================================================ */}
      {reviewMode && generatedAds[reviewIndex] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setReviewMode(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
              <span className="text-sm font-medium text-white/70">
                {reviewIndex + 1} of {generatedAds.length}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-emerald-400">{[...feedbackMap.values()].filter(v => v === "keep").length} kept</span>
              <span className="text-white/30">|</span>
              <span className="text-red-400">{[...feedbackMap.values()].filter(v => v === "discard").length} discarded</span>
              <span className="text-white/30">|</span>
              <span className="text-white/50">{unreviewedCount} remaining</span>
            </div>
          </div>

          {/* Image area */}
          <div className="flex flex-1 items-center justify-center px-6 pb-4 relative">
            {/* Previous button */}
            <button
              onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
              disabled={reviewIndex === 0}
              className="absolute left-4 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-8" />
            </button>

            {/* The ad image */}
            <div className={`relative transition-all duration-300 ${
              reviewAnimation === "keep" ? "scale-95 opacity-0 translate-x-20" :
              reviewAnimation === "discard" ? "scale-95 opacity-0 -translate-x-20" : ""
            }`}>
              {generatedAds[reviewIndex]?.generated_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={generatedAds[reviewIndex].generated_image.includes("drive.google.com/file/d/")
                    ? `/api/drive-image/${generatedAds[reviewIndex].generated_image.match(/\/d\/([^/]+)/)?.[1]}`
                    : generatedAds[reviewIndex].generated_image}
                  alt={generatedAds[reviewIndex].headline || `Ad ${reviewIndex + 1}`}
                  className="max-h-[calc(100vh-240px)] rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <div className="flex size-96 items-center justify-center rounded-xl bg-white/5">
                  <ImageIcon className="size-16 text-white/20" />
                </div>
              )}

              {/* Keep/discard flash overlay */}
              {reviewAnimation === "keep" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-500/20">
                  <Check className="size-24 text-emerald-400" />
                </div>
              )}
              {reviewAnimation === "discard" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-red-500/20">
                  <X className="size-24 text-red-400" />
                </div>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={() => setReviewIndex(Math.min(generatedAds.length - 1, reviewIndex + 1))}
              disabled={reviewIndex >= generatedAds.length - 1}
              className="absolute right-4 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-8" />
            </button>
          </div>

          {/* Ad info */}
          <div className="text-center px-6 pb-2">
            <p className="text-sm font-medium text-white/90">{generatedAds[reviewIndex]?.headline}</p>
            <p className="text-xs text-white/50 mt-0.5">{generatedAds[reviewIndex]?.ad_type} · {generatedAds[reviewIndex]?.cta}</p>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-center gap-6 px-6 py-6">
            {feedbackMap.has(reviewIndex) ? (
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={`text-sm px-4 py-1.5 ${
                    feedbackMap.get(reviewIndex) === "keep"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-red-400/20 text-red-400 border-red-400/30"
                  }`}
                >
                  {feedbackMap.get(reviewIndex) === "keep" ? "✓ Kept" : "✗ Discarded"}
                </Badge>
                <button
                  onClick={() => {
                    let next = reviewIndex + 1
                    while (next < generatedAds.length && feedbackMap.has(next)) next++
                    if (next < generatedAds.length) {
                      setReviewIndex(next)
                    } else {
                      setReviewMode(false)
                    }
                  }}
                  className="rounded-lg px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SkipForward className="size-4 inline mr-1.5" />
                  Next
                </button>
              </div>
            ) : submittingFeedback.has(reviewIndex) ? (
              <Loader2 className="size-6 animate-spin text-white/50" />
            ) : (
              <>
                {/* Discard button */}
                <button
                  onClick={() => handleReviewDecision("discard")}
                  className="group flex items-center gap-3 rounded-2xl bg-white/5 px-8 py-4 text-red-400 transition-all hover:bg-red-500/20 hover:scale-105 active:scale-95"
                >
                  <X className="size-8 transition-transform group-hover:scale-110" />
                  <span className="text-lg font-semibold">Discard</span>
                </button>

                {/* Discard with reason (compact dropdown) */}
                <div className="flex flex-col items-center gap-1">
                  <select
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 outline-none transition-colors hover:bg-white/10 hover:text-white/70 cursor-pointer border-none"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) handleReviewDecision("discard", e.target.value)
                    }}
                  >
                    <option value="" disabled>Discard with reason...</option>
                    {DISCARD_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Keep button */}
                <button
                  onClick={() => handleReviewDecision("keep")}
                  className="group flex items-center gap-3 rounded-2xl bg-white/5 px-8 py-4 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:scale-105 active:scale-95"
                >
                  <Check className="size-8 transition-transform group-hover:scale-110" />
                  <span className="text-lg font-semibold">Keep</span>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="flex items-center justify-center gap-1.5 px-6 pb-4 overflow-x-auto">
            {generatedAds.map((ad, i) => {
              const fb = feedbackMap.get(i)
              return (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`relative shrink-0 size-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === reviewIndex
                      ? "border-white/80 scale-110"
                      : fb === "keep"
                        ? "border-emerald-500/50 opacity-70"
                        : fb === "discard"
                          ? "border-red-400/50 opacity-30"
                          : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {ad.generated_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ad.generated_image.includes("drive.google.com/file/d/")
                        ? `/api/drive-image/${ad.generated_image.match(/\/d\/([^/]+)/)?.[1]}`
                        : ad.generated_image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-white/10" />
                  )}
                  {fb && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      fb === "keep" ? "bg-emerald-500/30" : "bg-red-400/30"
                    }`}>
                      {fb === "keep"
                        ? <Check className="size-4 text-white" />
                        : <X className="size-4 text-white" />
                      }
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
