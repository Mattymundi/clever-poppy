import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        const run = await prisma.generationRun.findUnique({ where: { id } });

        if (!run) {
          sendEvent("error", { error: "Generation run not found" });
          controller.close();
          return;
        }

        sendEvent("status", {
          id: run.id,
          status: run.status,
          adCount: run.adCount,
          successCount: run.successCount,
          failCount: run.failCount,
          durationSeconds: run.durationSeconds,
          ads: JSON.parse(run.ads),
        });

        // If the run is already in a terminal state, close the stream
        if (run.status === "complete" || run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
          sendEvent("done", { status: run.status });
          controller.close();
          return;
        }

        // For in-progress runs, poll for updates
        let lastStatus = run.status;
        let lastSuccessCount = run.successCount;
        let pollCount = 0;
        const maxPolls = 600; // 10 minutes at 1s intervals

        const interval = setInterval(async () => {
          try {
            pollCount++;
            if (pollCount > maxPolls) {
              sendEvent("timeout", { message: "Stream timeout reached" });
              clearInterval(interval);
              controller.close();
              return;
            }

            const updated = await prisma.generationRun.findUnique({ where: { id } });
            if (!updated) {
              sendEvent("error", { error: "Generation run not found" });
              clearInterval(interval);
              controller.close();
              return;
            }

            // Send update if status or progress changed
            if (updated.status !== lastStatus || updated.successCount !== lastSuccessCount) {
              lastStatus = updated.status;
              lastSuccessCount = updated.successCount;

              sendEvent("status", {
                id: updated.id,
                status: updated.status,
                adCount: updated.adCount,
                successCount: updated.successCount,
                failCount: updated.failCount,
                durationSeconds: updated.durationSeconds,
                ads: JSON.parse(updated.ads),
              });
            }

            // Close on terminal state
            if (updated.status === "complete" || updated.status === "completed" || updated.status === "failed" || updated.status === "cancelled") {
              sendEvent("done", { status: updated.status });
              clearInterval(interval);
              controller.close();
            }
          } catch {
            clearInterval(interval);
            controller.close();
          }
        }, 1000);
      } catch {
        sendEvent("error", { error: "Internal server error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
