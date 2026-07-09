"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { SharedDocumentsView } from "@/components/common/documents/shared-documents-view";

export default function SharedDocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SharedDocumentsView />
    </Suspense>
  );
}
