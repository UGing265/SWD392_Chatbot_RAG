"use client";

import { useUsers } from "@/hooks/admin/use-users";
import { AdminPageShell } from "@/components/layout/admin-page-shell";
import { UserTable } from "./user-table";
import { CreateUserModal, EditUserModal, ChangePasswordModal } from "./user-modals";
import { Button, Center, Group, Loader, Paper, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";

export function AdminUsersView() {
  const {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    isPasswordOpen,
    setIsPasswordOpen,
    selectedUser,
    createForm,
    setCreateForm,
    editForm,
    setEditForm,
    newPassword,
    setNewPassword,
    handleToggleBlock,
    handleCreateUser,
    handleEditUser,
    handleChangePassword,
    handleDeleteUser,
    openCreateModal,
    openEditModal,
    openPasswordModal,
  } = useUsers();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminPageShell
      eyebrow="QUẢN LÝ NGƯỜI DÙNG"
      title="Tài Khoản."
      description="Quản lý vai trò và trạng thái truy cập của người dùng trong hệ thống."
      actions={
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}
          size="md"
          radius="xl"
          color="dark"
          className="h-11 px-6"
        >
          Thêm người dùng
        </Button>
      }
    >
      <Stack gap="xl">
        <Paper withBorder radius={24} p="lg" className="overflow-hidden bg-white shadow-sm">
          <TextInput
            placeholder="Tìm người dùng theo tên, email..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
            radius="lg"
            className="mb-6 max-w-[650px]"
          />
          {loading ? (
            <Center py={60}>
              <Loader size="lg" color="dark" />
            </Center>
          ) : (
            <>
              <UserTable
                users={filteredUsers}
                onToggleBlock={handleToggleBlock}
                onEdit={openEditModal}
                onPassword={openPasswordModal}
                onDelete={handleDeleteUser}
              />

              <Group justify="space-between" mt="md" pt="md" className="border-t border-zinc-200">
                <Text size="xs" className="font-mono uppercase tracking-widest text-zinc-500">
                  Hiển thị {filteredUsers.length} trên {users.length} người dùng
                </Text>
              </Group>
            </>
          )}
        </Paper>
      </Stack>

      <CreateUserModal
        opened={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
        form={createForm}
        setForm={setCreateForm}
      />

      <EditUserModal
        opened={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditUser}
        form={editForm}
        setForm={setEditForm}
      />

      <ChangePasswordModal
        opened={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
        onSubmit={handleChangePassword}
        value={newPassword}
        onChange={setNewPassword}
        userName={selectedUser?.name || ""}
      />
    </AdminPageShell>
  );
}
