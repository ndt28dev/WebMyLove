import MyDataTable from "@/components/MyDataTable";
import MyLayoutAdmin from "@/components/MyLayoutAdmin";
import { Box, Divider, Stack, Text, Title } from "@mantine/core";

export default function AlbumPage() {
  return (
    <MyLayoutAdmin title="Quản lý album">
      <MyDataTable />
    </MyLayoutAdmin>
  );
}
