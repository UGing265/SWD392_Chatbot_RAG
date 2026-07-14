"use client";

import { useMyDocuments } from "@/hooks/lecturer/use-my-documents";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconDatabaseImport,
  IconEdit,
  IconEye,
  IconFileText,
  IconListSearch,
  IconSortAscending,
  IconSortDescending,
  IconUsers,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { DocumentFilters } from "../../common/documents/document-filters";
import { DocumentDetailPanel } from "./document-detail-panel";
import { InlineDocumentEdit } from "./inline-document-edit";
import { UploadModal } from "./upload-modal";

const getStatusDot = (status: string) => {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-zinc-500 w-1.5 h-1.5" /> Chờ xử lý
      </span>
    );
  if (status === "active" || status === "ready" || status === "completed")
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-emerald-500 w-1.5 h-1.5" /> Hoàn tất
      </span>
    );
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 text-xs bg-blue-50 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-blue-500 w-1.5 h-1.5" /> Đang xử lý
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-md whitespace-nowrap">
      <div className="rounded-full bg-red-500 w-1.5 h-1.5" /> Lỗi
    </span>
  );
};

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
    handleDelete,
  } = useMyDocuments();

  const [activeTab, setActiveTab] = useState<"overview" | "detail">("overview");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "sidebar">("list");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentSlug, setSelectedDocumentSlug] = useState<string | null>(null);
  const [uploadModalOpened, setUploadModalOpened] = useState(false);

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<{ id: string; slug: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSort = (field: string) => {
    const isAsc = sortBy === `${field}_asc`;
    updateFilters({ sortBy: isAsc ? `${field}_desc` : `${field}_asc` });
  };

  const renderSortIcon = (field: string) => {
    if (sortBy === `${field}_asc`)
      return <IconSortAscending size={14} className="ml-1 text-zinc-600 inline" />;
    if (sortBy === `${field}_desc`)
      return <IconSortDescending size={14} className="ml-1 text-zinc-600 inline" />;
    return <span className="text-zinc-300 ml-1 inline text-[10px]">▼</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === "detail" ? (
              <button
                onClick={() => setActiveTab("overview")}
                className="font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5 text-[15px]"
              >
                ← Quay lại danh sách
              </button>
            ) : (
              <>
                <IconUsers size={20} className="text-zinc-900" stroke={1.5} />
                <h1 className="font-bold text-zinc-900 tracking-tight text-lg">Tài Liệu Của Tôi</h1>
              </>
            )}
          </div>
          <div
            className={`flex items-center gap-2 overflow-x-auto py-1 w-full min-w-0 sm:w-auto sm:justify-end ${activeTab === "detail" ? "hidden" : ""}`}
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <Button
              variant="default"
              onClick={() => {
                clearFilters();
                setViewMode("list");
              }}
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm shrink-0 transition-colors"
            >
              Reset Filter Layout
            </Button>
            <Button
              variant="filled"
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm shrink-0 transition-colors !border-0"
              onClick={() => setUploadModalOpened(true)}
            >
              Thêm Tài Liệu
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full p-4 sm:p-6 lg:p-10 flex-1">
        {activeTab === "detail" && (
          <div className="mb-6">
            {selectedDocumentId ? (
              <DocumentDetailPanel documentId={selectedDocumentSlug!} role={role} />
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

            {/* Refined Modern Search & Filter Form */}
            <div className="animate-in fade-in duration-700 mb-6">
              <DocumentFilters
                viewMode={viewMode}
                setViewMode={setViewMode}
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
                  {viewMode === "list" && (
                    <Table
                      verticalSpacing="md"
                      horizontalSpacing="xl"
                      className="w-full border-collapse"
                      style={{ minWidth: 1000 }}
                    >
                      <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
                        <Table.Tr>
                          <Table.Th
                            className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[22%] py-3 text-xs whitespace-nowrap rounded-tl-xl cursor-pointer hover:bg-zinc-200/50 transition-colors select-none"
                            onClick={() => handleSort("title")}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 shrink-0"></div>
                              <span>Tên tài liệu {renderSortIcon("title")}</span>
                            </div>
                          </Table.Th>
                          <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[12%] py-3 text-xs whitespace-nowrap">
                            Môn Học
                          </Table.Th>
                          <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[10%] py-3 text-xs whitespace-nowrap">
                            Trạng thái
                          </Table.Th>
                          <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[14%] py-3 text-xs whitespace-nowrap">
                            Phân quyền
                          </Table.Th>
                          <Table.Th
                            className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[16%] py-3 text-xs whitespace-nowrap cursor-pointer hover:bg-zinc-200/50 transition-colors select-none"
                            onClick={() => handleSort("date")}
                          >
                            Ngày tạo {renderSortIcon("date")}
                          </Table.Th>
                          <Table.Th
                            className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[12%] py-3 text-xs whitespace-nowrap cursor-pointer hover:bg-zinc-200/50 transition-colors select-none"
                            onClick={() => handleSort("views")}
                          >
                            Lượt xem {renderSortIcon("views")}
                          </Table.Th>

                          <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[1%] py-3 text-xs text-left whitespace-nowrap rounded-tr-xl"></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {displayDocuments.map((item, index) => {
                          return (
                            <Table.Tr
                              key={item.id}
                              onClick={() => {
                                setSelectedDocumentId(item.id);
                                setSelectedDocumentSlug(item.slug || item.id);
                                setActiveTab("detail");
                              }}
                              className="group/row cursor-pointer hover:bg-zinc-50/50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] border-b border-zinc-100 last:border-0"
                            >
                              <Table.Td className="border-0 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                  <div className="min-w-0 flex items-center">
                                    <span
                                      className="block font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate text-sm"
                                      title={item.title}
                                    >
                                      {item.title || "Tài liệu không tên"}
                                    </span>
                                  </div>
                                </div>
                              </Table.Td>
                              <Table.Td className="border-0 whitespace-nowrap min-w-[200px]">
                                <div className="flex flex-col">
                                  <span className="text-zinc-900 font-bold text-sm">
                                    {item.subject_code || "Dùng chung"}
                                  </span>
                                  {item.subject_name && (
                                    <span
                                      className="text-zinc-500 font-medium text-xs truncate max-w-[200px]"
                                      title={item.subject_name}
                                    >
                                      {item.subject_name}
                                    </span>
                                  )}
                                </div>
                              </Table.Td>
                              <Table.Td className="border-0 whitespace-nowrap">
                                {getStatusDot(item.status)}
                              </Table.Td>
                              <Table.Td className="border-0 whitespace-nowrap">
                                <span className="text-zinc-500 font-medium text-xs">
                                  {item.visibility === "public"
                                    ? "Công khai"
                                    : item.visibility === "school_wide"
                                      ? "Nội bộ trường"
                                      : "Riêng tư"}
                                </span>
                              </Table.Td>
                              <Table.Td className="border-0 whitespace-nowrap">
                                <span className="text-zinc-500 font-medium text-xs">
                                  {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                </span>
                              </Table.Td>
                              <Table.Td className="border-0 whitespace-nowrap">
                                <span className="text-zinc-400 font-medium text-xs">
                                  {item.view_count || 0} lượt
                                </span>
                              </Table.Td>

                              <Table.Td className="border-0 whitespace-nowrap !pl-0">
                                <div className="flex items-center justify-start gap-1">
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    radius="md"
                                    className="text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors opacity-0 group-hover/row:opacity-100 w-7 h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingRowId(item.id);
                                    }}
                                  >
                                    <IconEdit size={16} stroke={1.5} />
                                  </ActionIcon>
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    radius="md"
                                    className="text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover/row:opacity-100 w-7 h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingDocument({ id: item.id, slug: item.slug || item.id, title: item.title });
                                    }}
                                  >
                                    <IconTrash size={16} stroke={1.5} />
                                  </ActionIcon>
                                </div>
                              </Table.Td>
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  )}

                  {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-6">
                      {displayDocuments.map((item, index) => {
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedDocumentId(item.id);
                              setSelectedDocumentSlug(item.slug || item.id);
                              setActiveTab("detail");
                            }}
                            className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-0.5"
                          >
                            <div className="w-full px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                              <div className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                                {item.subject_code || "CHUNG"}
                              </div>
                              <div className="scale-90 origin-top-right shrink-0">
                                {getStatusDot(item.status)}
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h3
                                className="font-semibold text-zinc-900 text-[13px] line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors"
                                title={item.title}
                              >
                                {item.title || "Tài liệu không tên"}
                              </h3>
                              {item.subject_name && (
                                <p
                                  className="text-zinc-500 text-xs line-clamp-1 mb-3"
                                  title={item.subject_name}
                                >
                                  {item.subject_name}
                                </p>
                              )}
                              <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-medium">
                                <span>{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                                <div className="flex items-center gap-1">
                                  <IconEye size={14} />
                                  <span>{item.view_count || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="absolute top-16 -mt-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              <UnstyledButton
                                className="bg-white hover:bg-zinc-50 text-zinc-700 p-1.5 rounded-lg shadow-sm border border-zinc-200/50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRowId(item.id);
                                }}
                              >
                                <IconEdit size={14} stroke={1.5} />
                              </UnstyledButton>
                              <UnstyledButton
                                className="bg-white hover:bg-red-50 text-zinc-700 hover:text-red-600 p-1.5 rounded-lg shadow-sm border border-zinc-200/50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingDocument({ id: item.id, slug: item.slug || item.id, title: item.title });
                                }}
                              >
                                <IconTrash size={14} stroke={1.5} />
                              </UnstyledButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {viewMode === "sidebar" && (
                    <div className="flex flex-col lg:flex-row gap-6 items-start p-6">
                      <div
                        className="w-full lg:w-[35%] xl:w-[30%] shrink-0 flex flex-col gap-2 max-h-[80vh] overflow-y-auto pr-2"
                        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                      >
                        {displayDocuments.map((item, index) => {
                          const safeIndex = index % 14;
                          const isSelected = selectedDocumentId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedDocumentId(item.id);
                                setSelectedDocumentSlug(item.slug || item.id);
                              }}
                              className={`group/sidebar-item relative flex gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? "bg-zinc-900 border-zinc-900 shadow-md" : "bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50"}`}
                            >
                              <div className="min-w-0 flex-1 pr-8">
                                <h4
                                  className={`text-[13px] font-semibold truncate mb-0.5 ${isSelected ? "text-white" : "text-zinc-900"}`}
                                >
                                  {item.title || "Tài liệu không tên"}
                                </h4>
                                <p
                                  className={`text-[11px] truncate uppercase tracking-wide font-medium ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}
                                >
                                  {item.subject_code || "CHUNG"} •{" "}
                                  <span className="normal-case tracking-normal">
                                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                                  </span>
                                </p>
                              </div>

                              <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover/sidebar-item:opacity-100 transition-opacity flex items-center gap-1">
                                <UnstyledButton
                                  className="bg-white hover:bg-zinc-50 text-zinc-700 p-1.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-zinc-200/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingRowId(item.id);
                                  }}
                                >
                                  <IconEdit size={14} stroke={1.5} />
                                </UnstyledButton>
                                <UnstyledButton
                                  className="bg-white hover:bg-red-50 text-zinc-700 hover:text-red-600 p-1.5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-zinc-200/80 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingDocument({ id: item.id, slug: item.slug || item.id, title: item.title });
                                  }}
                                >
                                  <IconTrash size={14} stroke={1.5} />
                                </UnstyledButton>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full lg:w-[65%] xl:w-[70%] bg-white rounded-2xl border border-zinc-200 shadow-sm min-h-[500px] overflow-hidden sticky top-6">
                        {selectedDocumentId ? (
                          <DocumentDetailPanel documentId={selectedDocumentSlug!} role={role} />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-zinc-400">
                            <IconFileText size={48} className="mb-4 text-zinc-200" stroke={1.5} />
                            <p className="font-medium text-[13px]">
                              Chọn một tài liệu để xem chi tiết
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            router.push(`/${role}/progress`);
          }}
        />

        <Modal
          opened={!!editingRowId}
          onClose={() => setEditingRowId(null)}
          withCloseButton={false}
          yOffset="10vh"
          size="50rem"
          radius="0"
          padding={0}
          classNames={{
            content: "!bg-transparent !shadow-none !border-0",
            inner: "!p-4 sm:!p-6",
          }}
          transitionProps={{
            transition: "fade",
            duration: 200,
          }}
        >
          {editingRowId && (
            <InlineDocumentEdit
              slug={documents.find((d) => d.id === editingRowId)?.slug || editingRowId}
              docId={editingRowId}
              subjects={subjects}
              documentTypes={documentTypes}
              languages={languages}
              documentSources={documentSources}
              onCancel={() => setEditingRowId(null)}
              onSave={() => {
                setEditingRowId(null);
                updateFilters({ page: page.toString() });
              }}
            />
          )}
        </Modal>

        <Modal
          opened={!!deletingDocument}
          onClose={() => !isDeleting && setDeletingDocument(null)}
          title={<span className="font-bold text-zinc-900 text-lg">Xác nhận xoá tài liệu</span>}
          yOffset="10vh"
          padding="lg"
          size="md"
          transitionProps={{ transition: "fade", duration: 200 }}
          classNames={{
            content: "!rounded-2xl !bg-white !transform-none",
            header: "!mb-2",
          }}
        >
          <Text size="sm" className="text-zinc-600" mb="xl">
            Bạn có chắc chắn muốn xoá tài liệu <span className="font-semibold text-zinc-900">"{deletingDocument?.title}"</span> không? Hành động này không thể hoàn tác.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              onClick={() => setDeletingDocument(null)}
              disabled={isDeleting}
              className="!rounded-lg !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 transition-colors"
            >
              Hủy
            </Button>
            <Button
              color="red"
              onClick={async () => {
                if (!deletingDocument) return;
                setIsDeleting(true);
                await handleDelete(deletingDocument.slug || deletingDocument.id);
                setIsDeleting(false);
                setDeletingDocument(null);
              }}
              loading={isDeleting}
              className="!rounded-lg !font-semibold !bg-red-600 hover:!bg-red-700 !text-white transition-colors"
            >
              Xoá tài liệu
            </Button>
          </Group>
        </Modal>
      </div>
    </div>
  );
}

// Trigger HMR
