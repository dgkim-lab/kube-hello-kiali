import express from "express";

const app = express();
const port = Number(process.env.PORT || 8081);
const moves = ["rock", "paper", "scissors"];

app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", service: "judge-api" });
});

app.post("/judge", (req, res) => {
  const playerMove = req.body?.move;

  if (!moves.includes(playerMove)) {
    res.status(400).json({ error: "move must be one of rock, paper, scissors" });
    return;
  }

  const serverMove = moves[Math.floor(Math.random() * moves.length)];
  const result = judge(playerMove, serverMove);
  res.json({ playerMove, serverMove, result });
});

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

