"use client";
import { MyDataTable } from "@/components/MyDataTable";
import MyLayoutAdmin from "@/components/MyLayoutAdmin";
import { IPhotoAlbum } from "@/modules/interface/IPhotoAlbum";
import { ActionIcon, Avatar, Box, Button, Group, Text } from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

// Fetch từ backend
const fetchPhotos = async (): Promise<IPhotoAlbum[]> => {
  const res = await fetch("http://localhost:4000/api/photos");
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
};

export default function AlbumPage() {
  const {
    data: albums,
    isLoading,
    isError,
    error,
  } = useQuery<IPhotoAlbum[]>({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <MyLayoutAdmin title="Quản lý album">
      <MyDataTable
        data={albums && albums.length > 0 ? albums : []}
        columns={[
          {
            key: "coverImage",
            title: "Cover",
            render: (row: IPhotoAlbum) => (
              <Avatar src={row.coverImage} size={40} radius={8} />
            ),
          },
          { key: "title", title: "Tên Album" },
          { key: "description", title: "Mô tả" },
          {
            key: "photos",
            title: "Số ảnh",
          },
        ]}
        renderAddButton={() => <Button color="green">Thêm Album</Button>}
        renderActions={(row: IPhotoAlbum) => (
          <Group gap="xs">
            <ActionIcon color="blue">
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon color="yellow">
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon color="red">
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      />
    </MyLayoutAdmin>
  );
}
