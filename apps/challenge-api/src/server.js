import "./tracing.js";
import crypto from "node:crypto";
import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 8080);
const judgeApiUrl = process.env.JUDGE_API_URL || "http://judge-api:8081";
const moves = new Set(["rock", "paper", "scissors"]);
const tracer = trace.getTracer("challenge-api");

app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", service: "challenge-api" });
});

app.post("/challenges", async (req, res) => {
  const move = req.body?.move;

  if (!moves.has(move)) {
    res.status(400).json({ error: "move must be one of rock, paper, scissors" });
    return;
  }

  const requestId = crypto.randomUUID();

  await tracer.startActiveSpan("challenge-api.handle-challenge", async (span) => {
    span.setAttributes({
      "app.request_id": requestId,
      "rps.player_move": move,
      "http.route": "/challenges",
    });

    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      };
      propagation.inject(context.active(), headers);

      const response = await fetch(`${judgeApiUrl}/judge`, {
        method: "POST",
        headers,
        body: JSON.stringify({ move }),
      });

      const judged = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(judged.error || `judge-api returned ${response.status}`);
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.setAttributes({
          "http.response.status_code": response.status,
          "error.type": judged.code || "judge_api_error",
        });
        res.status(502).json({
          error: "judge-api failed",
          code: judged.code || "judge_api_error",
          detail: judged.error || "upstream judge-api returned an error",
          requestId,
        });
        return;
      }

      span.setStatus({ code: SpanStatusCode.OK });
      res.json({ ...judged, requestId });
    } catch (err) {
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : "unknown challenge-api error",
      });
      res.status(502).json({
        error: "judge-api failed",
        code: "judge_api_unreachable",
        detail: err instanceof Error ? err.message : "unknown error",
        requestId,
      });
    } finally {
      span.end();
    }
  });
});

app.listen(port, () => {
  console.log(`challenge-api listening on ${port}`);
});
