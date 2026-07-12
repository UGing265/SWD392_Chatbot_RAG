"use client";

import { Suspense } from "react";
import { ExploreView } from "@/components/common/documents/explore-view";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ExploreView />
    </Suspense>
  );
}
