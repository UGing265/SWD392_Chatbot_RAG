import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },
};
