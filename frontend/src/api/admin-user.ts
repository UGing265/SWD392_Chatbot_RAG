import { ragApi, authApi } from "./client";

export const adminUserApi = {
  // Go Backend (Port 8080)
  getUsers: async () => {
    const response = await ragApi.get("/admin/users");
    return response.data;
  },

  toggleBlock: async (userId: string, action: "block" | "unblock") => {
    const response = await ragApi.post(`/admin/users/${userId}/${action}`);
    return response.data;
  },

  // Auth Backend (Port 5000)
  createUser: async (payload: any) => {
    const response = await authApi.post("/admin/users", payload);
    return response.data;
  },

  updateUser: async (userId: string, payload: any) => {
    const response = await authApi.put(`/admin/users/${userId}`, payload);
    return response.data;
  },

  changePassword: async (userId: string, passwordNew: string) => {
    const response = await authApi.put(`/admin/users/${userId}/password`, { password: passwordNew });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await authApi.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
