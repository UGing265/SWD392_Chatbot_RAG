"use client";

import { useUsers } from "@/hooks/admin/use-users";
import { UserTable } from "./user-table";
import { CreateUserModal, EditUserModal, ChangePasswordModal } from "./user-modals";
import { Title, Text, Button, TextInput, Paper, Center, Loader, Group } from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";

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
    <div style={{ padding: "var(--mantine-spacing-xl)" }}>
      {/* Header section */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={1} size="h2" mb={4}>
            Quản lý tài khoản người dùng
          </Title>
          <Text size="sm" c="dimmed">
            Quản lý vai trò và trạng thái truy cập của người dùng trong hệ thống
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}
          size="md"
          radius="lg"
          color="dark"
        >
          Thêm người dùng
        </Button>
      </Group>

      {/* Search Filter */}
      <TextInput
        placeholder="Tìm người dùng theo tên, email..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb="lg"
        size="md"
        radius="lg"
        style={{ maxWidth: 480 }}
      />

      {/* Table Container */}
      <Paper withBorder radius="lg" p="md">
        {loading ? (
          <Center py={60}>
            <Loader size="lg" />
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

            <Group
              justify="space-between"
              mt="md"
              pt="md"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            >
              <Text size="xs" c="dimmed">
                Hiển thị {filteredUsers.length} trên {users.length} người dùng
              </Text>
            </Group>
          </>
        )}
      </Paper>

      {/* Modals */}
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
    </div>
  );
}
