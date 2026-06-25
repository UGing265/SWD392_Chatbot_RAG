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
      <div className="overflow-hidden rounded-[20px] border border-zinc-200">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="md" withRowBorders>
            <Table.Thead className="bg-zinc-50">
              <Table.Tr style={{ borderBottomWidth: 1.5 }}>
                <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Tên người dùng
                </Table.Th>
                <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Email
                </Table.Th>
                <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Vai trò
                </Table.Th>
                <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                  Trạng thái
                </Table.Th>
                <Table.Th className="font-mono text-[11px] uppercase tracking-widest text-zinc-500" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id} className="transition-colors duration-150">
                  <Table.Td className="font-serif text-[16px] font-bold text-zinc-900">
                    {user.name}
                  </Table.Td>
                  <Table.Td style={{ color: "var(--mantine-color-dimmed)" }}>{user.email}</Table.Td>
                  <Table.Td>{user.role}</Table.Td>
                  <Table.Td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          height: 8,
                          width: 8,
                          borderRadius: "50%",
                          backgroundColor: user.active ? "#22c55e" : "#ef4444",
                          boxShadow: user.active
                            ? "0 0 8px rgba(34,197,94,0.4)"
                            : "0 0 8px rgba(239,68,68,0.4)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {user.active ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
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
                    </Group>
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
