"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconBook,
  IconChevronRight,
  IconEye,
  IconListSearch,
  IconSearch,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  Group,
  Pagination,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useSharedDocuments } from "@/hooks/lecturer/use-shared-documents";

type SubjectSortMode = "access-desc" | "name-asc" | "name-desc";

const subjectSortOptions = [
  { label: "Lượt xem nhiều", value: "access-desc" },
  { label: "A-Z", value: "name-asc" },
  { label: "Z-A", value: "name-desc" },
];

function getCardSpanClass(index: number) {
  const pattern = index % 9;
  switch (pattern) {
    case 0:
    case 1:
      return "md:col-span-1 xl:col-span-3"; // 3 + 3 = 6
    case 2:
      return "md:col-span-1 xl:col-span-2";
    case 3:
      return "md:col-span-1 xl:col-span-4"; // 2 + 4 = 6
    case 4:
      return "md:col-span-1 xl:col-span-4";
    case 5:
      return "md:col-span-1 xl:col-span-2"; // 4 + 2 = 6
    default:
      return "md:col-span-1 xl:col-span-2"; // 2 + 2 + 2 = 6
  }
}

export function SharedDocumentsView() {
  const {
    role,
    loading,
    documents,
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
    subjectAccessCounts,
  } = useSharedDocuments();

  const [subjectSortMode, setSubjectSortMode] = useState<SubjectSortMode>("access-desc");

  const isSearchMode = !!q || !!documentTypeId || !!languageId || !!documentSourceId;
  const isSubjectMode = !!subjectId;
  const isRootMode = !isSubjectMode && !isSearchMode;

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aAccess = subjectAccessCounts[a.id] || 0;
      const bAccess = subjectAccessCounts[b.id] || 0;
      const aName = `${a.name} ${a.code}`;
      const bName = `${b.name} ${b.code}`;

      if (subjectSortMode === "access-desc") {
        return bAccess - aAccess || aName.localeCompare(bName, "vi");
      }

      if (subjectSortMode === "name-desc") {
        return bName.localeCompare(aName, "vi");
      }

      return aName.localeCompare(bName, "vi");
    });
  }, [subjectAccessCounts, subjectSortMode, subjects]);

  const totalAccess = sortedSubjects.reduce(
    (total, subject) => total + (subjectAccessCounts[subject.id] || 0),
    0,
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateFilters({ q: formData.get("q") as string, page: "1" });
  };

  return (
    <div className="relative w-full flex-1 bg-zinc-50 font-sans">
      <div className="container mx-auto max-w-6xl p-6 py-12">
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <Text
            size="xs"
            fw={600}
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500"
          >
            HỆ SINH THÁI
          </Text>
          <h1 className="mb-6 select-none font-serif text-[40px] tracking-[-0.03em] text-zinc-900">
            Khám Phá.
          </h1>

          <Group gap="xs" className="inline-flex px-0">
            <Text
              className="cursor-pointer font-medium transition-colors hover:text-[#111111]"
              c={isRootMode ? "#787774" : "#111111"}
              onClick={() => clearFilters()}
              size="sm"
            >
              Tất Cả Môn Học
            </Text>

            {(selectedSubject || isSearchMode) && (
              <IconChevronRight size={14} className="mx-1 text-[#EAEAEA]" />
            )}

            {isSearchMode && !subjectId ? (
              <Text size="sm" c="dimmed" fw={500}>
                Kết quả tìm kiếm: &quot;{q}&quot;
              </Text>
            ) : selectedSubject ? (
              <Text size="sm" c="dimmed" fw={500}>
                {selectedSubject.code}
              </Text>
            ) : null}
          </Group>
        </div>

        {isRootMode && (
          <div className="animate-in space-y-8 fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <Paper withBorder radius={24} p="lg" className="bg-white shadow-sm">
              <Group justify="space-between" align="center" gap="md">
                <Group gap="lg">
                  <div>
                    <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                      Tổng môn học
                    </Text>
                    <Text fw={800} className="font-serif text-[28px] leading-none text-zinc-900">
                      {subjects.length}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                      Tổng lượt xem
                    </Text>
                    <Text fw={800} className="font-serif text-[28px] leading-none text-zinc-900">
                      {totalAccess}
                    </Text>
                  </div>
                </Group>

                <SegmentedControl
                  value={subjectSortMode}
                  onChange={(value) => setSubjectSortMode(value as SubjectSortMode)}
                  data={subjectSortOptions}
                  radius="xl"
                  color="dark"
                  classNames={{ root: "bg-zinc-100", label: "font-medium" }}
                />
              </Group>
            </Paper>

            {sortedSubjects.length === 0 ? (
              <Paper
                withBorder
                radius={24}
                p="xl"
                className="border-dashed bg-white text-center shadow-sm"
              >
                <Stack align="center" gap="sm">
                  <ThemeIcon color="gray" variant="light" radius="xl" size={56}>
                    <IconBook size={28} />
                  </ThemeIcon>
                  <Text c="dimmed">Chưa có môn học nào để hiển thị.</Text>
                </Stack>
              </Paper>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                {sortedSubjects.map((subject, index) => {
                  const accessCount = subjectAccessCounts[subject.id] || 0;

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() =>
                        updateFilters({ subjectId: subject.id, termId: null, page: "1" })
                      }
                      className={`${getCardSpanClass(index)} group flex min-h-[178px] cursor-pointer flex-col rounded-[24px] border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-zinc-900/20`}
                    >
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                          <IconBook size={24} stroke={1.5} />
                        </div>
                        <Badge
                          variant="light"
                          color={index === 0 && accessCount > 0 ? "blue" : "dark"}
                          radius="xl"
                          className="font-mono"
                        >
                          #{index + 1}
                        </Badge>
                      </div>

                      <div className="min-w-0">
                        <Text
                          size="xs"
                          fw={700}
                          className="mb-2 font-mono uppercase tracking-widest text-zinc-500"
                        >
                          {subject.code || "NO CODE"}
                        </Text>
                        <h4 className="line-clamp-2 font-serif text-[24px] font-extrabold leading-tight text-zinc-900 group-hover:underline decoration-zinc-300 underline-offset-2">
                          {subject.name}
                        </h4>
                      </div>

                      <Group gap="xs" className="mt-auto pt-6">
                        <ThemeIcon color="dark" variant="light" radius="lg" size="sm">
                          <IconEye size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={700} className="text-zinc-700">
                          {accessCount} lượt xem
                        </Text>
                      </Group>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(isSubjectMode || isSearchMode) && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div className="mb-12 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
              <Stack gap="lg">
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
                  <div className="relative min-w-[200px] flex-1">
                    <IconSearch
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="q"
                      defaultValue={q}
                      placeholder="Tìm kiếm tài liệu..."
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-4 text-[14px] text-zinc-900 transition-colors focus:border-zinc-800 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-zinc-900 px-8 text-[14px] font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    Tìm Kiếm
                  </button>
                  {(q || subjectId || documentTypeId || languageId || documentSourceId) && (
                    <button
                      type="button"
                      onClick={() => clearFilters()}
                      className="h-12 rounded-2xl px-6 text-[14px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      Xóa lọc
                    </button>
                  )}
                </form>

                <Group gap="md" grow>
                  <Select
                    value={subjectId || null}
                    onChange={(val) => updateFilters({ subjectId: val, termId: null })}
                    placeholder="Tất cả môn học"
                    data={subjects.map((s) => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                    searchable
                    radius="lg"
                    clearable
                    styles={{ input: { borderColor: "#EAEAEA" } }}
                  />
                  <Select
                    value={documentTypeId || null}
                    onChange={(val) => updateFilters({ documentTypeId: val })}
                    placeholder="Tất cả học liệu"
                    data={documentTypes.map((t) => ({ value: t.id, label: t.name }))}
                    radius="lg"
                    clearable
                    styles={{ input: { borderColor: "#EAEAEA" } }}
                  />
                  <Select
                    value={languageId || null}
                    onChange={(val) => updateFilters({ languageId: val })}
                    placeholder="Tất cả ngôn ngữ"
                    data={languages.map((l) => ({ value: l.id, label: l.name }))}
                    radius="lg"
                    clearable
                    styles={{ input: { borderColor: "#EAEAEA" } }}
                  />
                  <Select
                    value={documentSourceId || null}
                    onChange={(val) => updateFilters({ documentSourceId: val })}
                    placeholder="Tất cả nguồn"
                    data={documentSources.map((s) => ({ value: s.id, label: s.name }))}
                    radius="lg"
                    clearable
                    styles={{ input: { borderColor: "#EAEAEA" } }}
                  />
                  <Select
                    value={sortBy}
                    onChange={(val) => updateFilters({ sortBy: val })}
                    data={[
                      { value: "date_desc", label: "Mới nhất trước" },
                      { value: "date_asc", label: "Cũ nhất trước" },
                      { value: "title_asc", label: "Tên A - Z" },
                      { value: "title_desc", label: "Tên Z - A" },
                      { value: "views_desc", label: "Nhiều lượt xem" },
                      { value: "views_asc", label: "Ít lượt xem" },
                    ]}
                    radius="lg"
                    allowDeselect={false}
                    styles={{ input: { borderColor: "#EAEAEA" } }}
                  />
                </Group>
              </Stack>
            </div>

            <div className="mb-6 flex items-end justify-between border-b border-zinc-200 pb-4">
              <h4 className="m-0 font-serif text-[18px] tracking-[-0.02em] text-zinc-900">
                Danh Sách
              </h4>
              <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                KẾT QUẢ: <span className="ml-1 font-bold text-zinc-900">{totalDocuments}</span>
              </Text>
            </div>

            <div
              className={`transition-opacity duration-300 ${loading ? "pointer-events-none opacity-50" : "opacity-100"
                }`}
            >
              {documents.length === 0 && !loading ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white py-24 text-center shadow-sm">
                  <div className="mb-4 flex justify-center text-zinc-300">
                    <IconListSearch size={40} stroke={1.5} />
                  </div>
                  <h5 className="mb-2 text-[15px] font-medium text-zinc-900">
                    Không tìm thấy tài liệu phù hợp
                  </h5>
                  <Text size="sm" className="mb-6 text-zinc-500">
                    Vui lòng thử từ khóa khác hoặc xóa bộ lọc.
                  </Text>
                  <Button variant="outline" color="dark" radius="xl" onClick={() => clearFilters()}>
                    Xóa Bộ Lọc
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {documents.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${role}/documents/${item.slug || item.id}`}
                      className="group flex flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <div className="flex-grow">
                        <div className="mb-6 flex items-start justify-between">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-zinc-700">
                            <IconBook size={20} stroke={1.5} />
                          </div>
                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            {item.subject_code || item.subject_name || "TÀI LIỆU"}
                          </span>
                        </div>

                        <h4 className="mb-3 line-clamp-2 font-serif text-[18px] font-bold leading-snug text-zinc-900 group-hover:underline decoration-zinc-300 underline-offset-2">
                          {item.title}
                        </h4>

                        <Text size="sm" className="mb-6 line-clamp-3 leading-relaxed text-zinc-500">
                          {item.preview_text ||
                            item.description ||
                            "Bản xem trước hiện chưa khả dụng. Bấm để xem chi tiết."}
                        </Text>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-zinc-100/80 pt-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            {item.owner_email ? item.owner_email[0] : "U"}
                          </div>
                          <div className="flex flex-col">
                            <span className="mb-0.5 font-sans text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                              Tác giả
                            </span>
                            <span className="max-w-[100px] truncate font-mono text-[12px] font-bold uppercase tracking-wider text-zinc-900">
                              {item.owner_email ? item.owner_email.split("@")[0] : "System"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="mb-0.5 font-sans text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            Ngày & View
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[12px] font-bold tracking-wider text-zinc-900">
                            <span>{new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
                            <span className="text-zinc-300">|</span>
                            <div className="flex items-center gap-1">
                              <IconEye size={12} stroke={2.5} />
                              <span>{item.view_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <Group justify="center" mt={48}>
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
          </div>
        )}
      </div>
    </div>
  );
}
