import { Table, Badge, ActionIcon, Group, Menu } from "@mantine/core";
import { 
  IconLock, 
  IconLockOpen, 
  IconDotsVertical, 
  IconEdit, 
  IconKey, 
  IconTrash 
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
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover verticalSpacing="md" withRowBorders>
        <Table.Thead>
          <Table.Tr style={{ borderBottomWidth: 1.5 }}>
            <Table.Th style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", tracking: "wider" }}>
              Tên người dùng
            </Table.Th>
            <Table.Th style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", tracking: "wider" }}>
              Email
            </Table.Th>
            <Table.Th style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", tracking: "wider" }}>
              Vai trò
            </Table.Th>
            <Table.Th style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", tracking: "wider" }}>
              Trạng thái
            </Table.Th>
            <Table.Th style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", tracking: "wider" }} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id} style={{ transition: "background-color 150ms ease" }}>
              <Table.Td style={{ fontWeight: 600 }}>{user.name}</Table.Td>
              <Table.Td style={{ color: "var(--mantine-color-dimmed)" }}>{user.email}</Table.Td>
              <Table.Td>{user.role}</Table.Td>
              <Table.Td>
                <Badge 
                  color={user.active ? "green" : "red"} 
                  variant="light" 
                  size="sm" 
                  style={{ textTransform: "uppercase", fontWeight: 700 }}
                >
                  {user.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <ActionIcon 
                    variant="subtle" 
                    color={user.active ? "red" : "green"} 
                    onClick={() => onToggleBlock(user.id, user.active)}
                    title={user.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  >
                    {user.active ? <IconLock size={16} /> : <IconLockOpen size={16} />}
                  </ActionIcon>

                  <Menu shadow="md" width={180} position="bottom-end" radius="md">
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
                        color="red" 
                        leftSection={<IconTrash size={14} />} 
                        onClick={() => onDelete(user.id, user.name)}
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
  );
}
