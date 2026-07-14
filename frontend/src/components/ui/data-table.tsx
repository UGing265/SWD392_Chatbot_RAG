"use client";

import { Table, type TableProps } from "@mantine/core";
import type { ReactNode } from "react";

interface DataTableProps extends TableProps {
  columns: {
    key: string;
    label: string | ReactNode;
    className?: string;
  }[];
  children: ReactNode;
  minWidth?: number;
}

/**
 * A wrapper around Mantine's Table that enforces DESIGN_SYSTEM.md styles:
 * - Striped, highlight-on-hover
 * - Wrapped in Table.ScrollContainer
 * - Standardized monospace table headers
 */
export function DataTable({ columns, children, minWidth = 800, ...props }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-zinc-200">
      <Table.ScrollContainer minWidth={minWidth}>
        <Table striped highlightOnHover verticalSpacing="md" withRowBorders {...props}>
          <Table.Thead className="bg-zinc-50">
            <Table.Tr style={{ borderBottomWidth: 1.5 }}>
              {columns.map((col) => (
                <Table.Th
                  key={col.key}
                  className={`font-mono text-[11px] uppercase tracking-widest text-zinc-500 ${col.className || ""}`}
                >
                  {col.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{children}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );
}
