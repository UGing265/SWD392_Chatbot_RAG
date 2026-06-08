import type { Metadata } from "next";
import { ChatView } from "@/components/features/chat-view";

export const metadata: Metadata = {
  title: "Trò chuyện với AI",
};

export default function Page() {
  return <ChatView />;
}
