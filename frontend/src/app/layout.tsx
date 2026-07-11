import type { Metadata } from "next";
import { JetBrains_Mono, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ColorSchemeScript } from "@mantine/core";

import { Providers } from "./providers";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Newsreader({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudyMate — Trợ lý tra cứu tài liệu môn học",
    template: "%s — StudyMate",
  },
  description:
    "Chatbot RAG tra cứu tài liệu môn học với trích dẫn rõ ràng, giao diện pastel êm dịu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${sansFont.variable} ${serifFont.variable} ${jetbrainsMono.variable}`}
      data-mantine-color-scheme="light"
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
