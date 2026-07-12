import {
  IconSearch,
  IconList,
  IconGridDots,
  IconLayoutSidebar,
  IconSortDescending,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";
import { Select, MultiSelect, UnstyledButton, Drawer, Button, Stack, Group } from "@mantine/core";
import { useState, useEffect } from "react";

export interface DocumentFiltersProps {
  q: string;
  subjectId: string;
  documentTypeId: string;
  languageId: string;
  documentSourceId: string;
  sortBy: string;
  subjects: { id: string; code?: string; name?: string }[];
  documentTypes: { id: string; name: string }[];
  languages: { id: string; name: string }[];
  documentSources: { id: string; name: string }[];
  updateFilters: (filters: Record<string, string | null>) => void;
  clearFilters: () => void;
  handleSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  viewMode?: "list" | "grid" | "sidebar";
  setViewMode?: (mode: "list" | "grid" | "sidebar") => void;
}

export function DocumentFilters({
  q,
  subjectId,
  documentTypeId,
  languageId,
  documentSourceId,
  sortBy,
  subjects,
  documentTypes,
  languages,
  documentSources,
  updateFilters,
  clearFilters,
  handleSearchSubmit,
  viewMode = "list",
  setViewMode,
}: DocumentFiltersProps) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Local state for MultiSelect
  const [localSubjectIds, setLocalSubjectIds] = useState<string[]>([]);
  const [localDocumentTypeIds, setLocalDocumentTypeIds] = useState<string[]>([]);
  const [localLanguageIds, setLocalLanguageIds] = useState<string[]>([]);
  const [localDocumentSourceIds, setLocalDocumentSourceIds] = useState<string[]>([]);

  // Sync props to local state when drawer opens or props change
  useEffect(() => {
    setLocalSubjectIds(subjectId ? subjectId.split(',') : []);
    setLocalDocumentTypeIds(documentTypeId ? documentTypeId.split(',') : []);
    setLocalLanguageIds(languageId ? languageId.split(',') : []);
    setLocalDocumentSourceIds(documentSourceId ? documentSourceId.split(',') : []);
  }, [subjectId, documentTypeId, languageId, documentSourceId, isFilterDrawerOpen]);

  const activeFiltersCount = [subjectId, documentTypeId, languageId, documentSourceId].filter(Boolean).length;

  const handleApply = () => {
    updateFilters({
      subjectId: localSubjectIds.length > 0 ? localSubjectIds.join(',') : null,
      documentTypeId: localDocumentTypeIds.length > 0 ? localDocumentTypeIds.join(',') : null,
      languageId: localLanguageIds.length > 0 ? localLanguageIds.join(',') : null,
      documentSourceId: localDocumentSourceIds.length > 0 ? localDocumentSourceIds.join(',') : null,
    });
    setIsFilterDrawerOpen(false);
  };

  const inputClasses = {
    input: "!bg-white focus:!bg-white !border-black/10 hover:!border-black/20 focus:!border-black/20 focus:!shadow-sm !rounded-lg transition-all duration-300 !h-10 !pl-4 !flex !items-center !text-[13px] !font-medium",
    label: "!font-semibold !text-zinc-400 !capitalize !tracking-wide !font-sans !text-xs !mb-1.5",
    dropdown: "!rounded-xl !border-0 !ring-1 !ring-black/5 !shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] !p-2 !bg-white/95 !backdrop-blur-2xl",
    option: "!rounded-lg data-[hovered]:!bg-zinc-100/80 data-[selected]:!bg-zinc-100 data-[selected]:!text-zinc-900 !text-[13px] !font-semibold transition-all duration-200 !px-4 !py-2 !mb-0.5 last:!mb-0",
    pill: "!hidden",
    pillsList: "!gap-0"
  };

  return (
    <div className="mb-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out border-b border-zinc-100 pb-3">
      {/* Left: Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full xl:max-w-sm">
        <div className="relative flex items-center h-8 bg-white border border-zinc-200/80 focus-within:border-zinc-300 rounded-lg shadow-sm overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-center pl-3.5 pr-2 text-zinc-400 pointer-events-none shrink-0">
            <IconSearch size={15} stroke={1.5} />
          </div>
          <input
            key={q}
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm tài liệu..."
            className="flex-1 h-full min-w-0 text-[13px] pr-3 bg-transparent border-none focus:outline-none focus:ring-0 text-zinc-900 placeholder:text-zinc-400 placeholder:text-[13px] font-medium leading-[32px] py-0"
          />
        </div>
      </form>

      {/* Right: Actions & Tags */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 w-full min-w-0 xl:w-auto xl:justify-end" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        
        {/* View Toggle Icons - only shown when setViewMode is provided */}
        {setViewMode && (
          <>
            <div className="flex items-center gap-1.5 text-zinc-400 hidden lg:flex">
              <UnstyledButton 
                onClick={() => setViewMode("list")}
                className={`p-1 transition-colors rounded ${viewMode === "list" ? "text-zinc-900 bg-zinc-100 border border-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700 border border-transparent"}`}
              >
                <IconList size={16} stroke={1.5} />
              </UnstyledButton>
              <UnstyledButton 
                onClick={() => setViewMode("grid")}
                className={`p-1 transition-colors rounded ${viewMode === "grid" ? "text-zinc-900 bg-zinc-100 border border-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700 border border-transparent"}`}
              >
                <IconGridDots size={16} stroke={1.5} />
              </UnstyledButton>
              <UnstyledButton 
                onClick={() => setViewMode("sidebar")}
                className={`p-1 transition-colors rounded ${viewMode === "sidebar" ? "text-zinc-900 bg-zinc-100 border border-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700 border border-transparent"}`}
              >
                <IconLayoutSidebar size={16} stroke={1.5} />
              </UnstyledButton>
            </div>
            <div className="w-px h-4 bg-zinc-200 mx-1 hidden lg:block"></div>
          </>
        )}

        {/* Sort Dropdown */}
        <Select
          value={sortBy || "date_desc"}
          onChange={(val) => updateFilters({ sortBy: val })}
          data={[
            { value: "date_desc", label: "Mới nhất" },
            { value: "date_asc", label: "Cũ nhất" },
            { value: "title_asc", label: "Tên A - Z" },
            { value: "title_desc", label: "Tên Z - A" },
            { value: "views_desc", label: "Nhiều view" },
          ]}
          allowDeselect={false}
          leftSection={<IconSortDescending size={14} className="text-zinc-400" stroke={1.5} />}
          classNames={{
            input: "!bg-white !border-zinc-200/60 hover:!border-zinc-300 focus:!border-zinc-400 !rounded-lg !h-8 !min-h-[32px] !text-[12px] !font-sans !font-semibold !text-zinc-800 !shadow-sm !transition-colors",
            dropdown: "!bg-white/95 !backdrop-blur-xl !border !border-zinc-200 !rounded-xl !shadow-xl !py-1.5",
            option: "!rounded-lg data-[hovered]:!bg-zinc-50 data-[selected]:!bg-zinc-100 data-[selected]:!text-zinc-900 !text-[12px] !font-sans !font-semibold !px-3 !py-2"
          }}
          styles={{ root: { width: 135, flexShrink: 0 } }}
        />

        {/* Filters Button */}
        <UnstyledButton
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center gap-1.5 !h-8 !text-[12px] !px-4 !py-0 !rounded-lg !font-semibold !text-zinc-600 hover:!bg-zinc-100 hover:!text-zinc-900 transition-colors !border !border-zinc-200/60 !shadow-sm relative"
        >
          <IconAdjustmentsHorizontal size={14} stroke={1.5} />
          Bộ Lọc
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
              {activeFiltersCount}
            </span>
          )}
        </UnstyledButton>
      </div>

      <Drawer
        opened={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title={<span className="font-bold text-zinc-900 text-lg">Bộ Lọc Tài Liệu</span>}
        position="right"
        padding="lg"
        size="md"
        classNames={{
          content: "!rounded-none flex flex-col",
          header: "!mb-2",
          body: "flex-1 flex flex-col",
        }}
      >
        <Stack gap="md" className="flex-1">
          <div className="relative">
            <MultiSelect
              label="Môn Học"
              placeholder="Chọn Môn Học..."
              data={subjects.map(s => {
                const label = s.name || s.code || "";
                return { value: s.id, label };
              })}
              value={localSubjectIds}
              onChange={(val) => {
                setLocalSubjectIds(val);
                (document.activeElement as HTMLElement)?.blur();
              }}
              clearable
              searchable
              hidePickedOptions
              classNames={inputClasses}
              comboboxProps={{ width: 'max-content', position: 'bottom-start' }}
              renderOption={({ option }) => {
                const parts = option.label.split(' - ');
                if (parts.length >= 2) {
                  const code = parts[0];
                  const name = parts.slice(1).join(' - ');
                  return (
                    <div className="flex flex-col gap-0.5 py-0.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{code}</span>
                      <span className="text-[13px] font-semibold whitespace-nowrap">{name}</span>
                    </div>
                  );
                }
                return <span className="whitespace-nowrap">{option.label}</span>;
              }}
            />
            {localSubjectIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {localSubjectIds.map(id => {
                  const s = subjects.find(s => s.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-[11.5px] font-semibold px-2.5 py-1 rounded-md border border-zinc-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <span className="truncate max-w-[200px]">{s?.code ? s.code : s?.name}</span>
                      <IconX size={12} className="cursor-pointer opacity-50 hover:opacity-100 hover:text-red-500 shrink-0 transition-colors" onClick={() => setLocalSubjectIds(prev => prev.filter(v => v !== id))} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <MultiSelect
              label="Loại Tài Liệu"
              placeholder="Chọn Loại Tài Liệu..."
              data={documentTypes.map(t => ({ value: t.id, label: t.name }))}
              value={localDocumentTypeIds}
              onChange={(val) => {
                setLocalDocumentTypeIds(val);
                (document.activeElement as HTMLElement)?.blur();
              }}
              clearable
              searchable
              hidePickedOptions
              classNames={inputClasses}
            />
            {localDocumentTypeIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {localDocumentTypeIds.map(id => {
                  const t = documentTypes.find(t => t.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-[11.5px] font-semibold px-2.5 py-1 rounded-md border border-zinc-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <span className="truncate max-w-[200px]">{t?.name}</span>
                      <IconX size={12} className="cursor-pointer opacity-50 hover:opacity-100 hover:text-red-500 shrink-0 transition-colors" onClick={() => setLocalDocumentTypeIds(prev => prev.filter(v => v !== id))} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <MultiSelect
              label="Ngôn Ngữ"
              placeholder="Chọn Ngôn Ngữ..."
              data={languages.map(l => ({ value: l.id, label: l.name }))}
              value={localLanguageIds}
              onChange={(val) => {
                setLocalLanguageIds(val);
                (document.activeElement as HTMLElement)?.blur();
              }}
              clearable
              searchable
              hidePickedOptions
              classNames={inputClasses}
            />
            {localLanguageIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {localLanguageIds.map(id => {
                  const l = languages.find(l => l.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-[11.5px] font-semibold px-2.5 py-1 rounded-md border border-zinc-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <span className="truncate max-w-[200px]">{l?.name}</span>
                      <IconX size={12} className="cursor-pointer opacity-50 hover:opacity-100 hover:text-red-500 shrink-0 transition-colors" onClick={() => setLocalLanguageIds(prev => prev.filter(v => v !== id))} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <MultiSelect
              label="Nguồn Tài Liệu"
              placeholder="Chọn Nguồn Tài Liệu..."
              data={documentSources.map(s => ({ value: s.id, label: s.name }))}
              value={localDocumentSourceIds}
              onChange={(val) => {
                setLocalDocumentSourceIds(val);
                (document.activeElement as HTMLElement)?.blur();
              }}
              clearable
              searchable
              hidePickedOptions
              classNames={inputClasses}
            />
            {localDocumentSourceIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {localDocumentSourceIds.map(id => {
                  const ds = documentSources.find(ds => ds.id === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-[11.5px] font-semibold px-2.5 py-1 rounded-md border border-zinc-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                      <span className="truncate max-w-[200px]">{ds?.name}</span>
                      <IconX size={12} className="cursor-pointer opacity-50 hover:opacity-100 hover:text-red-500 shrink-0 transition-colors" onClick={() => setLocalDocumentSourceIds(prev => prev.filter(v => v !== id))} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Stack>

        <Group grow mt="auto" pt="md" className="border-t border-black/5 shrink-0">
          <Button 
            variant="default" 
            onClick={() => {
              clearFilters();
              setIsFilterDrawerOpen(false);
            }}
            className="!h-10 !rounded-lg !text-[13px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm transition-colors"
          >
            Xóa Bộ Lọc
          </Button>
          <Button 
            onClick={handleApply}
            className="!h-10 !rounded-lg !text-[13px] !font-semibold !bg-zinc-900 hover:!bg-zinc-800 !text-white !shadow-sm !border-0 transition-colors"
          >
            Áp Dụng
          </Button>
        </Group>
      </Drawer>
    </div>
  );
}
