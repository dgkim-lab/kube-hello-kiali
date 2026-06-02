import CasinoIcon from "@mui/icons-material/Casino";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { playChallenge } from "../api/challenge";
import type { ChallengeResult, Move } from "../types";

const moves: Move[] = ["rock", "paper", "scissors"];

export function GamePanel() {
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMove, setLoadingMove] = useState<Move | null>(null);

  const onMove = async (move: Move) => {
    setLoadingMove(move);
    setError(null);
    try {
      setResult(await playChallenge(move));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingMove(null);
    }
  };

  return (
    <Paper elevation={2} sx={{ width: "min(100%, 520px)", p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CasinoIcon color="primary" />
          <Typography variant="h5" component="h1">
            kube-hello-kiali
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {moves.map((move) => (
            <Button
              key={move}
              variant="contained"
              onClick={() => onMove(move)}
              disabled={loadingMove !== null}
              sx={{ minHeight: 44, textTransform: "capitalize" }}
            >
              {loadingMove === move ? "Playing" : move}
            </Button>
          ))}
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {result && (
          <Alert severity={result.result === "win" ? "success" : result.result === "draw" ? "info" : "warning"}>
            You played {result.playerMove}. Server played {result.serverMove}. Result: {result.result}.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

