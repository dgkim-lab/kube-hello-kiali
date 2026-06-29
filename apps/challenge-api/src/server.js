import "./tracing.js";
import crypto from "node:crypto";
import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 8080);
const judgeApiUrl = process.env.JUDGE_API_URL || "http://judge-api:8081";
const moves = new Set(["rock", "paper", "scissors"]);
const tracer = trace.getTracer("challenge-api");

app.use((req, res, next) => {
  const parentContext = propagation.extract(context.active(), req.headers);

  tracer.startActiveSpan(`${req.method} ${req.path}`, {}, parentContext, (span) => {
    span.setAttributes({
      "http.request.method": req.method,
      "url.path": req.path,
    });
    res.locals.requestSpan = span;
    res.locals.traceId = span.spanContext().traceId;

    let ended = false;
    const endSpan = () => {
      if (ended) return;
      ended = true;

      span.setAttribute("http.response.status_code", res.statusCode);
      if (res.statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }
      span.end();
    };

    res.once("finish", endSpan);
    res.once("close", endSpan);
    next();
  });
});

app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", service: "challenge-api" });
});

app.post("/challenges", async (req, res) => {
  const move = req.body?.move;
  const span = res.locals.requestSpan;
  const traceId = res.locals.traceId;

  if (!moves.has(move)) {
    res.status(400).json({
      error: "move must be one of rock, paper, scissors",
      traceId,
    });
    return;
  }

  const requestId = crypto.randomUUID();

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
        "error.type": judged.code || "judge_api_error",
      });
      res.status(502).json({
        error: "judge-api failed",
        code: judged.code || "judge_api_error",
        detail: judged.error || "upstream judge-api returned an error",
        requestId,
        traceId,
      });
      return;
    }

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
      traceId,
    });
  }
});

app.listen(port, () => {
  console.log(`challenge-api listening on ${port}`);
});
