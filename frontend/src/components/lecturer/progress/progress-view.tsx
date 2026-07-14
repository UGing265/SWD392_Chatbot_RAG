"use client";

import { useEffect, useState } from "react";
import { ragApi } from "@/api/client";
import { Table, Progress, Button, Text, ActionIcon, MultiSelect, TextInput } from "@mantine/core";
import { IconRefresh, IconFile, IconCheck, IconX, IconLoader2, IconActivity, IconSearch } from "@tabler/icons-react";

export interface UploadJob {
  id: string;
  file_name: string;
  status: string;
  progress_percent: number;
  message?: string;
  created_at: string;
  updated_at: string;
}

const getStatusDot = (status: string) => {
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-xs bg-zinc-100 px-2.5 py-1 rounded-md whitespace-nowrap">
        <div className="rounded-full bg-zinc-500 w-1.5 h-1.5" /> Chờ xử lý
      </span>
    );
  if (status === "completed" || status === "active" || status === "ready" || status === "done")
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <IconFile size={18} className="text-zinc-400" stroke={1.5} />;
    case "processing":
      return <IconLoader2 size={18} className="text-blue-500 animate-spin" stroke={1.5} />;
    case "completed":
    case "active":
    case "ready":
    case "done":
      return <IconCheck size={18} className="text-emerald-500" stroke={1.5} />;
    case "failed":
      return <IconX size={18} className="text-red-500" stroke={1.5} />;
    default:
      return <IconFile size={18} className="text-zinc-400" stroke={1.5} />;
  }
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;
    const distance = value - displayValue;
    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    const stepValue = distance / steps;
    
    let current = displayValue;
    let stepCount = 0;
    
    const interval = setInterval(() => {
      stepCount++;
      current += stepValue;
      setDisplayValue(Math.round(current));
      if (stepCount >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [value, displayValue]);

  return <>{displayValue}</>;
};

export function ProgressView() {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const fetchJobs = async () => {
    try {
      const res = await ragApi.get("/documents/upload-jobs");
      setJobs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch upload jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const activeJobsCount = jobs.filter(j => j.status === "pending" || j.status === "processing").length;

  useEffect(() => {
    if (activeJobsCount === 0) return;
    
    // Poll every 3 seconds ONLY if there are active jobs
    const intervalId = setInterval(() => {
      fetchJobs();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeJobsCount]);

  const displayJobs = jobs.filter(job => {
    const matchQ = job.file_name.toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter.length === 0 || 
      statusFilter.includes(job.status) || 
      (job.status === "done" || job.status === "ready" || job.status === "active" ? statusFilter.includes("completed") : false);
    return matchQ && matchStatus;
  }); 

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <IconActivity size={20} className="text-zinc-900" stroke={1.5} />
            <h1 className="font-bold text-zinc-900 tracking-tight text-lg">Tiến Trình Xử Lý</h1>
          </div>
          <div
            className="flex items-center gap-2 overflow-x-auto py-1 w-full min-w-0 sm:w-auto sm:justify-end"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <Button
              variant="default"
              onClick={fetchJobs}
              loading={loading}
              leftSection={<IconRefresh size={14} />}
              className="!h-8 !px-4 !rounded-lg !text-[12px] !font-semibold !text-zinc-700 hover:!bg-zinc-50 !border-zinc-200 !shadow-sm shrink-0 transition-colors"
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full bg-zinc-50/50">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 w-full mx-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          
          <div className="mb-6 flex flex-col xl:flex-row xl:items-center gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out border-b border-zinc-100 pb-3">
            <div className="relative w-full xl:max-w-sm">
              <TextInput
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
                placeholder="Tìm kiếm tài liệu..."
                leftSection={<IconSearch size={16} stroke={1.5} className="text-zinc-400" />}
                classNames={{
                  input: "!bg-white !border-zinc-200 hover:!border-zinc-300 focus:!border-zinc-400 !rounded-xl !h-10 !text-[13px] !font-sans !font-medium !text-zinc-800 !shadow-sm !transition-all",
                }}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto py-1 w-full min-w-0 xl:w-auto xl:justify-end" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <MultiSelect
                placeholder="Lọc trạng thái..."
                data={[
                  { value: 'completed', label: 'Hoàn tất' },
                  { value: 'processing', label: 'Đang xử lý' },
                  { value: 'pending', label: 'Chờ xử lý' },
                  { value: 'failed', label: 'Lỗi' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                clearable
                searchable
                hidePickedOptions
                classNames={{
                  input: "bg-white border-zinc-200/80 hover:border-zinc-300 focus:border-zinc-300 focus:ring-0 rounded-lg min-h-[32px] h-8 text-[13px] font-medium text-zinc-900 shadow-sm transition-all duration-300",
                  dropdown: "bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-xl shadow-xl overflow-hidden py-1.5",
                  option: "!rounded-lg data-[hovered]:!bg-zinc-100/80 data-[selected]:!bg-zinc-100 data-[selected]:!text-zinc-900 !text-[13px] !font-semibold transition-all duration-200 !px-4 !py-2 !mb-0.5 last:!mb-0",
                  pill: "!hidden",
                  pillsList: "!gap-0"
                }}
              />
              {statusFilter.length > 0 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  className="!text-xs !font-semibold !px-2 hover:!bg-zinc-100 shrink-0"
                  onClick={() => setStatusFilter([])}
                >
                  Xoá lọc
                </Button>
              )}
            </div>
          </div>

          {displayJobs.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <IconActivity size={24} className="text-zinc-400" stroke={1.5} />
              </div>
              <Text size="lg" fw={600} className="text-zinc-900 mb-1">
                Không có tiến trình nào
              </Text>
              <Text size="sm" c="dimmed" className="max-w-[400px]">
                Bạn chưa tải lên tài liệu nào gần đây.
              </Text>
            </div>
          ) : (
            <div
              className="overflow-x-auto"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <Table
                verticalSpacing="md"
                horizontalSpacing="xl"
                className="w-full border-collapse bg-white rounded-xl shadow-sm border border-zinc-200/60 overflow-hidden"
                style={{ minWidth: 1000 }}
              >
                <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
                  <Table.Tr>
                    <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[30%] py-3 text-xs whitespace-nowrap rounded-tl-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-8 shrink-0"></div>
                        <span>Tên file</span>
                      </div>
                    </Table.Th>
                    <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[30%] py-3 text-xs whitespace-nowrap">
                      Tiến độ
                    </Table.Th>
                    <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[20%] py-3 text-xs whitespace-nowrap">
                      Trạng thái
                    </Table.Th>
                    <Table.Th className="font-semibold text-zinc-400 capitalize tracking-wide font-sans border-0 w-[20%] py-3 text-xs whitespace-nowrap rounded-tr-xl">
                      Thời gian tạo
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {displayJobs.map((item) => (
                    <Table.Tr
                      key={item.id}
                      className="group/row hover:bg-zinc-50/50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] border-b border-zinc-100 last:border-0"
                    >
                      <Table.Td className="border-0 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex flex-col items-center justify-center shrink-0">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex flex-col min-w-0 pr-4">
                            <span
                              className="text-zinc-900 font-bold text-[13px] truncate"
                              title={item.file_name}
                            >
                              {item.file_name}
                            </span>
                            <span className="text-zinc-500 font-medium text-[11px] mt-0.5">
                              Tiến trình AI
                            </span>
                          </div>
                        </div>
                      </Table.Td>
                      <Table.Td className="border-0">
                        <div className="flex flex-col gap-1 w-full max-w-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-900 font-bold text-xs"><AnimatedNumber value={item.progress_percent} />%</span>
                          </div>
                          <Progress
                            value={item.progress_percent}
                            size="sm"
                            radius="xl"
                            color={item.status === "failed" ? "red" : (item.status === "completed" || item.status === "active" || item.status === "ready" || item.status === "done") ? "teal" : "blue"}
                            striped={item.status === "processing"}
                            animated={item.status === "processing"}
                            transitionDuration={800}
                            className="bg-zinc-100"
                          />
                          {item.message && (
                            <span className="text-zinc-500 font-medium text-[10px] mt-0.5 truncate" title={item.message}>
                              {item.message}
                            </span>
                          )}
                        </div>
                      </Table.Td>
                      <Table.Td className="border-0 whitespace-nowrap">
                        {getStatusDot(item.status)}
                      </Table.Td>
                      <Table.Td className="border-0 whitespace-nowrap">
                        <span className="text-zinc-500 font-medium text-xs">
                          {new Date(item.created_at).toLocaleString("vi-VN")}
                        </span>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
