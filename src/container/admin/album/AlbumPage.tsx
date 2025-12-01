"use client";
import { MyDataTable } from "@/components/MyDataTable";
import MyLayoutAdmin from "@/components/MyLayoutAdmin";
import { IPhotoAlbum } from "@/modules/interface/IPhotoAlbum";
import { ActionIcon, Button, Group, Image } from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import CreateUpdateAlbumModal, { NewAlbumPayload } from "./CreateUpdateAlbum";
import { useState } from "react";
import AlbumViewerModal from "./AlbumViewerModal";

const DETAILS_URL_BASE = "http://localhost:4000/api";

const fetchPhotos = async (): Promise<IPhotoAlbum[]> => {
  const res = await fetch(`${DETAILS_URL_BASE}/photos`);
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
};

export default function AlbumPage() {
  const [open, setOpen] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const [check, setCheck] = useState<boolean>(true);
  const [albumSelect, setAlbumSelect] = useState<IPhotoAlbum | null>(null);

  const queryClient = useQueryClient();

  const {
    data: albums,
    isLoading,
    isError,
    error,
  } = useQuery<IPhotoAlbum[]>({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  // =============================
  //  ADD
  // =============================
  const addAlbumMutation = useMutation({
    mutationFn: async (payload: NewAlbumPayload) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      if (payload.description)
        formData.append("description", payload.description);
      if (payload.coverImage) formData.append("coverImage", payload.coverImage);

      const res = await fetch(`${DETAILS_URL_BASE}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Request failed: ${res.status} ${errText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  // =============================
  //  UPDATE
  // =============================
  const updateAlbumMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: NewAlbumPayload;
    }) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      if (payload.description)
        formData.append("description", payload.description);

      if (payload.coverImage) formData.append("coverImage", payload.coverImage);

      const res = await fetch(`${DETAILS_URL_BASE}/photos/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Update failed: ${res.status} ${errText}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const handleSubmit = (payload: NewAlbumPayload) => {
    if (check) {
      addAlbumMutation.mutate(payload);
    } else {
      if (!albumSelect) return;
      updateAlbumMutation.mutate({ id: albumSelect.id, payload });
    }
  };

  // =============================
  //  DELETE
  // =============================
  const deleteAlbum = async (id: string, queryClient: QueryClient) => {
    if (!confirm("Bạn có chắc muốn xóa album này?")) return;

    try {
      const res = await fetch(`${DETAILS_URL_BASE}/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }

      queryClient.invalidateQueries({ queryKey: ["photos"] });
    } catch (err: any) {
      alert("Xóa thất bại: " + err.message);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <>
      <MyLayoutAdmin title="Quản lý album">
        <MyDataTable
          data={albums ?? []}
          columns={[
            {
              key: "coverImage",
              title: "Ảnh",
              render: (row: IPhotoAlbum) => (
                <Image
                  src={`${DETAILS_URL_BASE.replace("/api", "")}/public${
                    row.coverImage
                  }`}
                  w={60}
                  h={60}
                  radius={8}
                />
              ),
            },
            { key: "title", title: "Tên" },
            { key: "description", title: "Mô tả" },
          ]}
          renderAddButton={() => (
            <Button
              color="teal"
              onClick={() => {
                setOpen(true);
                setCheck(true);
                setAlbumSelect(null);
              }}
            >
              Thêm
            </Button>
          )}
          renderActions={(row: IPhotoAlbum) => (
            <Group gap="xs">
              <ActionIcon
                color="blue"
                onClick={() => {
                  setOpenViewer(true);
                  setAlbumSelect(row);
                }}
              >
                <IconEye size={16} />
              </ActionIcon>

              <ActionIcon
                color="yellow"
                onClick={() => {
                  setOpen(true);
                  setCheck(false);
                  setAlbumSelect(row);
                }}
              >
                <IconEdit size={16} />
              </ActionIcon>

              <ActionIcon
                color="red"
                onClick={() => deleteAlbum(row.id, queryClient)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
        />
      </MyLayoutAdmin>

      <CreateUpdateAlbumModal
        title={check ? "Thêm album mới" : "Cập nhật album"}
        opened={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        defaultData={albumSelect}
      />

      <AlbumViewerModal
        opened={openViewer}
        onClose={() => setOpenViewer(false)}
        album={albumSelect}
      />
    </>
  );
}
