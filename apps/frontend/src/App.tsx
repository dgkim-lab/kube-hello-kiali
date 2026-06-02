import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { GamePanel } from "./components/GamePanel";
import { theme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 4 }}>
        <GamePanel />
      </Box>
    </ThemeProvider>
  );
}
