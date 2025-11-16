"use client";
import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { TextInput, Box } from "@mantine/core";

type Person = {
  name: {
    firstName: string;
    lastName: string;
  };
  address: string;
  city: string;
  state: string;
};

const data: Person[] = [
  {
    name: { firstName: "Zachary", lastName: "Davis" },
    address: "261 Battle Ford",
    city: "Columbus",
    state: "Ohio",
  },
  {
    name: { firstName: "Robert", lastName: "Smith" },
    address: "566 Brakus Inlet",
    city: "Westerville",
    state: "West Virginia",
  },
  {
    name: { firstName: "Kevin", lastName: "Yan" },
    address: "7777 Kuhic Knoll",
    city: "South Linda",
    state: "West Virginia",
  },
  {
    name: { firstName: "John", lastName: "Upton" },
    address: "722 Emie Stream",
    city: "Huntington",
    state: "Washington",
  },
  {
    name: { firstName: "Nathan", lastName: "Harris" },
    address: "1 Kuhic Knoll",
    city: "Ohiowa",
    state: "Nebraska",
  },
];

const MyDataTable = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      { accessorKey: "name.firstName", header: "First Name" },
      { accessorKey: "name.lastName", header: "Last Name" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "state", header: "State" },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
    // nếu muốn ẩn global filter mặc định (nếu có), có thể tắt column filters / global filter UI mặc định:
    // enableToolbarInternalActions: true, // giữ mặc định toolbar actions (tuỳ bạn)
    // enableGlobalFilterModes: false, // tùy feature flags
    // --- Tùy chọn quan trọng: mình render ô tìm riêng ở top + render footer custom ---
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            gap: 8,
          }}
        >
          <TextInput
            placeholder="Tìm kiếm..."
            // Lấy giá trị hiện tại của global filter (hoặc empty string)
            value={(table.getState().globalFilter ?? "") as string}
            onChange={(e) => {
              table.setGlobalFilter(e.target.value || undefined);
            }}
            style={{ width: 320 }}
          />
        </Box>
      );
    },
    renderBottomToolbarCustomActions: ({ table }) => {
      return (
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Bạn có thể thêm bất kỳ action footer nào ở đây.
              Ví dụ: hiện text tổng số rows + nút custom */}
          <div>
            {`Rows: ${
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
              1
            } - ${Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getRowModel().rows.length
            )} / ${table.getRowModel().rows.length}`}
          </div>
        </Box>
      );
    },
  });

  return <MantineReactTable table={table} />;
};

export default MyDataTable;
