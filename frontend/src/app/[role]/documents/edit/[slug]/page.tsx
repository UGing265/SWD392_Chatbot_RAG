"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditDocumentView } from "@/components/lecturer/documents/edit-document-view";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const role = params?.role as string;
  const slug = params?.slug as string;

  useEffect(() => {
    // Only lecturer/teacher can edit documents
    if (role && role !== "lecturer" && role !== "teacher") {
      router.replace(`/${role}/documents`);
    }
  }, [role, router]);

  if (!slug) return null;

  return <EditDocumentView slug={slug} />;
}
