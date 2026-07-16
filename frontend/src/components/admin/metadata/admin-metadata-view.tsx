"use client";


import { useMetadata } from "@/hooks/admin/use-metadata";
import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBook2,
  IconCategory,
  IconCheck,
  IconEdit,
  IconFolder,
  IconLanguage,
  IconPlus,
  IconTrash,
  IconX,
  IconClipboardList,
} from "@tabler/icons-react";

type MetadataTab = "types" | "languages" | "sources";

export function AdminMetadataView() {
  const [activeTab, setActiveTab] = useState<MetadataTab>("types");
  const {
    documentTypes,
    languages,
    documentSources,
    loading,
    error,
    savingAction,

    addingType,
    newTypeName,
    newTypeDesc,
    editingTypeId,
    editingTypeName,
    editingTypeDesc,
    setNewTypeName,
    setNewTypeDesc,
    setEditingTypeName,
    setEditingTypeDesc,
    startAddingType,
    startEditingType,
    cancelTypeForm,
    handleCreateType,
    handleUpdateType,
    handleDeleteType,

    addingLang,
    newLangCode,
    newLangName,
    editingLangId,
    editingLangCode,
    editingLangName,
    setNewLangCode,
    setNewLangName,
    setEditingLangCode,
    setEditingLangName,
    startAddingLang,
    startEditingLang,
    cancelLangForm,
    handleCreateLang,
    handleUpdateLang,
    handleDeleteLang,

    addingSource,
    newSourceName,
    editingSourceId,
    editingSourceName,
    setNewSourceName,
    setEditingSourceName,
    startAddingSource,
    startEditingSource,
    cancelSourceForm,
    handleCreateSource,
    handleUpdateSource,
    handleDeleteSource,
  } = useMetadata();

  return (
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-2.5">
          <IconClipboardList size={20} stroke={1.5} className="text-zinc-900" />
          <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
            Danh Mục Khác
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
      <Stack gap="xl">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Lỗi tải dữ liệu"
            color="red"
            radius={24}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="lg" color="dark" />
          </Group>
        ) : (
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab((value as MetadataTab | null) ?? "types")}
            radius="xl"
            color="dark"
          >
            <Tabs.List className="mb-8 rounded-[24px] border border-zinc-200 bg-white p-2 shadow-none before:hidden">
              <Tabs.Tab value="types" leftSection={<IconCategory size={16} />}>
                Loại học liệu
              </Tabs.Tab>
              <Tabs.Tab value="languages" leftSection={<IconLanguage size={16} />}>
                Ngôn ngữ
              </Tabs.Tab>
              <Tabs.Tab value="sources" leftSection={<IconBook2 size={16} />}>
                Nguồn tài liệu
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel
              value="types"
              className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700} className="font-sans text-[16px] text-zinc-900">
                    Danh sách loại học liệu
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={startAddingType}
                    disabled={savingAction !== null}
                    radius="xl"
                    size="sm"
                    color="dark"
                    variant="outline"
                  >
                    Thêm mới
                  </Button>
                </Group>

                {documentTypes.length === 0 ? (
                  <EmptyMetadataCard label="Chưa có loại học liệu nào." />
                ) : (
                  <Stack gap="xs">
                    {documentTypes.map((type) => {
                      const isEditing = editingTypeId === type.id;
                      const isSaving = savingAction === `update-type-${type.id}`;
                      const isDeleting = savingAction === `delete-type-${type.id}`;

                      return (
                        <Paper
                          key={type.id}
                          withBorder
                          p="md"
                          radius={24}
                          className="bg-white shadow-sm"
                        >
                          {isEditing ? (
                            <Group gap="xs">
                              <TextInput
                                value={editingTypeName}
                                onChange={(e) => setEditingTypeName(e.target.value)}
                                className="flex-1"
                                radius="lg"
                                size="sm"
                              />
                              <TextInput
                                value={editingTypeDesc}
                                onChange={(e) => setEditingTypeDesc(e.target.value)}
                                className="flex-[2]"
                                radius="lg"
                                size="sm"
                              />
                              <ActionIcon
                                variant="filled"
                                color="green"
                                radius="lg"
                                onClick={() => handleUpdateType(type.id)}
                                loading={isSaving}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                radius="lg"
                                onClick={cancelTypeForm}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          ) : (
                            <Group justify="space-between" align="center">
                              <div>
                                <Text fw={700} size="sm" className="text-zinc-900">
                                  {type.name}
                                </Text>
                                {type.description && (
                                  <Text size="xs" c="dimmed">
                                    {type.description}
                                  </Text>
                                )}
                              </div>
                              <RowActions
                                onEdit={() => startEditingType(type)}
                                onDelete={() => handleDeleteType(type)}
                                disabled={savingAction !== null}
                                deleting={isDeleting}
                              />
                            </Group>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel
              value="languages"
              className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700} className="font-sans text-[16px] text-zinc-900">
                    Danh sách ngôn ngữ
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={startAddingLang}
                    disabled={savingAction !== null}
                    radius="xl"
                    size="sm"
                    color="dark"
                    variant="outline"
                  >
                    Thêm mới
                  </Button>
                </Group>

                {languages.length === 0 ? (
                  <EmptyMetadataCard label="Chưa có ngôn ngữ nào." />
                ) : (
                  <Stack gap="xs">
                    {languages.map((lang) => {
                      const isEditing = editingLangId === lang.id;
                      const isSaving = savingAction === `update-language-${lang.id}`;
                      const isDeleting = savingAction === `delete-language-${lang.id}`;

                      return (
                        <Paper
                          key={lang.id}
                          withBorder
                          p="md"
                          radius={24}
                          className="bg-white shadow-sm"
                        >
                          {isEditing ? (
                            <Group gap="xs">
                              <TextInput
                                value={editingLangCode}
                                onChange={(e) => setEditingLangCode(e.target.value)}
                                className="w-[120px]"
                                radius="lg"
                                size="sm"
                              />
                              <TextInput
                                value={editingLangName}
                                onChange={(e) => setEditingLangName(e.target.value)}
                                className="flex-1"
                                radius="lg"
                                size="sm"
                              />
                              <ActionIcon
                                variant="filled"
                                color="green"
                                radius="lg"
                                onClick={() => handleUpdateLang(lang.id)}
                                loading={isSaving}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                radius="lg"
                                onClick={cancelLangForm}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          ) : (
                            <Group justify="space-between" align="center">
                              <div>
                                <Text fw={700} size="sm" className="text-zinc-900">
                                  {lang.name}
                                </Text>
                                <Text
                                  size="xs"
                                  className="font-mono uppercase tracking-widest text-zinc-500"
                                >
                                  Mã: {lang.code}
                                </Text>
                              </div>
                              <RowActions
                                onEdit={() => startEditingLang(lang)}
                                onDelete={() => handleDeleteLang(lang)}
                                disabled={savingAction !== null}
                                deleting={isDeleting}
                              />
                            </Group>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel
              value="sources"
              className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700} className="font-sans text-[16px] text-zinc-900">
                    Danh sách nguồn tài liệu
                  </Text>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={startAddingSource}
                    disabled={savingAction !== null}
                    radius="xl"
                    size="sm"
                    color="dark"
                    variant="outline"
                  >
                    Thêm mới
                  </Button>
                </Group>

                {documentSources.length === 0 ? (
                  <EmptyMetadataCard label="Chưa có nguồn tài liệu nào." />
                ) : (
                  <Stack gap="xs">
                    {documentSources.map((source) => {
                      const isEditing = editingSourceId === source.id;
                      const isSaving = savingAction === `update-source-${source.id}`;
                      const isDeleting = savingAction === `delete-source-${source.id}`;

                      return (
                        <Paper
                          key={source.id}
                          withBorder
                          p="md"
                          radius={24}
                          className="bg-white shadow-sm"
                        >
                          {isEditing ? (
                            <Group gap="xs">
                              <TextInput
                                value={editingSourceName}
                                onChange={(e) => setEditingSourceName(e.target.value)}
                                className="flex-1"
                                radius="lg"
                                size="sm"
                              />
                              <ActionIcon
                                variant="filled"
                                color="green"
                                radius="lg"
                                onClick={() => handleUpdateSource(source.id)}
                                loading={isSaving}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                radius="lg"
                                onClick={cancelSourceForm}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          ) : (
                            <Group justify="space-between" align="center">
                              <Text fw={700} size="sm" className="text-zinc-900">
                                {source.name}
                              </Text>
                              <RowActions
                                onEdit={() => startEditingSource(source)}
                                onDelete={() => handleDeleteSource(source)}
                                disabled={savingAction !== null}
                                deleting={isDeleting}
                              />
                            </Group>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>

      <Modal
        opened={addingType}
        onClose={cancelTypeForm}
        title="Thêm loại học liệu"
        centered
        radius="2xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Stack gap="md">
          <TextInput
            label="Tên loại học liệu"
            placeholder="Nhập tên loại học liệu"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <TextInput
            label="Mô tả"
            placeholder="Nhập mô tả"
            value={newTypeDesc}
            onChange={(e) => setNewTypeDesc(e.target.value)}
            radius="lg"
          />
          <Group justify="flex-end" gap="sm" mt="sm">
            <Button variant="subtle" color="gray" onClick={cancelTypeForm} radius="lg">
              Hủy
            </Button>
            <Button
              onClick={handleCreateType}
              disabled={!newTypeName.trim() || savingAction === "create-type"}
              loading={savingAction === "create-type"}
              radius="lg"
              color="dark"
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={addingLang}
        onClose={cancelLangForm}
        title="Thêm ngôn ngữ"
        centered
        radius="2xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Stack gap="md">
          <TextInput
            label="Mã ngôn ngữ"
            placeholder="VD: EN"
            value={newLangCode}
            onChange={(e) => setNewLangCode(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <TextInput
            label="Tên ngôn ngữ"
            placeholder="Nhập tên ngôn ngữ"
            value={newLangName}
            onChange={(e) => setNewLangName(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <Group justify="flex-end" gap="sm" mt="sm">
            <Button variant="subtle" color="gray" onClick={cancelLangForm} radius="lg">
              Hủy
            </Button>
            <Button
              onClick={handleCreateLang}
              disabled={
                !newLangCode.trim() || !newLangName.trim() || savingAction === "create-language"
              }
              loading={savingAction === "create-language"}
              radius="lg"
              color="dark"
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={addingSource}
        onClose={cancelSourceForm}
        title="Thêm nguồn tài liệu"
        centered
        radius="2xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Stack gap="md">
          <TextInput
            label="Tên nguồn"
            placeholder="Nhập tên nguồn"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            radius="lg"
            withAsterisk
          />
          <Group justify="flex-end" gap="sm" mt="sm">
            <Button variant="subtle" color="gray" onClick={cancelSourceForm} radius="lg">
              Hủy
            </Button>
            <Button
              onClick={handleCreateSource}
              disabled={!newSourceName.trim() || savingAction === "create-source"}
              loading={savingAction === "create-source"}
              radius="lg"
              color="dark"
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>
      </div>
    </div>
  );
}

function EmptyMetadataCard({ label }: { label: string }) {
  return (
    <Paper withBorder radius={24} p="xl" className="border-dashed bg-white text-center shadow-sm">
      <Stack align="center" gap="sm">
        <IconFolder size={48} className="text-zinc-300" />
        <Text c="dimmed">{label}</Text>
      </Stack>
    </Paper>
  );
}

function RowActions({
  onEdit,
  onDelete,
  disabled,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
  deleting: boolean;
}) {
  return (
    <Group gap="xs">
      <ActionIcon variant="subtle" color="dark" onClick={onEdit} disabled={disabled} radius="lg">
        <IconEdit size={16} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        color="red"
        onClick={onDelete}
        disabled={disabled}
        loading={deleting}
        radius="lg"
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
}
