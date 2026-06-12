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
  primaryColor: "violet",
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
