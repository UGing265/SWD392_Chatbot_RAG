import { useState, useEffect } from "react";
import { adminUserApi } from "@/api/admin-user";
import { notify } from "@/lib/notifications";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Selected user
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Forms data
  const [createForm, setCreateForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "3", // default to Student
  });

  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    roleId: "3",
  });

  const [newPassword, setNewPassword] = useState("");

  const useMockData = () => {
    const mockUsers = [
      {
        id: "U-001",
        name: "Lâm Minh Triết",
        email: "trietlm@fpt.edu.vn",
        username: "trietlm",
        roleId: 3,
        role: "Student",
        status: "ĐANG HOẠT ĐỘNG",
        active: true,
      },
      {
        id: "U-002",
        name: "Nguyễn Văn Minh",
        email: "minhnv@fe.edu.vn",
        username: "minhnv",
        roleId: 2,
        role: "Lecturer",
        status: "ĐANG HOẠT ĐỘNG",
        active: true,
      },
      {
        id: "U-003",
        name: "Trần Thị Thu",
        email: "thutt@fe.edu.vn",
        username: "thutt",
        roleId: 2,
        role: "Lecturer",
        status: "ĐANG HOẠT ĐỘNG",
        active: true,
      },
      {
        id: "U-004",
        name: "Hệ thống Admin",
        email: "admin@fpt.edu.vn",
        username: "admin",
        roleId: 1,
        role: "Admin",
        status: "ĐANG HOẠT ĐỘNG",
        active: true,
      },
      {
        id: "U-005",
        name: "Lê Hoàng Long",
        email: "longlh@fpt.edu.vn",
        username: "longlh",
        roleId: 3,
        role: "Student",
        status: "BỊ KHÓA",
        active: false,
      },
    ];
    setUsers(mockUsers);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUserApi.getUsers();
      const mapped = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username || "",
        roleId: u.role_id,
        role: u.role_id === 1 ? "Admin" : u.role_id === 2 ? "Lecturer" : "Student",
        status: u.is_blocked ? "BỊ KHÓA" : "ĐANG HOẠT ĐỘNG",
        active: !u.is_blocked,
      }));
      setUsers(mapped);
    } catch (error) {
      console.warn("Failed to fetch users, falling back to mock data:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: string, active: boolean) => {
    const action = active ? "block" : "unblock";
    try {
      await adminUserApi.toggleBlock(userId, action);
      notify.success(
        active ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
        "Trạng thái tài khoản đã được cập nhật.",
      );
      fetchUsers();
    } catch (error) {
      notify.error("Thao tác thất bại", "Vui lòng thử lại sau.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminUserApi.createUser(createForm);
      notify.success("Tạo tài khoản thành công", `Tài khoản ${createForm.name} đã được tạo.`);
      setIsCreateOpen(false);
      setCreateForm({ name: "", username: "", email: "", password: "", roleId: "3" });
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Không thể kết nối đến máy chủ xác thực.";
      notify.error("Tạo tài khoản thất bại", errMsg);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await adminUserApi.updateUser(selectedUser.id, editForm);
      notify.success("Cập nhật thành công", "Thông tin tài khoản đã được thay đổi.");
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Không thể kết nối đến máy chủ xác thực.";
      notify.error("Cập nhật thất bại", errMsg);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await adminUserApi.changePassword(selectedUser.id, newPassword);
      notify.success("Thay đổi mật khẩu thành công", `Mật khẩu mới đã được áp dụng.`);
      setIsPasswordOpen(false);
      setNewPassword("");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Vui lòng thử lại.";
      notify.error("Đổi mật khẩu thất bại", errMsg);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await adminUserApi.deleteUser(userId);
      notify.success("Xóa tài khoản thành công", `Tài khoản của ${userName} đã bị xóa.`);
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Vui lòng thử lại.";
      notify.error("Xóa tài khoản thất bại", errMsg);
    }
  };

  const openCreateModal = () => {
    setCreateForm({ name: "", username: "", email: "", password: "", roleId: "3" });
    setIsCreateOpen(true);
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: String(user.roleId),
    });
    setIsEditOpen(true);
  };

  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  return {
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
    refresh: fetchUsers,
  };
}
