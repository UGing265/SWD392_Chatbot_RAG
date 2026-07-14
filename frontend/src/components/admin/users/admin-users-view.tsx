"use client";

import { useUsers } from "@/hooks/admin/use-users";
import { UserTable } from "./user-table";
import { CreateUserModal, EditUserModal, ChangePasswordModal } from "./user-modals";
import { Button, Loader, TextInput } from "@mantine/core";
import { IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";

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
    <div className="flex-1 bg-white relative font-sans w-full min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconUsers size={20} stroke={1.5} className="text-zinc-900" />
            <h1 className="font-bold text-lg tracking-tight text-zinc-900 leading-none m-0">
              Quản Lý Tài Khoản
            </h1>
          </div>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={openCreateModal}
            variant="filled"
            color="dark"
            size="xs"
            radius="md"
            className="!h-8 !text-[12px] !px-4 !font-semibold !rounded-lg"
          >
            Thêm Người Dùng
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1 flex flex-col">
        {/* Search */}
        <div className="mb-6">
          <TextInput
            placeholder="Tìm người dùng theo tên, email..."
            leftSection={<IconSearch size={16} stroke={1.5} className="text-zinc-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "!bg-white !border-zinc-200 hover:!border-zinc-300 focus:!border-zinc-400 !rounded-xl !h-10 !text-[13px] !font-sans !font-medium !text-zinc-800 !shadow-sm !transition-all",
            }}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="md" color="dark" />
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <UserTable
              users={filteredUsers}
              onToggleBlock={handleToggleBlock}
              onEdit={openEditModal}
              onPassword={openPasswordModal}
              onDelete={handleDeleteUser}
            />
            <div className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
                Hiển thị {filteredUsers.length} trên {users.length} người dùng
              </span>
            </div>
          </div>
        )}
      </div>

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
