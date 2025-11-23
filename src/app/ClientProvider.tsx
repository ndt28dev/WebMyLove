// src/app/ClientProvider.tsx
"use client";

import { ReactNode } from "react";
import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const theme = createTheme({
  colors: {
    brand: [
      "#FFF0F7",
      "#FFDBEB",
      "#FFB3D2",
      "#FF8AB8",
      "#FF61A0",
      "#FF3A89",
      "#D52D72",
      "#AB225A",
      "#801843",
      "#560F2D",
    ],
  },
  primaryColor: "brand",
});

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider theme={theme} defaultColorScheme="light">
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
