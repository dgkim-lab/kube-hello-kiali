import crypto from "node:crypto";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 8080);
const judgeApiUrl = process.env.JUDGE_API_URL || "http://judge-api:8081";
const moves = new Set(["rock", "paper", "scissors"]);

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
  const response = await fetch(`${judgeApiUrl}/judge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
    body: JSON.stringify({ move }),
  });

  if (!response.ok) {
    res.status(502).json({ error: "judge-api failed", requestId });
    return;
  }

  const judged = await response.json();
  res.json({ ...judged, requestId });
});

app.listen(port, () => {
  console.log(`challenge-api listening on ${port}`);
});

