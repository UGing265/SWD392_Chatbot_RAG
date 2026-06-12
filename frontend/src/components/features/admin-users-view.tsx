"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Lock,
  Unlock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";

export function AdminUsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Selected user and active menu states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "3", // default to Student
  });

  const [editData, setEditData] = useState({
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
      const response = await fetch("http://localhost:8080/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedUsers = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username || "",
          roleId: u.role_id,
          role: u.role_id === 1 ? "Admin" : (u.role_id === 2 ? "Lecturer" : "Student"),
          status: u.is_blocked ? "BỊ KHÓA" : "ĐANG HOẠT ĐỘNG",
          active: !u.is_blocked,
        }));
        setUsers(mappedUsers);
      } else {
        console.warn("Failed to fetch users, falling back to mock data");
        useMockData();
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: string, currentlyActive: boolean) => {
    const action = currentlyActive ? "block" : "unblock";
    const confirmMessage = currentlyActive 
      ? "Bạn có chắc chắn muốn khóa tài khoản này?" 
      : "Bạn có chắc chắn muốn mở khóa tài khoản này?";

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        notify.success(
          currentlyActive ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
          "Trạng thái tài khoản đã được cập nhật."
        );
        fetchUsers();
      } else {
        notify.error("Thao tác thất bại", "Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error toggling user block:", error);
      notify.error("Đã xảy ra lỗi khi thực hiện thao tác");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        notify.success("Tạo tài khoản thành công", `Tài khoản ${formData.name} đã được tạo.`);
        setIsCreateModalOpen(false);
        setFormData({ name: "", username: "", email: "", password: "", roleId: "3" });
        fetchUsers();
      } else {
        notify.error("Tạo tài khoản thất bại", data.error || "Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error(err);
      notify.error("Lỗi kết nối", "Không thể kết nối đến máy chủ xác thực.");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (response.ok) {
        notify.success("Cập nhật thành công", "Thông tin tài khoản đã được thay đổi.");
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        notify.error("Cập nhật thất bại", data.error || "Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      console.error(err);
      notify.error("Lỗi kết nối", "Không thể kết nối đến máy chủ xác thực.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        notify.success("Thay đổi mật khẩu thành công", `Mật khẩu mới đã được áp dụng.`);
        setIsChangePasswordModalOpen(false);
        setNewPassword("");
      } else {
        notify.error("Đổi mật khẩu thất bại", data.error || "Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      notify.error("Lỗi kết nối", "Không thể kết nối đến máy chủ xác thực.");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${userName}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        notify.success("Xóa tài khoản thành công", `Tài khoản của ${userName} đã bị xóa.`);
        fetchUsers();
      } else {
        notify.error("Xóa tài khoản thất bại", data.error || "Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      notify.error("Lỗi kết nối", "Không thể kết nối đến máy chủ xác thực.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý tài khoản người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý vai trò và trạng thái truy cập của người dùng trong hệ thống
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", username: "", email: "", password: "", roleId: "3" });
            setIsCreateModalOpen(true);
          }}
          className="flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm người dùng theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border/60 bg-white pl-11 pr-4 text-sm shadow-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="pl-6 h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Tên người dùng
                  </TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vai trò
                  </TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </TableHead>
                  <TableHead className="pr-6 h-12 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="pl-6 py-4">
                      <span className="text-sm font-semibold text-foreground">
                        {user.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-foreground">{user.role}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-tight",
                          user.active
                            ? "bg-success-soft text-success-foreground"
                            : "bg-rose-soft text-rose-foreground"
                        )}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.active ? (
                          <button
                            onClick={() => handleToggleBlock(user.id, true)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleBlock(user.id, false)}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-success-soft hover:text-success-foreground hover:border-success/30"
                          >
                            <Unlock className="h-3.5 w-3.5" />
                            Mở khóa
                          </button>
                        )}
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeMenuUserId === user.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuUserId(null)} />
                              <div className="absolute right-0 mt-1 z-50 w-48 rounded-2xl border border-border bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setEditData({
                                      name: user.name,
                                      username: user.username,
                                      email: user.email,
                                      roleId: String(user.roleId),
                                    });
                                    setIsEditModalOpen(true);
                                    setActiveMenuUserId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-foreground font-medium transition-all hover:bg-muted/60"
                                >
                                  Sửa thông tin
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsChangePasswordModalOpen(true);
                                    setActiveMenuUserId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-foreground font-medium transition-all hover:bg-muted/60"
                                >
                                  Đổi mật khẩu
                                </button>
                                <div className="my-1 border-t border-border/60" />
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user.id, user.name);
                                    setActiveMenuUserId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 font-semibold transition-all hover:bg-rose-50"
                                >
                                  Xóa người dùng
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Hiển thị {filteredUsers.length} trên {users.length} người dùng
              </p>
              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">
                  1
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-4">Thêm tài khoản mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: anv"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: anv@studymate.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Vai trò
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                >
                  <option value="3">Sinh viên (Student)</option>
                  <option value="2">Giảng viên (Lecturer)</option>
                  <option value="1">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-soft hover:bg-primary/90"
                >
                  Thêm tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-4">Cập nhật thông tin tài khoản</h3>
            <form onSubmit={handleEditUser} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: anv"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: anv@studymate.edu.vn"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Vai trò
                </label>
                <select
                  value={editData.roleId}
                  onChange={(e) => setEditData({ ...editData, roleId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-border/60 px-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                >
                  <option value="3">Sinh viên (Student)</option>
                  <option value="2">Giảng viên (Lecturer)</option>
                  <option value="1">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-soft hover:bg-primary/90"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsChangePasswordModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-4">Đổi mật khẩu cho: {selectedUser.name}</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border/60 px-3.5 text-sm focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/5 text-foreground bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-soft hover:bg-primary/90"
                >
                  Thay đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
