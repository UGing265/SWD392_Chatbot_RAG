"use client";

import { useState, useEffect } from "react";
import {
  IconUpload,
  IconFilter,
  IconSearch,
  IconFileText,
  IconCircleCheck,
  IconAlertCircle,
  IconTrash,
  IconDownload,
  IconVideo,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconChevronRight,
  IconChevronDown,
  IconFile,
  IconFolderOpen,
  IconCalendar,
  IconBook,
} from "@tabler/icons-react";
import {
  Button,
  TextInput,
  Modal,
  Loader,
  Checkbox,
  Group,
  Stack,
  Text,
  Paper,
  ActionIcon,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { useLecturerDocuments } from "@/hooks/lecturer/use-documents";

export function DocumentsView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    step,
    setStep,
    selectedTerm,
    setSelectedTerm,
    selectedSubject,
    setSelectedSubject,
    selectedMaterialId,
    setSelectedMaterialId,
    selectedChapterIds,
    setSelectedChapterIds,
    selectedItemIds,
    setSelectedItemIds,
    materials,
    subjects,
    terms,
    isLoading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isAddSubjectModalOpen,
    setIsAddSubjectModalOpen,
    currentMaterial,
    setCurrentMaterial,
    newSubjectName,
    setNewSubjectName,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    isUploading,
    groupedTerms,
    filteredMaterials,
    activeMaterial,
    handleSaveSubject,
    handleDelete,
    handleSave,
    handleFileChange,
    handleBack,
  } = useLecturerDocuments();

  if (!mounted || isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader size="lg" color="blue" />
        <Text size="sm" c="dimmed" fw={500}>Đang tải dữ liệu...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50">
      <div className="container mx-auto max-w-5xl p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Group justify="space-between" align="center" gap="md" className="mb-4">
            <Group gap="md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-white shadow-lg">
                <IconFolderOpen size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-[#f8fafc] font-sans">Tài liệu riêng</h1>
                <Group gap="xs" className="text-sm font-semibold text-gray-500 mt-1">
                  <span
                    className={`cursor-pointer hover:text-gray-900 transition-colors ${!selectedTerm ? "text-gray-900" : ""}`}
                    onClick={() => {
                      setSelectedTerm(null);
                      setSelectedSubject(null);
                      setStep("term");
                    }}
                  >
                    Tất cả năm học
                  </span>

                  {selectedTerm && (
                    <>
                      <IconChevronRight size={14} />
                      <span
                        className={`cursor-pointer hover:text-gray-900 transition-colors ${!selectedSubject ? "text-gray-900" : ""}`}
                        onClick={() => {
                          setSelectedSubject(null);
                          setStep("subject");
                        }}
                      >
                        Năm {selectedTerm?.year} - {selectedTerm?.name}
                      </span>
                    </>
                  )}

                  {selectedSubject && (
                    <>
                      <IconChevronRight size={14} />
                      <span
                        className={`cursor-pointer hover:text-gray-900 transition-colors ${step === "documents" ? "text-gray-900" : ""}`}
                        onClick={() => setStep("documents")}
                      >
                        {selectedSubject?.name}
                      </span>
                    </>
                  )}

                  {step === "chapters" && activeMaterial && (
                    <>
                      <IconChevronRight size={14} />
                      <span className="text-gray-900">Cấu trúc: {activeMaterial?.resource}</span>
                    </>
                  )}

                  {step === "viewing" && activeMaterial && (
                    <>
                      <IconChevronRight size={14} />
                      <span className="text-gray-900">Xem nội dung</span>
                    </>
                  )}
                </Group>
              </div>
            </Group>

            <Group gap="sm">
              {(selectedTerm || selectedSubject || step === "chapters" || step === "viewing") && (
                <Button
                  variant="outline"
                  color="gray"
                  onClick={handleBack}
                  radius="lg"
                >
                  Quay lại
                </Button>
              )}
              {selectedSubject && step === "documents" && (
                <Button
                  onClick={() => {
                    setCurrentMaterial({ subjectId: selectedSubject?.id || "" });
                    setIsUploadModalOpen(true);
                  }}
                  radius="lg"
                  color="dark"
                  leftSection={<IconPlus size={16} />}
                >
                  Tải lên tài liệu
                </Button>
              )}
            </Group>
          </Group>
        </div>

        {/* Level 1: Select Term */}
        {!selectedTerm ? (
          <div className="space-y-10">
            {terms.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-gray-150 shadow-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-300">
                  <IconCalendar size={40} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-700">Chưa có kỳ học nào</h3>
                <p className="text-gray-400 font-medium">Liên hệ quản trị viên để thêm kỳ học.</p>
              </div>
            ) : (
              Object.entries(groupedTerms)
                .sort((a, b) => {
                  const yearA = parseInt(a[0]) || 0;
                  const yearB = parseInt(b[0]) || 0;
                  return yearB - yearA;
                })
                .map(([year, yearTerms]) => (
                  <div key={year}>
                    <Group gap="xs" mb="md">
                      <IconCalendar size={20} className="text-zinc-500" />
                      <h2 className="text-lg font-bold tracking-tight text-[#111111]">
                        Năm học {year}
                      </h2>
                    </Group>
                    <div className="grid gap-4 md:grid-cols-3">
                      {yearTerms.map((term) => (
                        <Paper
                          key={term.id}
                          onClick={() => {
                            setSelectedTerm(term);
                            setStep("subject");
                          }}
                          withBorder
                          p="md"
                          radius="lg"
                          className="cursor-pointer hover:border-[#111111] hover:shadow-md transition-all group bg-white"
                        >
                          <Group gap="md">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                              <IconFolderOpen size={24} />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-800 group-hover:text-[#111111] transition-colors">
                                {term.name}
                              </h3>
                              <Text size="xs" c="dimmed" className="mt-0.5">Bấm để chọn kỳ học</Text>
                            </div>
                          </Group>
                        </Paper>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        ) : !selectedSubject ? (
          /* Level 2: Select Subject */
          <div>
            <Group gap="xs" mb="md">
              <IconBook size={20} className="text-zinc-500" />
              <h2 className="text-lg font-bold tracking-tight text-[#111111]">
                Chọn Môn Học
              </h2>
            </Group>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.filter((s) => s.termId === selectedTerm?.id).length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <IconBook size={40} className="text-gray-300 mx-auto mb-3" />
                  <Text c="dimmed" fw={500}>Chưa có môn học nào trong kỳ này.</Text>
                </div>
              )}
              {subjects
                .filter((s) => s.termId === selectedTerm?.id)
                .map((subject) => {
                  const docCount = materials.filter((m) => m.subjectId === subject.id).length;
                  return (
                    <Paper
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject);
                        setStep("documents");
                      }}
                      withBorder
                      p="md"
                      radius="lg"
                      className="cursor-pointer hover:border-[#111111] hover:shadow-md transition-all group bg-white"
                    >
                      <Group gap="md">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                          <IconBook size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-800 group-hover:text-[#111111] transition-colors line-clamp-2">
                            {subject.name}
                          </h3>
                          <Text size="xs" c="dimmed" className="mt-1">
                            {docCount > 0 ? `${docCount} tài liệu` : "Chưa có tài liệu"}
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                  );
                })}

              <Paper
                onClick={() => setIsAddSubjectModalOpen(true)}
                withBorder
                p="md"
                radius="lg"
                style={{ borderStyle: "dashed" }}
                className="cursor-pointer hover:border-[#111111] hover:bg-zinc-50 transition-all group bg-zinc-50/30"
              >
                <Group gap="md">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-150 text-gray-500 group-hover:bg-zinc-100 group-hover:text-gray-900 transition-colors">
                    <IconPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-600 group-hover:text-[#111111] transition-colors">
                      Thêm môn học
                    </h3>
                    <Text size="xs" c="dimmed" className="mt-1">Tạo môn học mới</Text>
                  </div>
                </Group>
              </Paper>
            </div>
          </div>
        ) : step === "documents" ? (
          /* Level 3: Documents List (Cards) */
          <div>
            {filteredMaterials.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-gray-150 shadow-sm animate-in fade-in duration-500">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-300">
                  <IconFileText size={40} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-700">Chưa có tài liệu nào</h3>
                <p className="text-gray-400 font-medium mb-6">
                  Bạn chưa tải lên tài liệu nào cho môn học này.
                </p>
                <Button
                  onClick={() => {
                    setCurrentMaterial({ subjectId: selectedSubject?.id || "" });
                    setIsUploadModalOpen(true);
                  }}
                  radius="lg"
                  color="dark"
                  leftSection={<IconPlus size={16} />}
                >
                  Tải lên tài liệu đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredMaterials.map((m) => (
                  <Paper
                    key={m.id}
                    withBorder
                    p="lg"
                    radius="lg"
                    className="group flex flex-col hover:shadow-lg transition-all duration-300 hover:border-zinc-800 bg-white"
                  >
                    <Group justify="space-between" align="start" mb="md">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-[#111111] group-hover:text-white">
                        <IconFileText size={28} />
                      </div>
                      <Badge
                        color={
                          m.status === "Ready"
                            ? "green"
                            : m.status === "Failed"
                              ? "red"
                              : "yellow"
                        }
                        variant="light"
                        radius="md"
                        py="sm"
                      >
                        {m.status}
                      </Badge>
                    </Group>

                    <Text fw={700} size="lg" className="mb-3 line-clamp-2 text-gray-900">
                      {m.resource}
                    </Text>

                    <Group gap="md" className="mb-5 text-sm text-gray-500">
                      <Group gap="xs">
                        <IconCalendar size={16} />
                        <Text size="sm">{m.date}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconFile size={16} />
                        <Text size="sm">{m.format}</Text>
                      </Group>
                    </Group>

                    <Group
                      justify="space-between"
                      align="center"
                      className="mt-auto pt-4"
                      style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
                    >
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          radius="md"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMaterial(m);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          radius="md"
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentMaterial(m);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                      <Button
                        onClick={() => {
                          setSelectedMaterialId(m.id);
                          setStep("chapters");
                        }}
                        variant="light"
                        color="dark"
                        radius="lg"
                        size="xs"
                      >
                        Cấu trúc
                      </Button>
                    </Group>
                  </Paper>
                ))}
              </div>
            )}
          </div>
        ) : step === "chapters" && activeMaterial ? (
          <div className="space-y-6">
            <Stack gap="md">
              {activeMaterial?.chapters.map((c) => (
                <Paper
                  key={c.id}
                  withBorder
                  radius="md"
                  className="bg-white overflow-hidden shadow-sm"
                >
                  <label className="flex items-center gap-4 p-4 border-b border-gray-100 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors">
                    <Checkbox
                      radius="lg"
                      color="dark"
                      size="sm"
                      checked={selectedChapterIds.has(c.id)}
                      onChange={() => {
                        const nextChapters = new Set(selectedChapterIds);
                        const nextItems = new Set(selectedItemIds);

                        if (nextChapters.has(c.id)) {
                          nextChapters.delete(c.id);
                          c.items.forEach((item) => nextItems.delete(item.id));
                        } else {
                          nextChapters.add(c.id);
                          c.items.forEach((item) => nextItems.add(item.id));
                        }

                        setSelectedChapterIds(nextChapters);
                        setSelectedItemIds(nextItems);
                      }}
                    />
                    <Text fw={700} className="text-gray-800 flex-1">{c.name}</Text>
                    <IconChevronDown size={16} className="text-gray-400" />
                  </label>
                  <div className="p-3 space-y-1">
                    {c.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-4 p-3 pl-12 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <Checkbox
                          radius="lg"
                          color="dark"
                          size="sm"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => {
                            const next = new Set(selectedItemIds);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            setSelectedItemIds(next);
                          }}
                        />
                        <Text size="sm" className="text-gray-500 group-hover:text-gray-800 transition-colors">
                          {item.name}
                        </Text>
                      </label>
                    ))}
                  </div>
                </Paper>
              ))}
            </Stack>
            <Group justify="flex-end" gap="sm" mt="lg">
              <Button
                variant="outline"
                color="gray"
                radius="lg"
                onClick={() => setStep("documents")}
              >
                Hủy
              </Button>
              <Button
                color="dark"
                radius="lg"
                onClick={() => setStep("viewing")}
                disabled={selectedChapterIds.size === 0 && selectedItemIds.size === 0}
              >
                Xác nhận lựa chọn
              </Button>
            </Group>
          </div>
        ) : step === "viewing" && activeMaterial ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Paper withBorder radius="lg" p={{ base: "xl", md: "12" }} bg="#ffffff" className="relative overflow-hidden shadow-sm">
              <div className="absolute top-0 inset-x-0 h-1 bg-[#111111]" />
              <div className="max-w-3xl mx-auto space-y-10">
                <div className="text-center space-y-3">
                  <Badge color="dark" size="sm" radius="lg">STUDY MATERIAL</Badge>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    {activeMaterial?.resource}
                  </h2>
                  <Group justify="center" gap="md" className="text-gray-400 text-sm">
                    <Group gap="xs">
                      <IconCalendar size={16} />
                      <Text size="sm">{activeMaterial?.date}</Text>
                    </Group>
                    <Text size="sm">•</Text>
                    <Group gap="xs">
                      <IconFile size={16} />
                      <Text size="sm">{activeMaterial?.format}</Text>
                    </Group>
                  </Group>
                </div>

                <div className="space-y-12">
                  {activeMaterial?.chapters
                    .filter(
                      (c) =>
                        selectedChapterIds.has(c.id) ||
                        c.items.some((i) => selectedItemIds.has(i.id)),
                    )
                    .map((c) => (
                      <section key={c.id} className="space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                          <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
                          <div className="h-1 w-12 bg-[#111111] rounded-full mt-2" />
                        </div>

                        <div className="space-y-8">
                          {c.items
                            .filter((i) => selectedItemIds.has(i.id))
                            .map((item) => (
                              <div key={item.id} className="space-y-4">
                                <h4 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                                  <IconPlus size={16} /> {item.name}
                                </h4>
                                <div className="text-gray-600 leading-[1.8] text-sm space-y-3">
                                  <p>
                                    Nội dung chi tiết cho mục{" "}
                                    <span className="font-bold text-gray-800">"{item.name}"</span>{" "}
                                    đang được hệ thống RAG xử lý. Đây là kiến thức quan trọng nằm
                                    trong chương{" "}
                                    <span className="font-semibold text-gray-800">{c.name}</span>.
                                  </p>
                                  <p>
                                    Hệ thống StudyMate AI đang phân tích tài liệu để trích xuất các
                                    ý chính, định nghĩa quan trọng và ví dụ minh họa giúp sinh viên
                                    dễ dàng nắm bắt kiến thức một cách khoa học nhất.
                                  </p>
                                  <Paper withBorder radius="lg" p="md" bg="zinc-50" className="border-zinc-200">
                                    <Text size="sm" fs="italic" fw={500} c="zinc.8">
                                      "Kiến thức là nền tảng của sự phát triển. Việc nắm bắt các khái
                                      niệm cơ bản trong {item.name} sẽ là chìa khóa để giải quyết các
                                      bài tập phức tạp hơn sau này."
                                    </Text>
                                  </Paper>
                                </div>
                              </div>
                            ))}
                        </div>
                      </section>
                    ))}
                </div>
              </div>
            </Paper>
          </div>
        ) : null}

        {/* CRUD Modals */}
        <Modal
          opened={isUploadModalOpen || isEditModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? "Chỉnh sửa tài liệu" : "Tải lên tài liệu mới"}
          radius="2xl"
          centered
          overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
          size="md"
        >
          <Stack gap="md" py="md">
            {!isEditModalOpen && (
              <div>
                <Text size="sm" fw={700} mb="xs">Tài liệu tải lên</Text>
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px dashed var(--mantine-color-gray-3)",
                    borderRadius: "16px",
                    padding: "24px",
                    cursor: isUploading ? "not-allowed" : "pointer",
                    backgroundColor: selectedFile ? "var(--mantine-color-gray-0)" : "#ffffff",
                    transition: "all 150ms ease",
                    opacity: isUploading ? 0.5 : 1,
                  }}
                  className="hover:border-zinc-800"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    disabled={isUploading}
                  />
                  {selectedFile ? (
                    <Group gap="sm">
                      <div className="p-2 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                        <IconFile size={24} />
                      </div>
                      <div className="text-left">
                        <Text size="sm" fw={700} className="truncate max-w-[200px] text-gray-900">
                          {selectedFile?.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : "0"} MB
                        </Text>
                      </div>
                    </Group>
                  ) : (
                    <>
                      <IconUpload size={32} className="text-gray-400 mb-2" />
                      <Text size="sm" fw={600} className="text-gray-700 text-center">
                        Chọn tệp từ máy tính
                      </Text>
                      <Text size="xs" c="dimmed" mt={4}>
                        PDF, DOCX, XLSX (Tối đa 50MB)
                      </Text>
                    </>
                  )}
                </div>
              </div>
            )}
            <TextInput
              label="Tên tài liệu"
              value={currentMaterial?.resource || ""}
              onChange={(e) =>
                setCurrentMaterial((prev) => ({ ...prev, resource: e.target.value }))
              }
              placeholder="Ví dụ: Advanced Calculus Chapter 4"
              disabled={isUploading}
              radius="lg"
              styles={{ label: { fontWeight: 600, marginBottom: "4px" } }}
            />

            <div>
              <Text size="sm" fw={700} mb="xs">Cấu trúc đề mục</Text>
              <ScrollArea style={{ height: 250 }} offsetScrollbars>
                <Stack gap="md" p="xs">
                  {currentMaterial?.chapters?.map((ch, chIdx) => (
                    <Paper
                      key={chIdx}
                      withBorder
                      p="md"
                      radius="md"
                      bg="zinc-50/50"
                      className="space-y-3"
                    >
                      <Group gap="xs" align="center">
                        <TextInput
                          placeholder="Tên chương"
                          value={ch.name}
                          onChange={(e) => {
                            const newChapters = [...(currentMaterial?.chapters || [])];
                            newChapters[chIdx].name = e.target.value;
                            setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                          }}
                          disabled={isUploading}
                          style={{ flex: 1 }}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            const newChapters = currentMaterial?.chapters?.filter(
                              (_, i) => i !== chIdx,
                            );
                            setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                          }}
                          disabled={isUploading}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                      <Stack gap="xs" style={{ paddingLeft: "16px" }}>
                        {ch.items.map((item, itemIdx) => (
                          <Group key={itemIdx} gap="xs">
                            <TextInput
                              placeholder="Tên mục nhỏ"
                              value={item.name}
                              onChange={(e) => {
                                const newChapters = [...(currentMaterial?.chapters || [])];
                                newChapters[chIdx].items[itemIdx].name = e.target.value;
                                setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                              }}
                              disabled={isUploading}
                              style={{ flex: 1 }}
                              size="xs"
                            />
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => {
                                const newChapters = [...(currentMaterial?.chapters || [])];
                                newChapters[chIdx].items = newChapters[chIdx].items.filter(
                                  (_, i) => i !== itemIdx,
                                );
                                setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                              }}
                              disabled={isUploading}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        ))}
                        <Button
                          variant="outline"
                          size="xs"
                          radius="lg"
                          onClick={() => {
                            const newChapters = [...(currentMaterial?.chapters || [])];
                            newChapters[chIdx].items.push({
                              id: Math.random().toString(),
                              name: "",
                            });
                            setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                          }}
                          disabled={isUploading}
                          w="fit-content"
                        >
                          + Thêm mục nhỏ
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                  <Button
                    variant="outline"
                    radius="lg"
                    style={{ borderStyle: "dashed" }}
                    onClick={() => {
                      const newChapters = [
                        ...(currentMaterial?.chapters || []),
                        { id: Math.random().toString(), name: "", items: [] },
                      ];
                      setCurrentMaterial((prev) => ({ ...prev, chapters: newChapters }));
                    }}
                    disabled={isUploading}
                    fullWidth
                  >
                    + Thêm chương mới
                  </Button>
                </Stack>
              </ScrollArea>
            </div>
          </Stack>
          <Group justify="flex-end" gap="sm" mt="xl">
            <Button
              variant="outline"
              color="gray"
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
              }}
              disabled={isUploading}
              radius="lg"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUploading}
              radius="lg"
              color="dark"
            >
              {isUploading ? (
                <Group gap="xs">
                  <Loader size="xs" color="white" />
                  <Text size="sm" fw={600}>Đang xử lý...</Text>
                </Group>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </Group>
        </Modal>

        <Modal
          opened={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Xác nhận xóa tài liệu"
          radius="2xl"
          centered
          overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
        >
          <Stack gap="md" py="md">
            <Text size="sm">
              Bạn có chắc chắn muốn xóa tài liệu{" "}
              <span className="font-bold text-gray-900">{currentMaterial?.resource}</span>? Hành
              động này không thể hoàn tác.
            </Text>
          </Stack>
          <Group justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setIsDeleteModalOpen(false)}
              radius="lg"
            >
              Hủy
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              radius="lg"
              fw={700}
            >
              Xác nhận xóa
            </Button>
          </Group>
        </Modal>

        <Modal
          opened={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          title="Thêm môn học mới"
          radius="2xl"
          centered
          overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
        >
          <Stack gap="md" py="md">
            <Text size="xs" c="dimmed">
              Nhập tên môn học bạn muốn giảng dạy. Tài liệu sẽ được tổ chức theo từng môn học này.
            </Text>
            <TextInput
              label="Tên môn học"
              placeholder="Ví dụ: Biology, Chemistry, v.v."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              radius="lg"
              styles={{ label: { fontWeight: 600, marginBottom: "4px" } }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveSubject()}
            />
          </Stack>
          <Group justify="flex-end" gap="sm" mt="lg">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setIsAddSubjectModalOpen(false)}
              radius="lg"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveSubject}
              radius="lg"
              color="dark"
              fw={700}
            >
              Xác nhận
            </Button>
          </Group>
        </Modal>
      </div>
    </div>
  );
}
