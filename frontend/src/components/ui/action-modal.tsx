"use client";

import type { ReactNode } from "react";
import { Modal, type ModalProps } from "@mantine/core";

interface ActionModalProps extends ModalProps {
  children: ReactNode;
}

/**
 * A wrapper around Mantine's Modal that strictly adheres to DESIGN_SYSTEM.md:
 * - `radius="2xl"` (16px)
 * - Backdrop blur overlay
 * - Centered
 */
export function ActionModal({ children, ...props }: ActionModalProps) {
  return (
    <Modal
      centered
      radius="2xl"
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      {...props}
    >
      {children}
    </Modal>
  );
}
