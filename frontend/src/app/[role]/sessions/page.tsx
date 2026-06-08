import type { Metadata } from "next";

import { SessionsView } from "@/components/features/sessions-view";

export const metadata: Metadata = {
  title: "Phiên hội thoại",
};

export default function Page() {
  return <SessionsView />;
}
