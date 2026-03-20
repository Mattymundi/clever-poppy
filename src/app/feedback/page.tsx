"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, TrendingDown, BarChart3, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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

interface FeedbackStats {
  totals: { kept: number; discarded: number; total: number; approvalRate: number }
  byAdType: {
    adTypeName: string
    adTypeId: string
    kept: number
    discarded: number
    total: number
    rate: number
  }[]
  byDiscardReason: { reason: string; count: number }[]
  byColor: { color: string; kept: number; discarded: number; rate: number }[]
}

interface PendingGroup {
  adTypeName: string
  kept: number
  discarded: number
  total: number
  canAnalyze: boolean
  items: {
    id: string
    headline: string
    decision: string
    discardReason: string | null
    createdAt: string
  }[]
}

interface AiProvider {
  id: string
  name: string
  type: string
  modelName: string
  active: boolean
}

// ---------------------------------------------------------------------------
// Reason label map
// ---------------------------------------------------------------------------

const REASON_LABELS: Record<string, string> = {
  bad_layout: "Bad layout",
  bad_copy: "Bad copy",
  bad_image: "Bad image",
  off_brand: "Off brand",
  boring: "Boring",
  wrong_tone: "Wrong tone",
  text_illegible: "Text illegible",
  other: "Other",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedbackPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [pendingGroups, setPendingGroups] = useState<PendingGroup[]>([])
  const [totalPending, setTotalPending] = useState(0)
  const [loading, setLoading] = useState(true)

  // Provider state
  const [providers, setProviders] = useState<AiProvider[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>("")

  // Per-ad-type analyzing state
  const [analyzingType, setAnalyzingType] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [statsRes, pendingRes, providersRes] = await Promise.all([
        fetch("/api/feedback/stats"),
        fetch("/api/feedback/pending"),
        fetch("/api/providers"),
      ])

      const statsData = await statsRes.json()
      const pendingData = await pendingRes.json()
      const providersData = await providersRes.json()

      setStats(statsData)
      setPendingGroups(pendingData.groups || [])
      setTotalPending(pendingData.totalPending || 0)

      const copyProviders = (providersData as AiProvider[]).filter(
        (p) => p.active && (p.type === "copy" || p.type === "both")
      )
      setProviders(copyProviders)
      if (copyProviders.length > 0 && !selectedProviderId) {
        setSelectedProviderId(copyProviders[0].id)
      }
    } catch {
      toast.error("Failed to load feedback data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleAnalyzeType = async (adTypeName: string) => {
    if (!selectedProviderId) {
      toast.error("Please select a copy provider first")
      return
    }

    setAnalyzingType(adTypeName)
    try {
      const res = await fetch("/api/feedback/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copyProviderId: selectedProviderId, adTypeName }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Analysis failed" }))
        throw new Error(err.error || "Analysis failed")
      }

      const result = await res.json()
      toast.success(result.message || "Analysis complete!")

      // Reload data — analyzed reviews will disappear
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzingType(null)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-5xl space-y-10">
        <div className="space-y-1 pt-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const totals = stats?.totals || { kept: 0, discarded: 0, total: 0, approvalRate: 0 }
  const byAdType = stats?.byAdType || []
  const byDiscardReason = stats?.byDiscardReason || []

  const sortedByRate = [...byAdType].sort((a, b) => b.rate - a.rate)
  const mostApproved = sortedByRate.length > 0 ? sortedByRate[0] : null
  const mostRejected = sortedByRate.length > 0 ? sortedByRate[sortedByRate.length - 1] : null

  const maxReasonCount = byDiscardReason.length > 0
    ? Math.max(...byDiscardReason.map((r) => r.count))
    : 1

  return (
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">Feedback & Insights</h1>
        <p className="text-muted-foreground">
          Review patterns and improve generation quality
        </p>
      </div>

      {/* Overview Stats */}
      {totals.total === 0 && totalPending === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="size-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No feedback yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Generate some ads and review them to see insights here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-semibold">{totals.total}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-semibold">{totals.approvalRate}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3.5 text-emerald-500" /> Most Approved
              </p>
              <p className="text-lg font-semibold truncate">
                {mostApproved ? mostApproved.adTypeName : "--"}
              </p>
              {mostApproved && (
                <p className="text-xs text-emerald-500">{mostApproved.rate}% approval</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="size-3.5 text-red-400" /> Most Rejected
              </p>
              <p className="text-lg font-semibold truncate">
                {mostRejected ? mostRejected.adTypeName : "--"}
              </p>
              {mostRejected && (
                <p className="text-xs text-red-400">{100 - mostRejected.rate}% rejection</p>
              )}
            </div>
          </div>

          {/* Pending Reviews by Ad Type — with per-type Analyze buttons */}
          {pendingGroups.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Pending Reviews
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {totalPending} unanalyzed reviews — grouped by ad type (minimum 20 to analyze)
                  </p>
                </div>
                {providers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Provider:</span>
                    <Select
                      value={selectedProviderId}
                      onValueChange={(v) => { if (v) setSelectedProviderId(v) }}
                    >
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.modelName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {pendingGroups.map((group) => (
                  <div
                    key={group.adTypeName}
                    className="rounded-xl border bg-card overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {group.adTypeName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                          <span>{group.total} reviews</span>
                          <span className="text-emerald-500">{group.kept} kept</span>
                          <span className="text-red-400">{group.discarded} discarded</span>
                        </div>
                      </div>
                      <div className="shrink-0 ml-4">
                        {group.canAnalyze ? (
                          <Button
                            size="sm"
                            onClick={() => handleAnalyzeType(group.adTypeName)}
                            disabled={analyzingType !== null || !selectedProviderId}
                          >
                            {analyzingType === group.adTypeName ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-3.5" />
                                Analyze & Improve
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {20 - group.total} more needed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Preview of recent reviews */}
                    {group.items.length > 0 && (
                      <div className="border-t divide-y">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 px-5 py-2 text-xs"
                          >
                            <Badge
                              variant="secondary"
                              className={`text-[10px] shrink-0 ${
                                item.decision === "keep"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-red-400/10 text-red-400"
                              }`}
                            >
                              {item.decision === "keep" ? "Kept" : "Discarded"}
                            </Badge>
                            <span className="truncate flex-1 text-muted-foreground">
                              {item.headline}
                            </span>
                            {item.discardReason && (
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {REASON_LABELS[item.discardReason] || item.discardReason}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time Approval by Ad Type */}
          {byAdType.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">All-Time Approval by Ad Type</h2>
              <div className="rounded-xl border bg-card">
                <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-x-4 gap-y-0 px-5 py-3 text-xs font-medium text-muted-foreground border-b">
                  <span>Ad Type</span>
                  <span className="w-12 text-center">Total</span>
                  <span className="w-12 text-center text-emerald-500">Kept</span>
                  <span className="w-12 text-center text-red-400">Disc.</span>
                  <span>Approval</span>
                </div>
                {[...byAdType].sort((a, b) => b.total - a.total).map((item) => (
                  <div
                    key={item.adTypeName}
                    className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-x-4 px-5 py-3 border-b last:border-b-0"
                  >
                    <span className="text-sm font-medium truncate">{item.adTypeName}</span>
                    <span className="w-12 text-center text-sm">{item.total}</span>
                    <span className="w-12 text-center text-sm text-emerald-500">{item.kept}</span>
                    <span className="w-12 text-center text-sm text-red-400">{item.discarded}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.rate}%`,
                            backgroundColor: item.rate >= 70
                              ? "rgb(16 185 129)"
                              : item.rate >= 40
                                ? "rgb(234 179 8)"
                                : "rgb(248 113 113)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{item.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discard Reasons */}
          {byDiscardReason.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Discard Reasons</h2>
              <div className="rounded-xl border bg-card p-5 space-y-3">
                {[...byDiscardReason].sort((a, b) => b.count - a.count).map((item) => (
                  <div key={item.reason} className="flex items-center gap-3">
                    <span className="text-sm w-32 shrink-0 truncate">
                      {REASON_LABELS[item.reason] || item.reason}
                    </span>
                    <div className="h-6 flex-1 rounded-md bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-md bg-red-400/70 transition-all flex items-center px-2"
                        style={{ width: `${Math.max((item.count / maxReasonCount) * 100, 8)}%` }}
                      >
                        <span className="text-[11px] font-medium text-white">{item.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
