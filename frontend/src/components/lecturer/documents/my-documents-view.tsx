"use client";

import { useMyDocuments } from "@/hooks/lecturer/use-my-documents";
import { ActionIcon, Button, Group, Pagination, Table, Text } from "@mantine/core";
import {
  IconDatabaseImport,
  IconFileText,
  IconListSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { DocumentFilters } from "../../common/documents/document-filters";
import { DocumentDetailPanel } from "./document-detail-panel";
import { UploadModal } from "./upload-modal";

const getStatusDot = (index: number) => {
  // 0, 1, 2 = Pending
  // 3, 4, 5, 6, 7 = Active
  // 8+ = Ended
  if (index < 3)
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-zinc-500 w-1.5 h-1.5" /> Pending
      </span>
    );
  if (index >= 3 && index < 8)
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-emerald-500 w-1.5 h-1.5" /> Active
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-md whitespace-nowrap">
      <div className="rounded-full bg-red-500 w-1.5 h-1.5" /> Ended
    </span>
  );
};

const getAvatarGradient = (title: string, index: number) => {
  const gradients = [
    "from-rose-500 to-amber-400",
    "from-indigo-400 to-amber-300",
    "from-pink-500 to-violet-500",
    "from-blue-500 to-purple-400",
    "from-emerald-400 to-cyan-500",
    "from-fuchsia-400 to-rose-400",
    "from-violet-500 to-blue-400",
    "from-rose-400 to-orange-400",
    "from-cyan-400 to-blue-500",
    "from-amber-400 to-red-500",
    "from-blue-600 to-violet-600",
    "from-orange-400 to-pink-400",
    "from-purple-500 to-rose-400",
    "from-indigo-500 to-purple-500",
  ];
  return gradients[index % gradients.length];
};

// --- MOCK DATA ---
const MOCK_AMOUNTS = [
  "38,200 USD", "90,000 USD", "88,400 USD", "124,340 USD",
  "77,900 USD", "88,340 USD", "56,560 USD", "99,000 USD",
  "66,000 USD", "79,000 USD", "188,000 USD", "22,000 USD",
  "44,000 USD", "120,000 USD",
];
const MOCK_CONTACTS = [
  "Emma Johnson", "Michael Wilson", "Olivia Davis", "David Miller",
  "James Martinez", "Emily Garcia", "Chris Anderson", "Sophia Martinez",
  "Daniel Taylor", "Isabella Hernandez", "Ethan White", "Sarah Brown",
  "Ava Martinez", "Liam Robinson",
];
const MOCK_DOMAINS = [
  "neuratech", "cloudnova", "syncfusion", "quantumleap",
  "bytewave", "nexusiot", "zendata", "hypernet",
  "stellartech", "opticode", "fusioncore", "apexai",
  "terralink", "nanologic",
];
const MOCK_PHONES = [
  "(415) 555-0123", "(206) 555-0145", "(617) 555-0137", "(212) 555-0198",
  "(312) 555-0172", "(206) 555-0145", "(617) 555-0137", "(213) 555-0164",
  "(305) 555-0182", "(512) 555-0191", "(404) 555-0157", "(602) 555-0178",
  "(702) 555-0189", "(215) 555-0148",
];
const MOCK_ADDRESSES = [
  "34 Market Str", "13 Lake Union", "56 Cambridge", "9 Sunset Boul",
  "101 Ocean Dri", "2 Congress Av", "83 Peachtree", "48 Central Av",
  "988 Market St", "746 Colfax Av", "98 Riverwalk", "19 Congress A",
  "10 Main Street", "111 Paradise R",
];
const MOCK_COMPANY_NAMES = [
  "Neura Tech", "CloudNova", "SyncFusion", "Quantum Leap",
  "ByteWave", "Nexuslo", "ZenData", "HyperNet",
  "StellarTech", "OptiCode", "FusionCore", "ApexAI Systems",
  "TerraLink", "NanoLogic",
];

export function MyDocumentsView() {
  const {
    role,
    router,
    loading,
    documents,
    activeUploadJobs,
    totalDocuments,
    totalPages,
    page,
    q,
    subjectId,
    documentTypeId,
    languageId,
    documentSourceId,
    sortBy,
    updateFilters,
    clearFilters,
    subjects,
    documentTypes,
    languages,
    documentSources,
  } = useMyDocuments();

  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [uploadModalOpened, setUploadModalOpened] = useState(false);

  const displayDocuments = documents.filter(
    (item) => item.status !== "processing" && item.status !== "pending",
  );

  const displayedCount = Math.max(
    0,
    totalDocuments -
      documents.filter((d) => d.status === "processing" || d.status === "pending").length,
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ q: formData.get("q") as string, page: "1" });
  };

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconUsers size={20} className="text-zinc-900" stroke={1.5} />
            <h1 className="font-bold text-zinc-900 tracking-tight text-lg">Customers</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1 w-full min-w-0 sm:w-auto sm:justify-end" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            <Button
              variant="default"
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm shrink-0 transition-colors"
            >
              Edit view
            </Button>
            <Button
              variant="default"
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm shrink-0 transition-colors"
            >
              Import data
            </Button>
            <Button
              variant="filled"
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm shrink-0 transition-colors !border-0"
              onClick={() => setUploadModalOpened(true)}
            >
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full p-4 sm:p-6 lg:p-10 flex-1">

        {activeTab === "detail" && (
          <div className="mb-6">
            <div className="mb-4">
              <button
                onClick={() => setActiveTab("overview")}
                className="font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-sm"
              >
                ← Quay lại danh sách
              </button>
            </div>
            {selectedDocumentId ? (
              <DocumentDetailPanel documentId={selectedDocumentId} role={role} />
            ) : (
              <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl shadow-sm animate-in fade-in">
                <IconFileText size={48} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                <h3 className="font-bold text-zinc-900 mb-2 text-lg">Chưa chọn tài liệu</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  Vui lòng chọn một tài liệu ở tab Overview để xem chi tiết thông tin và nội dung.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "overview" && (
          <>
            {/* Active Upload Jobs Integration Panel */}
            {activeUploadJobs.length > 0 && (
              <div className="bg-zinc-900 text-white p-6 rounded-2xl border-none mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-100"></span>
                  </span>
                  <Text
                    size="xs"
                    fw={700}
                    className="text-zinc-400 tracking-widest uppercase font-mono text-xs"
                  >
                    Processing Island ({activeUploadJobs.length})
                  </Text>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeUploadJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white shrink-0">
                            <IconDatabaseImport size={16} stroke={1.5} className="animate-pulse" />
                          </div>
                          <div className="min-w-0">
                            <Text className="font-bold text-white truncate text-sm" fw={600}>
                              {job.file_name}
                            </Text>
                            <Text className="text-zinc-400 truncate text-xs">
                              {job.message || "Đang xử lý..."}
                            </Text>
                          </div>
                        </div>
                        <Text className="font-bold font-mono text-zinc-300 shrink-0 text-xs">
                          {job.progress_percent}%
                        </Text>
                      </div>

                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-zinc-500 to-zinc-100 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${job.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refined Modern Search & Filter Form */}
            <div className="animate-in fade-in duration-700 mb-6">
              <DocumentFilters
                q={q}
                subjectId={subjectId}
                documentTypeId={documentTypeId}
                languageId={languageId}
                documentSourceId={documentSourceId}
                sortBy={sortBy}
                subjects={subjects}
                documentTypes={documentTypes}
                languages={languages}
                documentSources={documentSources}
                updateFilters={updateFilters}
                clearFilters={clearFilters}
                handleSearchSubmit={handleSearchSubmit}
              />
            </div>

            {/* Table Area - Double Bezel Layout */}
            <div
              className={`bg-white border border-zinc-200/60 rounded-2xl overflow-hidden transition-all duration-700 shadow-[0_2px_12px_rgba(0,0,0,0.03)] ${loading ? "opacity-50 blur-sm pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-8`}
            >

              {displayDocuments.length === 0 && !loading ? (
                <div className="text-center py-24">
                  {q || subjectId ? (
                    <>
                      <IconListSearch
                        size={32}
                        className="mx-auto text-zinc-300 mb-4"
                        stroke={1.5}
                      />
                      <h5 className="font-medium text-zinc-900 mb-2 text-base">
                        Không tìm thấy tài liệu phù hợp.
                      </h5>
                      <button
                        className="mt-2 border border-zinc-200 text-zinc-700 font-semibold px-4 rounded-full hover:bg-zinc-50 transition-colors h-8 text-xs"
                        onClick={() => clearFilters()}
                      >
                        Xóa Bộ Lọc
                      </button>
                    </>
                  ) : (
                    <>
                      <IconFileText size={32} className="mx-auto text-zinc-300 mb-4" stroke={1.5} />
                      <h5 className="font-medium text-zinc-900 mb-2 text-base">
                        Chưa có tài liệu nào.
                      </h5>
                      <Text size="xs" className="text-zinc-500 mb-6">
                        Bạn chưa tải lên tài liệu nào trong thư viện cá nhân.
                      </Text>
                      <button
                        onClick={() => setUploadModalOpened(true)}
                        className="border border-transparent bg-zinc-900 text-white font-semibold px-4 rounded-full hover:bg-zinc-800 transition-colors h-8 text-xs"
                      >
                        Thêm Tài Liệu Mới
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="overflow-x-auto"
                  style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                >
                  <Table
                    verticalSpacing="md"
                    horizontalSpacing="xl"
                    className="w-full border-collapse"
                    style={{ minWidth: 1000 }}
                  >
                    <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
                      <Table.Tr>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[22%] py-3 text-xs whitespace-nowrap rounded-tl-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-8 shrink-0"></div>
                            <span>Customer <span className="text-zinc-300 ml-1">▼</span></span>
                          </div>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[12%] py-3 text-xs whitespace-nowrap">
                          Amount <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[10%] py-3 text-xs whitespace-nowrap">
                          Status <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[14%] py-3 text-xs whitespace-nowrap">
                          Contact <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[16%] py-3 text-xs whitespace-nowrap">
                          Email <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[12%] py-3 text-xs whitespace-nowrap">
                          Phone number <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[13%] py-3 text-xs whitespace-nowrap">
                          Address <span className="text-zinc-300 ml-1">▼</span>
                        </Table.Th>
                        <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[1%] py-3 text-xs text-left whitespace-nowrap rounded-tr-xl"></Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {displayDocuments.map((item, index) => {
                        const safeIndex = index % 14;

                        return (
                          <Table.Tr
                            key={item.id}
                            onClick={() => {
                              setSelectedDocumentId(item.id);
                              setActiveTab("detail");
                            }}
                            className="group cursor-pointer hover:bg-zinc-50/50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] border-b border-zinc-100 last:border-0"
                          >
                            <Table.Td className="border-0 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(item.title, safeIndex)} shadow-sm shrink-0`}
                                />
                                <div className="min-w-0 flex items-center">
                                  <span className="block font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate text-sm">
                                    {MOCK_COMPANY_NAMES[safeIndex]}
                                  </span>
                                </div>
                              </div>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">
                              <span className="text-zinc-500 font-medium font-sans text-xs">
                                {MOCK_AMOUNTS[safeIndex]}
                              </span>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">{getStatusDot(safeIndex)}</Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">
                              <span className="text-zinc-500 font-medium text-xs">
                                {MOCK_CONTACTS[safeIndex]}
                              </span>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">
                              <span className="text-zinc-500 font-medium lowercase text-xs">
                                {MOCK_CONTACTS[safeIndex].split(" ")[0]}@{MOCK_DOMAINS[safeIndex]}.com
                              </span>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">
                              <span className="text-zinc-400 font-medium text-xs">
                                {MOCK_PHONES[safeIndex]}
                              </span>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap">
                              <span className="text-zinc-400 font-medium text-xs">
                                {MOCK_ADDRESSES[safeIndex]}
                              </span>
                            </Table.Td>
                            <Table.Td className="border-0 whitespace-nowrap !pl-0">
                              <div className="flex items-center justify-start">
                                <ActionIcon
                                  variant="default"
                                  size="sm"
                                  radius="md"
                                  className="border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm w-6 h-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconSettings size={13} stroke={1.5} />
                                </ActionIcon>
                              </div>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center" mt={32} className="animate-in fade-in duration-700">
                <Pagination
                  value={page}
                  onChange={(p) => updateFilters({ page: p.toString() })}
                  total={totalPages}
                  radius="lg"
                  color="dark"
                  withEdges
                />
              </Group>
            )}
          </>
        )}

        <UploadModal
          opened={uploadModalOpened}
          onClose={() => setUploadModalOpened(false)}
          onSuccess={() => {
            updateFilters({ page: "1" });
          }}
        />
      </div>
    </div>
  );
}

// Trigger HMR

