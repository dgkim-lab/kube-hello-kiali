import CasinoIcon from "@mui/icons-material/Casino";
import { Alert, Box, Button, CssBaseline, Paper, Stack, ThemeProvider, Typography, createTheme } from "@mui/material";
import { useState } from "react";

type Move = "rock" | "paper" | "scissors";

type ChallengeResult = {
  playerMove: Move;
  serverMove: Move;
  result: "win" | "lose" | "draw";
  requestId: string;
};

const challengeApiUrl = "/api";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },
    secondary: { main: "#0f766e" },
    background: { default: "#f7f7f4" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ["Inter", "Roboto", "Arial", "sans-serif"].join(","),
  },
});

async function play(move: Move): Promise<ChallengeResult> {
  const response = await fetch(`${challengeApiUrl}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ move }),
  });

  if (!response.ok) {
    throw new Error(`challenge-api returned ${response.status}`);
  }

  return response.json();
}

export default function App() {
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMove, setLoadingMove] = useState<Move | null>(null);

  const onMove = async (move: Move) => {
    setLoadingMove(move);
    setError(null);
    try {
      setResult(await play(move));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingMove(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 4 }}>
        <Paper elevation={2} sx={{ width: "min(100%, 520px)", p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CasinoIcon color="primary" />
              <Typography variant="h5" component="h1">
                kube-hello-kiali
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {(["rock", "paper", "scissors"] as Move[]).map((move) => (
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
      </Box>
    </ThemeProvider>
  );
}
