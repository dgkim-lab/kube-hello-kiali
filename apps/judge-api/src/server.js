import "./tracing.js";
import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 8081);
const moves = ["rock", "paper", "scissors"];
const errorRate = Number(process.env.ERROR_RATE || 0.2);
const tracer = trace.getTracer("judge-api");

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
  res.json({ status: "ok", service: "judge-api" });
});

app.post("/judge", (req, res) => {
  const playerMove = req.body?.move;
  const span = res.locals.requestSpan;
  const traceId = res.locals.traceId;

  if (!moves.includes(playerMove)) {
    res.status(400).json({
      error: "move must be one of rock, paper, scissors",
      traceId,
    });
    return;
  }

  span.setAttributes({
    "http.route": "/judge",
    "rps.player_move": playerMove,
    "rps.error_rate": errorRate,
  });

  try {
    maybeThrowInjectedError();

    const serverMove = moves[Math.floor(Math.random() * moves.length)];
    const result = judge(playerMove, serverMove);

    span.setAttributes({
      "rps.server_move": serverMove,
      "rps.result": result,
    });
    res.json({ playerMove, serverMove, result });
  } catch (err) {
    span.recordException(err);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: err instanceof Error ? err.message : "unknown judge-api error",
    });
    res.status(500).json({
      error: err instanceof Error ? err.message : "judge-api failed",
      code: "injected_judge_error",
      traceId,
    });
  }
});

function maybeThrowInjectedError() {
  if (Math.random() < errorRate) {
    throw new Error("Injected judge-api failure for tracing demo");
  }
}

function judge(playerMove, serverMove) {
  if (playerMove === serverMove) return "draw";
  if (
    (playerMove === "rock" && serverMove === "scissors") ||
    (playerMove === "paper" && serverMove === "rock") ||
    (playerMove === "scissors" && serverMove === "paper")
  ) {
    return "win";
  }
  return "lose";
}

app.listen(port, () => {
  console.log(`judge-api listening on ${port}`);
});
