import { useState, useMemo, useEffect } from "react";
import {
  Avatar,
  Checkbox,
  Flex,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  Select,
  Pagination,
} from "@mantine/core";

export interface Column<T> {
  key: keyof T;
  title: string;
  render?: (row: T) => React.ReactNode;
  width?: number | string;
}

interface MyDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderAddButton?: () => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;

  /**
   * Optional: initial page size
   */
  initialPageSize?: number;
  /**
   * Optional page size options
   */
  pageSizeOptions?: number[];
}

/**
 * Generic data table with searching, selection, STT and client-side pagination.
 *
 * T must have `id: string`.
 */
export function MyDataTable<T extends { id: string }>({
  data,
  columns,
  renderAddButton,
  renderActions,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: MyDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<string[]>([]);

  // pagination state
  const [page, setPage] = useState(1); // 1-based for Mantine Pagination
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // filter data by search
  const filteredData = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter((item) =>
      Object.values(item).some((v) => String(v).toLowerCase().includes(s))
    );
  }, [data, search]);

  // reset page to 1 whenever filters / pageSize change or data length shrinks
  useEffect(() => {
    setPage(1);
  }, [search, pageSize, data.length]);

  const total = filteredData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // current page slice (client-side)
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, page, pageSize]);

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === filteredData.length
        ? []
        : filteredData.map((item) => item.id)
    );

  // helper to compute global index (STT) shown in table (1-based across filtered data)
  const globalIndexForRow = (rowIndexInPage: number) =>
    (page - 1) * pageSize + rowIndexInPage + 1;

  return (
    <>
      <Flex align="center" justify="space-between" mb="sm">
        <Group>{renderAddButton && renderAddButton()}</Group>

        <Group gap="xs">
          <TextInput
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: 300 }}
          />

          <Select
            value={String(pageSize)}
            onChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
            data={pageSizeOptions.map((n) => ({
              value: String(n),
              label: `${n} / trang`,
            }))}
            size="sm"
            style={{ width: 120 }}
          />
        </Group>
      </Flex>

      <ScrollArea>
        <Table
          miw={800}
          verticalSpacing="sm"
          striped
          withTableBorder
          withColumnBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  onChange={toggleAll}
                  checked={
                    selection.length === filteredData.length &&
                    filteredData.length > 0
                  }
                  indeterminate={
                    selection.length > 0 &&
                    selection.length !== filteredData.length
                  }
                />
              </Table.Th>

              {/* STT column */}
              <Table.Th w={60}>STT</Table.Th>

              {columns.map((col) => (
                <Table.Th key={String(col.key)} w={col.width}>
                  {col.title}
                </Table.Th>
              ))}

              {renderActions && <Table.Th>Thao tác</Table.Th>}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {pagedData.map((row, idx) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  <Checkbox
                    checked={selection.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </Table.Td>

                <Table.Td>{globalIndexForRow(idx)}</Table.Td>

                {columns.map((col) => (
                  <Table.Td key={String(col.key)}>
                    {col.render ? col.render(row) : String(row[col.key])}
                  </Table.Td>
                ))}

                {renderActions && <Table.Td>{renderActions(row)}</Table.Td>}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* footer: info + pagination */}
      <Flex align="center" justify="space-between" mt="sm">
        <Text size="sm" color="dimmed">
          Hiển thị{" "}
          {total === 0
            ? "0"
            : `${(page - 1) * pageSize + 1} - ${Math.min(
                page * pageSize,
                total
              )}`}{" "}
          / {total}
        </Text>

        <Pagination total={pageCount} onChange={(p) => setPage(p)} size="sm" />
      </Flex>
    </>
  );
}
