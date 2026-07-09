"use client";

import React from "react";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

export const notify = {
  success: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "green",
      icon: <IconCheck size={16} stroke={2.5} />,
      autoClose: 3500,
    });
  },
  error: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "red",
      icon: <IconX size={16} stroke={2.5} />,
      autoClose: 4000,
    });
  },
  warning: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "yellow",
      icon: <IconAlertTriangle size={16} stroke={2.5} />,
      autoClose: 4000,
    });
  },
  info: (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description || "",
      color: "blue",
      icon: <IconInfoCircle size={16} stroke={2.5} />,
      autoClose: 3500,
    });
  },
};
