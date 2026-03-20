"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Clock,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerationRun {
  id: string
  personaId: string
  persona: { id: string; name: string }
  adCount: number
  successCount: number
  failCount: number
  imageRatio: string
  durationSeconds: number | null
  driveFolderUrl: string | null
  config: Record<string, unknown>
  ads: unknown[]
  status: string
  createdAt: string
  updatedAt: string
}

interface HistoryResponse {
  data: GenerationRun[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "-"
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function StatusIndicator({ status }: { status: string }) {
  if (status === "running" || status === "pending") {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }
  if (status === "complete" || status === "completed") {
    return <CheckCircle2 className="size-5 text-emerald-500" />
  }
  return <XCircle className="size-5 text-red-400" />
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20

export default function HistoryPage() {
  const [runs, setRuns] = useState<GenerationRun[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchRuns = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/history?page=${p}&limit=${PAGE_SIZE}`
      )
      if (!res.ok) throw new Error("Failed to fetch")
      const data: HistoryResponse = await res.json()
      setRuns(data.data)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch {
      // keep current state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRuns(page)
  }, [page, fetchRuns])

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="text-muted-foreground">
          Past generation runs and their results
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total run{total !== 1 ? "s" : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {page} of {Math.max(1, totalPages)}
          </p>
        )}
      </div>

      {/* Run list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Sparkles className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No generation runs yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Go to the Generate page to create your first run.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <div key={run.id}>
              <Card
                className="cursor-pointer border-transparent transition-colors hover:bg-muted/30"
                onClick={() => toggleExpand(run.id)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <StatusIndicator status={run.status} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {run.persona?.name ?? "Unknown persona"}
                      </span>
                      <Badge variant="secondary" className="font-normal">
                        {run.adCount} ads
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        {run.imageRatio}
                      </Badge>
                      {(run.status === "running" || run.status === "pending") && (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          Running
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{timeAgo(run.createdAt)}</span>
                      {run.durationSeconds != null && (
                        <>
                          <span className="text-border">|</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDuration(run.durationSeconds)}
                          </span>
                        </>
                      )}
                      <span className="text-border">|</span>
                      <span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {run.successCount}
                        </span>
                        {run.failCount > 0 && (
                          <span className="text-red-400">
                            {" "}
                            / {run.failCount} failed
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {run.driveFolderUrl && (
                      <a
                        href={run.driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    {expandedId === run.id ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expanded detail panel */}
              {expandedId === run.id && (
                <div className="mx-4 rounded-b-xl bg-muted/30 px-6 py-4">
                  <RunDetails run={run} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1} -{" "}
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Expanded detail view
// ---------------------------------------------------------------------------

function RunDetails({ run }: { run: GenerationRun }) {
  const config = run.config as Record<string, unknown>

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Run ID" value={run.id} />
        <DetailItem label="Image Ratio" value={run.imageRatio} />
        <DetailItem label="Created" value={formatDate(run.createdAt)} />
        <DetailItem label="Updated" value={formatDate(run.updatedAt)} />
        {Array.isArray(config.imageLibraryIds) && (
          <DetailItem
            label="Image Libraries"
            value={`${config.imageLibraryIds.length} selected`}
          />
        )}
        {Array.isArray(config.adTypeIds) && (
          <DetailItem
            label="Ad Types"
            value={`${config.adTypeIds.length} selected`}
          />
        )}
        {Array.isArray(config.colorIds) && (
          <DetailItem
            label="Colors"
            value={`${config.colorIds.length} selected`}
          />
        )}
      </div>

      {run.ads && (run.ads as unknown[]).length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium">
            Generated Ads ({(run.ads as unknown[]).length})
          </h4>
          <p className="text-xs text-muted-foreground">
            Ad details would appear here when generation data is available.
          </p>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate" title={value}>
        {value}
      </div>
    </div>
  )
}
