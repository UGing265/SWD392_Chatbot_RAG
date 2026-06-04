"use client";

import { useState } from "react";
import { Search, MoreVertical, LayoutGrid, List, FileText, Brain, FileType2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects = ["All Subjects", "Machine Learning", "Biology", "Computer Science"];

const documents = [
  {
    id: "1",
    title: "Neural Networks Fundamentals",
    desc: "Lecture slides week 3-5.",
    status: "Indexed",
    size: "2.4 MB",
    type: "PDF",
    icon: Brain,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-100",
  },
  {
    id: "2",
    title: "Cellular Respiration...",
    desc: "Study guide and diagrams.",
    status: "Processing",
    size: "1.1 MB",
    type: "DOCX",
    icon: FileType2,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-100",
  },
  {
    id: "3",
    title: "Gradient Descent Optimization",
    desc: "Research paper analysis.",
    status: "Indexed",
    size: "4.5 MB",
    type: "PDF",
    icon: Brain,
    iconColor: "text-blue-500",
    bgIcon: "bg-blue-100",
  },
  {
    id: "4",
    title: "Scanned Notes - Biology",
    desc: "Illegible handwriting detected.",
    status: "Error",
    size: "8.2 MB",
    type: "JPG",
    icon: FileText,
    iconColor: "text-red-500",
    bgIcon: "bg-red-100",
  },
];

export function StudentDocumentsView() {
  const [activeSubject, setActiveSubject] = useState("All Subjects");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Documents</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage and index your study materials.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold",
              viewMode === "grid" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold",
              viewMode === "list" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            List View
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeSubject === sub
                ? "bg-[#3e8ced] text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {sub}
          </button>
        ))}
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-soft transition-all hover:shadow-md",
                  doc.status === "Error" && "border-red-200"
                )}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      doc.bgIcon
                    )}
                  >
                    <Icon className={cn("h-5 w-5", doc.iconColor)} />
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <h3 className="mb-1 text-base font-bold leading-tight text-foreground line-clamp-2">
                  {doc.title}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground line-clamp-2">
                  {doc.desc}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      doc.status === "Indexed"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "Processing"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-600"
                    )}
                  >
                    {doc.status === "Indexed" && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                    {doc.status === "Processing" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {doc.status === "Error" && <AlertCircle className="h-3 w-3" />}
                    {doc.status}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {doc.size} • {doc.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft text-center text-muted-foreground">
          List view is not shown in the mockup, but would be implemented here.
        </div>
      )}
    </div>
  );
}
