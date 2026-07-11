import {
  IconSearch,
  IconList,
  IconGridDots,
  IconLayoutSidebar,
  IconSortDescending,
  IconAdjustmentsHorizontal,
  IconX,
} from "@tabler/icons-react";
import { Select, UnstyledButton } from "@mantine/core";

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
}: DocumentFiltersProps) {
  const activeFiltersCount = [subjectId, documentTypeId, languageId, documentSourceId].filter(Boolean).length;

  return (
    <div className="mb-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out border-b border-zinc-100 pb-3">
      {/* Left: Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full xl:max-w-sm">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
            <IconSearch size={15} stroke={1.5} />
          </div>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search customer"
            className="w-full h-8 text-sm pl-9 pr-3 bg-white border border-zinc-200/80 focus-within:border-zinc-300 rounded-lg focus:outline-none focus:ring-0 text-zinc-900 placeholder:text-zinc-400 font-medium transition-all duration-300 shadow-sm"
          />
        </div>
      </form>

      {/* Right: Actions & Tags */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 w-full min-w-0 xl:w-auto xl:justify-end" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        
        {/* View Toggle Icons */}
        <div className="flex items-center gap-1.5 text-zinc-400 hidden lg:flex">
          <UnstyledButton className="p-1 hover:text-zinc-700 transition-colors"><IconList size={16} stroke={1.5} /></UnstyledButton>
          <UnstyledButton className="p-1 hover:text-zinc-700 transition-colors"><IconGridDots size={16} stroke={1.5} /></UnstyledButton>
          <UnstyledButton className="p-1 hover:text-zinc-700 transition-colors"><IconLayoutSidebar size={16} stroke={1.5} /></UnstyledButton>
        </div>

        <div className="w-px h-4 bg-zinc-200 mx-1 hidden lg:block"></div>

        {/* Sort Select */}
        <Select
          variant="unstyled"
          value={sortBy}
          onChange={(val) => updateFilters({ sortBy: val })}
          data={[
            { value: "date_desc", label: "Most recent" },
            { value: "date_asc", label: "Oldest" },
            { value: "title_asc", label: "Name A-Z" },
            { value: "title_desc", label: "Name Z-A" },
          ]}
          allowDeselect={false}
          leftSection={<IconSortDescending size={14} className="text-zinc-500" stroke={1.5} />}
          classNames={{
            input: "!h-8 !min-h-[32px] !text-[12px] !font-semibold !pl-7 !bg-transparent",
          }}
          className="!w-44"
        />

        {/* Filters Button */}
        <UnstyledButton
          className="flex items-center gap-1.5 !h-8 !text-[12px] !px-4 !py-0 !rounded-lg !font-semibold !text-zinc-600 hover:!bg-zinc-100 hover:!text-zinc-900 transition-colors !border !border-zinc-200/60 !shadow-sm"
        >
          <IconAdjustmentsHorizontal size={14} stroke={1.5} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </UnstyledButton>

        {/* Active Tags */}
        <div className="flex items-center gap-2.5 ml-2">
          {["$20,000+", "United States", "#Technologies"].map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1.5 !h-7 !text-xs px-2.5 rounded-lg bg-zinc-100/80 text-zinc-600 font-semibold tracking-tight select-none border border-zinc-200/50 hover:bg-zinc-200/50 transition-colors cursor-default"
            >
              {tag}
              <IconX size={12} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer" stroke={2} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
