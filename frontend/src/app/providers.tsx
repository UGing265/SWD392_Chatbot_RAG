"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  fontFamily: "Atkinson Hyperlegible, sans-serif",
  headings: {
    fontFamily: "Crimson Pro, serif",
  },
  primaryColor: "blue",
  colors: {
    blue: [
      "#f5f3ff",
      "#ede9fe",
      "#ddd6fe",
      "#c084fc",
      "#a78bfa",
      "#8b5cf6",
      "#7c3aed", // primary: Violet-600
      "#6d28d9",
      "#5b21b6",
      "#4c1d95",
    ],
  },
  defaultRadius: "md",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
