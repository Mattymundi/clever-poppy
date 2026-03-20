"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowRight,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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

function StatusIndicator({ status }: { status: string }) {
  if (status === "running" || status === "pending") {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />
  }
  if (status === "complete" || status === "completed") {
    return <CheckCircle2 className="size-4 text-emerald-500" />
  }
  return <XCircle className="size-4 text-red-400" />
}

export default function DashboardPage() {
  const [runs, setRuns] = useState<GenerationRun[]>([])
  const [totalRuns, setTotalRuns] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/history?limit=5&page=1")
        if (!res.ok) throw new Error("Failed to fetch")
        const data: HistoryResponse = await res.json()
        setRuns(data.data)
        setTotalRuns(data.pagination.total)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalAds = runs.reduce((acc, r) => acc + r.successCount, 0)

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const adsThisWeek = runs
    .filter((r) => new Date(r.createdAt) >= startOfWeek)
    .reduce((acc, r) => acc + r.successCount, 0)

  const adsThisMonth = runs
    .filter((r) => new Date(r.createdAt) >= startOfMonth)
    .reduce((acc, r) => acc + r.successCount, 0)

  return (
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ad Generator
        </h1>
        <p className="text-muted-foreground">
          Create professional ad creatives with AI
        </p>
      </div>

      {/* Quick action */}
      <div>
        <Button size="lg" className="h-11 px-6 shadow-sm" render={<Link href="/generate" />}>
          <Sparkles className="size-4" />
          New Generation
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total ads", value: totalAds },
          { label: "This week", value: adsThisWeek },
          { label: "This month", value: adsThisMonth },
          { label: "Total runs", value: totalRuns },
        ].map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            {loading ? (
              <Skeleton className="h-8 w-14" />
            ) : (
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent runs</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" render={<Link href="/history" />}>
            View all
            <ArrowRight className="ml-1 size-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Sparkles className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No runs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate your first batch of ads to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <Card key={run.id} className="transition-colors hover:bg-muted/30">
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
                      {run.status === "running" && (
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                          Running
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{timeAgo(run.createdAt)}</span>
                      {run.durationSeconds && (
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
                        <span className="text-emerald-600 dark:text-emerald-400">{run.successCount}</span>
                        {run.failCount > 0 && (
                          <span className="text-red-400"> / {run.failCount} failed</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {run.driveFolderUrl && (
                    <a
                      href={run.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
