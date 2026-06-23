"use client";

import { useMetadata } from "@/hooks/admin/use-metadata";
import {
  Button,
  Group,
  TextInput,
  Stack,
  Title,
  Text,
  Paper,
  ActionIcon,
  Collapse,
  Loader,
  Alert,
  Tabs,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconFolder,
  IconAlertCircle,
  IconCategory,
  IconLanguage,
  IconBook2,
} from "@tabler/icons-react";

export function AdminMetadataView() {
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
    <Stack gap="xl" p="md" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header section */}
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Quản lý Danh mục</Title>
          <Text size="sm" c="dimmed">
            Thêm, sửa, xóa các loại học liệu, ngôn ngữ, nguồn tài liệu
          </Text>
        </div>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Lỗi tải dữ liệu" color="red" radius="lg">
          {error}
        </Alert>
      )}

      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="lg" color="dark" />
        </Group>
      ) : (
        <Tabs defaultValue="types" radius="lg" color="dark">
          <Tabs.List>
            <Tabs.Tab value="types" leftSection={<IconCategory size={16} />}>
              Loại Học Liệu
            </Tabs.Tab>
            <Tabs.Tab value="languages" leftSection={<IconLanguage size={16} />}>
              Ngôn Ngữ
            </Tabs.Tab>
            <Tabs.Tab value="sources" leftSection={<IconBook2 size={16} />}>
              Nguồn Tài Liệu
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="types" pt="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Danh sách Loại học liệu</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={startAddingType}
                  disabled={savingAction !== null}
                  radius="lg"
                  size="sm"
                  color="dark"
                  variant="outline"
                >
                  Thêm mới
                </Button>
              </Group>

              {/* Add form */}
              <Collapse in={addingType}>
                <Paper withBorder p="md" radius="lg" bg="transparent" style={{ borderStyle: "dashed" }}>
                  <Stack gap="sm">
                    <Text size="sm" fw={700} c="dimmed">Thêm Loại Học Liệu</Text>
                    <Group align="flex-end" gap="md">
                      <TextInput
                        placeholder="Tên loại học liệu (VD: Sách bài tập)"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        style={{ flex: 1 }}
                        radius="lg"
                      />
                      <TextInput
                        placeholder="Mô tả"
                        value={newTypeDesc}
                        onChange={(e) => setNewTypeDesc(e.target.value)}
                        style={{ flex: 2 }}
                        radius="lg"
                      />
                      <Group gap="xs">
                        <Button
                          onClick={handleCreateType}
                          disabled={!newTypeName.trim() || savingAction === "create-type"}
                          loading={savingAction === "create-type"}
                          radius="lg"
                          color="dark"
                        >Lưu</Button>
                        <Button variant="subtle" color="gray" onClick={cancelTypeForm} radius="lg">Hủy</Button>
                      </Group>
                    </Group>
                  </Stack>
                </Paper>
              </Collapse>

              {documentTypes.length === 0 ? (
                <Paper withBorder radius="lg" p="xl" style={{ textAlign: "center", borderStyle: "dashed" }}>
                  <Stack align="center" gap="sm">
                    <IconFolder size={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed">Chưa có loại học liệu nào.</Text>
                  </Stack>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {documentTypes.map((type) => {
                    const isEditing = editingTypeId === type.id;
                    const isSaving = savingAction === `update-type-${type.id}`;
                    const isDeleting = savingAction === `delete-type-${type.id}`;

                    return (
                      <Paper key={type.id} withBorder p="sm" radius="lg">
                        {isEditing ? (
                          <Group gap="xs">
                            <TextInput
                              value={editingTypeName}
                              onChange={(e) => setEditingTypeName(e.target.value)}
                              style={{ flex: 1 }}
                              radius="lg"
                              size="sm"
                            />
                            <TextInput
                              value={editingTypeDesc}
                              onChange={(e) => setEditingTypeDesc(e.target.value)}
                              style={{ flex: 2 }}
                              radius="lg"
                              size="sm"
                            />
                            <Group gap="xs">
                              <ActionIcon variant="filled" color="green" radius="lg" onClick={() => handleUpdateType(type.id)} loading={isSaving}><IconCheck size={16} /></ActionIcon>
                              <ActionIcon variant="light" color="gray" radius="lg" onClick={cancelTypeForm}><IconX size={16} /></ActionIcon>
                            </Group>
                          </Group>
                        ) : (
                          <Group justify="space-between" align="center">
                            <div>
                              <Text fw={600} size="sm">{type.name}</Text>
                              {type.description && <Text size="xs" c="dimmed">{type.description}</Text>}
                            </div>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="dark" onClick={() => startEditingType(type)} disabled={savingAction !== null} radius="lg"><IconEdit size={16} /></ActionIcon>
                              <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteType(type)} disabled={savingAction !== null} loading={isDeleting} radius="lg"><IconTrash size={16} /></ActionIcon>
                            </Group>
                          </Group>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="languages" pt="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Danh sách Ngôn ngữ</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={startAddingLang}
                  disabled={savingAction !== null}
                  radius="lg"
                  size="sm"
                  color="dark"
                  variant="outline"
                >
                  Thêm mới
                </Button>
              </Group>

              {/* Add form */}
              <Collapse in={addingLang}>
                <Paper withBorder p="md" radius="lg" bg="transparent" style={{ borderStyle: "dashed" }}>
                  <Stack gap="sm">
                    <Text size="sm" fw={700} c="dimmed">Thêm Ngôn Ngữ</Text>
                    <Group align="flex-end" gap="md">
                      <TextInput
                        placeholder="Mã (VD: EN)"
                        value={newLangCode}
                        onChange={(e) => setNewLangCode(e.target.value)}
                        style={{ width: 120 }}
                        radius="lg"
                      />
                      <TextInput
                        placeholder="Tên ngôn ngữ (VD: Tiếng Anh)"
                        value={newLangName}
                        onChange={(e) => setNewLangName(e.target.value)}
                        style={{ flex: 1 }}
                        radius="lg"
                      />
                      <Group gap="xs">
                        <Button
                          onClick={handleCreateLang}
                          disabled={!newLangCode.trim() || !newLangName.trim() || savingAction === "create-language"}
                          loading={savingAction === "create-language"}
                          radius="lg"
                          color="dark"
                        >Lưu</Button>
                        <Button variant="subtle" color="gray" onClick={cancelLangForm} radius="lg">Hủy</Button>
                      </Group>
                    </Group>
                  </Stack>
                </Paper>
              </Collapse>

              {languages.length === 0 ? (
                <Paper withBorder radius="lg" p="xl" style={{ textAlign: "center", borderStyle: "dashed" }}>
                  <Stack align="center" gap="sm">
                    <IconFolder size={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed">Chưa có ngôn ngữ nào.</Text>
                  </Stack>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {languages.map((lang) => {
                    const isEditing = editingLangId === lang.id;
                    const isSaving = savingAction === `update-language-${lang.id}`;
                    const isDeleting = savingAction === `delete-language-${lang.id}`;

                    return (
                      <Paper key={lang.id} withBorder p="sm" radius="lg">
                        {isEditing ? (
                          <Group gap="xs">
                            <TextInput
                              value={editingLangCode}
                              onChange={(e) => setEditingLangCode(e.target.value)}
                              style={{ width: 120 }}
                              radius="lg"
                              size="sm"
                            />
                            <TextInput
                              value={editingLangName}
                              onChange={(e) => setEditingLangName(e.target.value)}
                              style={{ flex: 1 }}
                              radius="lg"
                              size="sm"
                            />
                            <Group gap="xs">
                              <ActionIcon variant="filled" color="green" radius="lg" onClick={() => handleUpdateLang(lang.id)} loading={isSaving}><IconCheck size={16} /></ActionIcon>
                              <ActionIcon variant="light" color="gray" radius="lg" onClick={cancelLangForm}><IconX size={16} /></ActionIcon>
                            </Group>
                          </Group>
                        ) : (
                          <Group justify="space-between" align="center">
                            <div>
                              <Text fw={600} size="sm">{lang.name}</Text>
                              <Text size="xs" c="dimmed">Mã: {lang.code}</Text>
                            </div>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="dark" onClick={() => startEditingLang(lang)} disabled={savingAction !== null} radius="lg"><IconEdit size={16} /></ActionIcon>
                              <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteLang(lang)} disabled={savingAction !== null} loading={isDeleting} radius="lg"><IconTrash size={16} /></ActionIcon>
                            </Group>
                          </Group>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="sources" pt="xl">
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={600}>Danh sách Nguồn tài liệu</Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={startAddingSource}
                  disabled={savingAction !== null}
                  radius="lg"
                  size="sm"
                  color="dark"
                  variant="outline"
                >
                  Thêm mới
                </Button>
              </Group>

              {/* Add form */}
              <Collapse in={addingSource}>
                <Paper withBorder p="md" radius="lg" bg="transparent" style={{ borderStyle: "dashed" }}>
                  <Stack gap="sm">
                    <Text size="sm" fw={700} c="dimmed">Thêm Nguồn</Text>
                    <Group align="flex-end" gap="md">
                      <TextInput
                        placeholder="Tên nguồn (VD: Sưu tầm, Tự biên soạn...)"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        style={{ flex: 1 }}
                        radius="lg"
                      />
                      <Group gap="xs">
                        <Button
                          onClick={handleCreateSource}
                          disabled={!newSourceName.trim() || savingAction === "create-source"}
                          loading={savingAction === "create-source"}
                          radius="lg"
                          color="dark"
                        >Lưu</Button>
                        <Button variant="subtle" color="gray" onClick={cancelSourceForm} radius="lg">Hủy</Button>
                      </Group>
                    </Group>
                  </Stack>
                </Paper>
              </Collapse>

              {documentSources.length === 0 ? (
                <Paper withBorder radius="lg" p="xl" style={{ textAlign: "center", borderStyle: "dashed" }}>
                  <Stack align="center" gap="sm">
                    <IconFolder size={48} style={{ opacity: 0.3 }} />
                    <Text c="dimmed">Chưa có nguồn tài liệu nào.</Text>
                  </Stack>
                </Paper>
              ) : (
                <Stack gap="xs">
                  {documentSources.map((source) => {
                    const isEditing = editingSourceId === source.id;
                    const isSaving = savingAction === `update-source-${source.id}`;
                    const isDeleting = savingAction === `delete-source-${source.id}`;

                    return (
                      <Paper key={source.id} withBorder p="sm" radius="lg">
                        {isEditing ? (
                          <Group gap="xs">
                            <TextInput
                              value={editingSourceName}
                              onChange={(e) => setEditingSourceName(e.target.value)}
                              style={{ flex: 1 }}
                              radius="lg"
                              size="sm"
                            />
                            <Group gap="xs">
                              <ActionIcon variant="filled" color="green" radius="lg" onClick={() => handleUpdateSource(source.id)} loading={isSaving}><IconCheck size={16} /></ActionIcon>
                              <ActionIcon variant="light" color="gray" radius="lg" onClick={cancelSourceForm}><IconX size={16} /></ActionIcon>
                            </Group>
                          </Group>
                        ) : (
                          <Group justify="space-between" align="center">
                            <Text fw={600} size="sm">{source.name}</Text>
                            <Group gap="xs">
                              <ActionIcon variant="subtle" color="dark" onClick={() => startEditingSource(source)} disabled={savingAction !== null} radius="lg"><IconEdit size={16} /></ActionIcon>
                              <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteSource(source)} disabled={savingAction !== null} loading={isDeleting} radius="lg"><IconTrash size={16} /></ActionIcon>
                            </Group>
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
  );
}
