import type { Metadata } from "next";

import { SessionsView } from "@/components/common/chat/sessions-view";

export const metadata: Metadata = {
  title: "Phiên hội thoại",
};

export default function Page() {
  return <SessionsView />;
}
