"use client";

import { CompareView } from "@/components/common/documents/compare-view";
import { useParams } from "next/navigation";

export default function CompareDocumentsPage() {
  const params = useParams();
  const role = (params?.role as string) || "student";

  return <CompareView role={role} />;
}
