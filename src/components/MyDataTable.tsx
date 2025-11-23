import { useState, useMemo } from "react";
import {
  Avatar,
  Checkbox,
  Flex,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from "@mantine/core";

interface Column<T> {
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
}

export function MyDataTable<T extends { id: string }>({
  data,
  columns,
  renderAddButton,
  renderActions,
}: MyDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<string[]>([]);

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        Object.values(item).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      ),
    [data, search]
  );

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

  return (
    <>
      <Flex mb="sm" align="center" justify="space-between">
        <Group>{renderAddButton && renderAddButton()}</Group>
        <TextInput
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 300 }}
        />
      </Flex>

      <ScrollArea>
        <Table miw={800} verticalSpacing="sm">
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
              {columns.map((col) => (
                <Table.Th key={String(col.key)} w={col.width}>
                  {col.title}
                </Table.Th>
              ))}
              {renderActions && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredData.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  <Checkbox
                    checked={selection.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </Table.Td>
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
    </>
  );
}
