import { useState } from "react";
import { ActionIcon, Button, Group, Menu, Modal, Table, Text } from "@mantine/core";
import {
  IconLock,
  IconLockOpen,
  IconDotsVertical,
  IconEdit,
  IconKey,
  IconTrash,
} from "@tabler/icons-react";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  roleId: number;
  role: string;
  status: string;
  active: boolean;
}

interface UserTableProps {
  users: User[];
  onToggleBlock: (id: string, active: boolean) => void;
  onEdit: (user: User) => void;
  onPassword: (user: User) => void;
  onDelete: (id: string, name: string) => void;
}

export function UserTable({ users, onToggleBlock, onEdit, onPassword, onDelete }: UserTableProps) {
  const [userToBlock, setUserToBlock] = useState<{
    id: string;
    name: string;
    active: boolean;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-8">
        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover verticalSpacing="md" withRowBorders className="w-full">
            <Table.Thead className="bg-zinc-50/80 border-b border-zinc-100">
              <Table.Tr>
                <Table.Th className="w-[30%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                  Tên Người Dùng
                </Table.Th>
                <Table.Th className="w-[35%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                  Email
                </Table.Th>
                <Table.Th className="w-[15%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                  Vai Trò
                </Table.Th>
                <Table.Th className="w-[19%] py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                  Trạng Thái
                </Table.Th>
                <Table.Th className="w-[1%] text-left py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-colors duration-150">
                  <Table.Td className="font-sans text-sm font-semibold text-zinc-900 whitespace-nowrap">
                    {user.name}
                  </Table.Td>
                  <Table.Td className="font-sans text-[13px] text-zinc-500 whitespace-nowrap">
                    {user.email}
                  </Table.Td>
                  <Table.Td className="font-sans text-[13px] text-zinc-600 font-medium whitespace-nowrap">
                    {user.role}
                  </Table.Td>
                  <Table.Td className="whitespace-nowrap">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 text-xs bg-emerald-50 px-2.5 py-1 rounded-md">
                        <div className="rounded-full bg-emerald-500 w-1.5 h-1.5" />
                        Hoạt Động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-md">
                        <div className="rounded-full bg-red-500 w-1.5 h-1.5" />
                        Bị Khóa
                      </span>
                    )}
                  </Table.Td>
                  <Table.Td className="!pl-0 whitespace-nowrap">
                    <div className="flex justify-start">
                      <Menu shadow="md" width={190} position="bottom-end" radius="lg">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(user)}
                          >
                            Sửa thông tin
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconKey size={14} />}
                            onClick={() => onPassword(user)}
                          >
                            Đổi mật khẩu
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color={user.active ? "red" : "green"}
                            leftSection={
                              user.active ? <IconLock size={14} /> : <IconLockOpen size={14} />
                            }
                            onClick={() =>
                              setUserToBlock({
                                id: user.id,
                                name: user.name,
                                active: user.active,
                              })
                            }
                            style={{ fontWeight: 600 }}
                          >
                            {user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                            style={{ fontWeight: 600 }}
                          >
                            Xóa tài khoản
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>

      <Modal
        opened={userToBlock !== null}
        onClose={() => setUserToBlock(null)}
        title={userToBlock?.active ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
        centered
        radius="2xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Text size="sm" mb="lg">
          Bạn có chắc chắn muốn {userToBlock?.active ? "khóa" : "mở khóa"} tài khoản của{" "}
          <strong>{userToBlock?.name}</strong>?
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" onClick={() => setUserToBlock(null)} radius="lg">
            Hủy
          </Button>
          <Button
            color={userToBlock?.active ? "red" : "green"}
            onClick={() => {
              if (userToBlock) {
                onToggleBlock(userToBlock.id, userToBlock.active);
                setUserToBlock(null);
              }
            }}
            radius="lg"
          >
            {userToBlock?.active ? "Khóa tài khoản" : "Mở khóa"}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        title="Xác nhận xóa tài khoản"
        centered
        radius="2xl"
        overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      >
        <Text size="sm" mb="lg">
          Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong>{userToDelete?.name}</strong>?
          Thao tác này không thể hoàn tác.
        </Text>
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" onClick={() => setUserToDelete(null)} radius="lg">
            Hủy
          </Button>
          <Button
            color="red"
            onClick={() => {
              if (userToDelete) {
                onDelete(userToDelete.id, userToDelete.name);
                setUserToDelete(null);
              }
            }}
            radius="lg"
          >
            Xóa vĩnh viễn
          </Button>
        </Group>
      </Modal>
    </>
  );
}
