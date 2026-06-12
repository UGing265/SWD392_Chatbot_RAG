import { notifications } from "@mantine/notifications";

export const notify = {
  success: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "green",
    });
  },
  error: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "red",
    });
  },
  warning: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "yellow",
    });
  },
  info: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "blue",
    });
  },
};
