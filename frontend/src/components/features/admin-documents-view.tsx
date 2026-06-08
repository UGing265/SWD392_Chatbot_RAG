"use client";

import { useState } from "react";
import {
  FolderOpen,
  Database,
  Zap,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DocStatus = "Ready" | "Processing" | "Failed";

type AdminDocument = {
  id: string;
  name: string;
  subject: string;
  subjectColor: string;
  owner: string;
  ownerInitials: string;
  uploadDate: string;
  format: string;
  status: DocStatus;
};

const documents: AdminDocument[] = [
  {
    id: "1",
    name: "Mechanics_Lec1.pdf",
    subject: "Physics",
    subjectColor: "bg-sky-100 text-sky-700",
    owner: "Dr. David Rossi",
    ownerInitials: "DR",
    uploadDate: "Oct 24, 2023",
    format: "PDF",
    status: "Ready",
  },
  {
    id: "2",
    name: "Final_Notes.docx",
    subject: "Economics",
    subjectColor: "bg-violet-100 text-violet-700",
    owner: "Sarah Miller",
    ownerInitials: "SM",
    uploadDate: "Oct 22, 2023",
    format: "DOCX",
    status: "Ready",
  },
  {
    id: "3",
    name: "Organic_Chem_Ch3.pdf",
    subject: "Chemistry",
    subjectColor: "bg-sky-100 text-sky-700",
    owner: "Dr. David Rossi",
    ownerInitials: "DR",
    uploadDate: "Oct 20, 2023",
    format: "PDF",
    status: "Processing",
  },
  {
    id: "4",
    name: "WWII_Timeline.pptx",
    subject: "History",
    subjectColor: "bg-violet-100 text-violet-700",
    owner: "Sarah Miller",
    ownerInitials: "SM",
    uploadDate: "Oct 18, 2023",
    format: "PPTX",
    status: "Failed",
  },
  {
    id: "5",
    name: "Giáo trình KTPM.pdf",
    subject: "Software Eng.",
    subjectColor: "bg-emerald-100 text-emerald-700",
    owner: "Minh An",
    ownerInitials: "MA",
    uploadDate: "Mar 12, 2025",
    format: "PDF",
    status: "Ready",
  },
  {
    id: "6",
    name: "Slide bài giảng W04.pptx",
    subject: "Software Eng.",
    subjectColor: "bg-emerald-100 text-emerald-700",
    owner: "Minh An",
    ownerInitials: "MA",
    uploadDate: "Mar 18, 2025",
    format: "PPTX",
    status: "Processing",
  },
];

const statusConfig: Record<
  DocStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  Ready: {
    label: "Ready",
    icon: CheckCircle2,
    className: "text-emerald-600",
  },
  Processing: {
    label: "Processing",
    icon: Loader2,
    className: "text-amber-600",
  },
  Failed: {
    label: "Failed",
    icon: AlertCircle,
    className: "text-red-600",
  },
};

const statCards = [
  {
    label: "Total Documents",
    value: "3,842",
    sub: "Across 24 subjects",
    icon: FolderOpen,
  },
  {
    label: "Storage Used",
    value: "84.2 GB",
    sub: "of 200 GB allocated",
    icon: Database,
    progress: 42,
  },
  {
    label: "Indexing Success",
    value: "98.2%",
    sub: "Across 12,402 pages",
    icon: Zap,
  },
];

export function AdminDocumentsView() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === documents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(documents.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Document Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor, re-index, and manage all uploaded course materials.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              {"progress" in card && card.progress !== undefined && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>
          <Button
            size="sm"
            className="gap-2 rounded-xl shadow-soft"
            disabled={selected.size === 0}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-index Selected
            {selected.size > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-[10px]">
                {selected.size}
              </span>
            )}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-5">
                <Checkbox
                  checked={selected.size === documents.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10 pr-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const status = statusConfig[doc.status];
              const StatusIcon = status.icon;
              return (
                <TableRow key={doc.id}>
                  <TableCell className="pl-5">
                    <Checkbox
                      checked={selected.has(doc.id)}
                      onCheckedChange={() => toggleOne(doc.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-foreground">{doc.name}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        doc.subjectColor,
                      )}
                    >
                      {doc.subject}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {doc.ownerInitials}
                      </div>
                      <span className="text-sm text-foreground">{doc.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{doc.uploadDate}</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {doc.format}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", status.className)}>
                      <StatusIcon
                        className={cn(
                          "h-4 w-4",
                          doc.status === "Processing" && "animate-spin",
                        )}
                      />
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end gap-1 border-t border-border/60 px-5 py-3">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium",
                p === 1
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          ))}
          <span className="px-1 text-xs text-muted-foreground">…</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted">
            321
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Indexing Status</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Documents are automatically processed through a multi-stage pipeline: upload → parse →
            chunk → embed → index. Each document is split into semantic chunks and converted into
            vector embeddings using gemini-embedding-001 (3072d). Indexed documents become searchable
            via the RAG retrieval engine.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Upload", "Parse", "Chunk", "Embed", "Index"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    i < 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{stage}</span>
                {i < 4 && <span className="text-muted-foreground/40">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
          <h3 className="text-sm font-semibold text-foreground">Quick Stats</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processing Now</span>
              <span className="text-lg font-bold tabular-nums text-amber-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Queued</span>
              <span className="text-lg font-bold tabular-nums text-primary">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Latency</span>
              <span className="text-lg font-bold tabular-nums text-emerald-600">142ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
