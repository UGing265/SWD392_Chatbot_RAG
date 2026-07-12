"use client";

import { Suspense } from "react";
import { BookmarksView } from "@/components/common/documents/bookmarks-view";

export default function BookmarksPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <BookmarksView />
    </Suspense>
  );
}
