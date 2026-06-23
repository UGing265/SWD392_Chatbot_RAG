"use client";

import React, { useState, useEffect } from "react";
import {
  IconScale,
  IconSearch,
  IconFileText,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  Button,
  Paper,
  Text,
  TextInput,
  Group,
  MultiSelect,
  Loader,
  Badge,
  Grid,
  Card,
  List,
  ThemeIcon,
  Table,
} from "@mantine/core";
import { documentApi, ComparisonResult } from "@/api/document";
import { ragApi } from "@/api/client";

export function CompareView({ role }: { role: string }) {
  const [documents, setDocuments] = useState<{ value: string; label: string }[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [question, setQuestion] = useState("");

  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch documents for selection
    const fetchDocs = async () => {
      setLoadingDocs(true);
      try {
        // Try fetching admin documents if lecturer, else public documents
        const endpoint = role === "lecturer" ? "/admin/documents?pageSize=100" : "/documents?pageSize=100";
        const res = await ragApi.get(endpoint);
        const docsList = res.data.documents || [];
        setDocuments(
          docsList.map((d: any) => ({
            value: d.id,
            label: d.title || d.file_name || d.id,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocs();
  }, [role]);

  const handleCompare = async () => {
    if (selectedDocs.length < 2) {
      setError("Vui lòng chọn ít nhất 2 tài liệu để so sánh.");
      return;
    }
    if (!question.trim()) {
      setError("Vui lòng nhập câu hỏi hoặc tiêu chí so sánh.");
      return;
    }

    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const res = await documentApi.compareDocuments(selectedDocs, question);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi trong quá trình so sánh.");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-50 p-6">
      <div className="mx-auto max-w-5xl">
        <Group mb="xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-white shadow-lg">
            <IconScale size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#111111]">So sánh Tài liệu</h1>
            <Text size="sm" c="dimmed">
              Phân tích và đối chiếu nội dung giữa nhiều tài liệu học tập
            </Text>
          </div>
        </Group>

        <Paper withBorder p="xl" radius="lg" className="mb-8 shadow-sm bg-white">
          <Grid align="flex-end">
            <Grid.Col span={{ base: 12, md: 5 }}>
              <MultiSelect
                label="Chọn tài liệu (Ít nhất 2)"
                placeholder="Tìm kiếm tài liệu..."
                data={documents}
                value={selectedDocs}
                onChange={setSelectedDocs}
                searchable
                maxDropdownHeight={300}
                leftSection={loadingDocs ? <Loader size="xs" /> : <IconFileText size={16} />}
                radius="lg"
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <TextInput
                label="Tiêu chí so sánh"
                placeholder="VD: So sánh ưu nhược điểm của 2 kiến trúc..."
                value={question}
                onChange={(e) => setQuestion(e.currentTarget.value)}
                radius="lg"
                size="md"
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Button
                fullWidth
                size="md"
                radius="lg"
                color="dark"
                onClick={handleCompare}
                loading={isComparing}
                leftSection={<IconScale size={18} />}
              >
                So sánh
              </Button>
            </Grid.Col>
          </Grid>

          {error && (
            <Text color="red" size="sm" mt="md" fw={500}>
              {error}
            </Text>
          )}
        </Paper>

        {isComparing && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader size="xl" color="dark" type="bars" />
            <Text mt="md" fw={500} c="dimmed">Đang AI phân tích tài liệu...</Text>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <Card withBorder radius="lg" p="xl" className="shadow-sm">
              <Group mb="md">
                <IconCheck size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Tổng quan (Summary)</h2>
              </Group>
              <Text className="text-gray-700 leading-relaxed text-md">
                {result.summary}
              </Text>
            </Card>

            <Grid>
              {/* Differences Table */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Card withBorder radius="lg" p="xl" className="shadow-sm h-full">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Điểm khác biệt (Differences)</h2>
                  
                  {result.differences && result.differences.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                        <Table.Thead className="bg-gray-50">
                          <Table.Tr>
                            <Table.Th className="whitespace-nowrap font-bold">Chủ đề (Topic)</Table.Th>
                            <Table.Th className="font-bold min-w-[200px]">Tài liệu 1</Table.Th>
                            <Table.Th className="font-bold min-w-[200px]">Tài liệu 2</Table.Th>
                            <Table.Th className="font-bold">Giải thích chi tiết</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {result.differences.map((diff, idx) => (
                            <Table.Tr key={idx}>
                              <Table.Td>
                                <Badge color="blue" variant="light" size="lg" radius="sm">
                                  {diff.topic}
                                </Badge>
                              </Table.Td>
                              <Table.Td className="text-sm text-gray-700">{diff.document1}</Table.Td>
                              <Table.Td className="text-sm text-gray-700">{diff.document2}</Table.Td>
                              <Table.Td className="text-sm text-gray-600 italic">{diff.explanation}</Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </div>
                  ) : (
                    <Text c="dimmed">Không tìm thấy điểm khác biệt rõ ràng.</Text>
                  )}
                </Card>
              </Grid.Col>

              {/* Common Themes */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card withBorder radius="lg" p="xl" className="shadow-sm h-full bg-blue-50/30">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Điểm chung (Common Themes)</h2>
                  
                  {result.commonThemes && result.commonThemes.length > 0 ? (
                    <List
                      spacing="lg"
                      size="md"
                      icon={
                        <ThemeIcon color="blue" size={24} radius="xl" variant="light">
                          <IconCheck size={16} />
                        </ThemeIcon>
                      }
                    >
                      {result.commonThemes.map((theme, idx) => (
                        <List.Item key={idx} className="text-gray-800 font-medium">
                          {theme}
                        </List.Item>
                      ))}
                    </List>
                  ) : (
                    <Text c="dimmed">Không có điểm chung nào đáng chú ý.</Text>
                  )}
                </Card>
              </Grid.Col>
            </Grid>
          </div>
        )}
      </div>
    </div>
  );
}
