import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SWD392 Chatbot RAG",
  description: "Chatbot with RAG pipeline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}