import type { Metadata } from "next";
import { ChatView } from "@/components/common/chat/chat-view";

export const metadata: Metadata = {
  title: "Trò chuyện với AI",
};

export default function Page() {
  return <ChatView />;
}
