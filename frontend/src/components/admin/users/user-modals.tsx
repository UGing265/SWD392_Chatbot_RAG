import { Modal, TextInput, PasswordInput, Select, Button, Group, Stack } from "@mantine/core";

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (form: any) => void;
}

export function CreateUserModal({
  opened,
  onClose,
  onSubmit,
  form,
  setForm,
}: CreateUserModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Thêm tài khoản mới"
      centered
      size="md"
      radius="2xl"
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Tên hiển thị"
            placeholder="Ví dụ: Nguyễn Văn A"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="Tên đăng nhập (Username)"
            placeholder="Ví dụ: anv"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextInput
            label="Địa chỉ Email"
            placeholder="Ví dụ: anv@studymate.edu.vn"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <PasswordInput
            label="Mật khẩu"
            placeholder="Tối thiểu 6 ký tự"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Vai trò"
            data={[
              { value: "3", label: "Sinh viên (Student)" },
              { value: "2", label: "Giảng viên (Lecturer)" },
              { value: "1", label: "Quản trị viên (Admin)" },
            ]}
            value={form.roleId}
            onChange={(val) => setForm({ ...form, roleId: val || "3" })}
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="dark">Thêm tài khoản</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  setForm: (form: any) => void;
}

export function EditUserModal({ opened, onClose, onSubmit, form, setForm }: EditUserModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Cập nhật thông tin tài khoản"
      centered
      size="md"
      radius="2xl"
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="Tên hiển thị"
            placeholder="Ví dụ: Nguyễn Văn A"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="Tên đăng nhập (Username)"
            placeholder="Ví dụ: anv"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextInput
            label="Địa chỉ Email"
            placeholder="Ví dụ: anv@studymate.edu.vn"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Select
            label="Vai trò"
            data={[
              { value: "3", label: "Sinh viên (Student)" },
              { value: "2", label: "Giảng viên (Lecturer)" },
              { value: "1", label: "Quản trị viên (Admin)" },
            ]}
            value={form.roleId}
            onChange={(val) => setForm({ ...form, roleId: val || "3" })}
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="dark">Cập nhật</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (val: string) => void;
  userName: string;
}

export function ChangePasswordModal({
  opened,
  onClose,
  onSubmit,
  value,
  onChange,
  userName,
}: ChangePasswordModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Đổi mật khẩu cho: ${userName}`}
      centered
      size="md"
      radius="2xl"
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
    >
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Tối thiểu 6 ký tự"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" color="dark">
              Thay đổi mật khẩu
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
