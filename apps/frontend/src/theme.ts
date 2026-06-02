import { createTheme } from "@mui/material";

export const theme = createTheme({
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

