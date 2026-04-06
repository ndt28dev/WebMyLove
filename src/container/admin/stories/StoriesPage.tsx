"use client";

import { useState } from "react";
import { ActionIcon, Badge, Button, Group, Image, Text } from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import MyLayoutAdmin from "@/components/MyLayoutAdmin";
import { MyDataTable, type Column } from "@/components/MyDataTable";
import { IStory, StoryDetailBlock } from "@/modules/interface/IStory";
import CreateUpdateStoryModal from "./CreateUpdateStoryModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StoryViewerModal from "./StoryViewerModal";
import { IconCheck, IconX } from "@tabler/icons-react";

/**
 * Helper: call delete API
 */
async function deleteStoryApi(id: number | string) {
  const res = await fetch(
    `https://mylove-backend-server-production.up.railway.app/api/stories/${id}`,
    {
      method: "DELETE",
    }
  );
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // return json.data ?? json
  return json;
}

export default function StoriesPage() {
  const [open, setOpen] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const [check, setCheck] = useState<boolean>(true);
  const [storySelect, setStorySelect] = useState<IStory | null>(null);

  const queryClient = useQueryClient();

  // fetch stories from backend
  const {
    data: stories = [],
    isLoading,
    isError,
    error,
  } = useQuery<IStory[]>({
    queryKey: ["stories"],
    queryFn: async () => {
      const res = await fetch(
        "https://mylove-backend-server-production.up.railway.app/api/stories"
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const txt =
          (json && (json.message || json.error)) ||
          res.statusText ||
          "Failed to fetch stories";
        throw new Error(txt);
      }
      // backend may return { success: true, data: [...] } or an array directly
      return (json && (json.data ?? json)) as IStory[];
    },
  });

  // mutation: create
  const createMut = useMutation({
    mutationFn: async (
      payload:
        | FormData
        | { title: string; date?: string; summary?: string; tags?: string[] }
    ) => {
      let res: Response;
      if (payload instanceof FormData) {
        res = await fetch(
          "https://mylove-backend-server-production.up.railway.app/api/stories",
          {
            method: "POST",
            body: payload,
          }
        );
      } else {
        res = await fetch(
          "https://mylove-backend-server-production.up.railway.app/api/stories",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (json && (json.message || json.error)) || "Create failed";
        throw new Error(msg);
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (err: any) => {},
  });

  // mutation: update
  const updateMut = useMutation({
    mutationFn: async (args: {
      id: number | string;
      payload: FormData | Record<string, any>;
    }) => {
      const { id, payload } = args;
      let res: Response;
      if (payload instanceof FormData) {
        res = await fetch(
          `https://mylove-backend-server-production.up.railway.app/api/stories/${id}`,
          {
            method: "PUT",
            body: payload,
          }
        );
      } else {
        res = await fetch(
          `https://mylove-backend-server-production.up.railway.app/api/stories/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (json && (json.message || json.error)) || "Update failed";
        throw new Error(msg);
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (err: any) => {},
  });

  // mutation: delete
  const deleteMut = useMutation({
    mutationFn: (id: number | string) => deleteStoryApi(id),
    // optimistic update
    onMutate: async (id: number | string) => {
      await queryClient.cancelQueries({ queryKey: ["stories"] });

      // snapshot previous list for rollback
      const previous = queryClient.getQueryData<any[]>(["stories"]);

      // optimistic remove: update cache immediately
      if (previous) {
        queryClient.setQueryData(
          ["stories"],
          previous.filter((s) => String(s.id) !== String(id))
        );
      }

      // also remove any cached story-details of this story if you keep them
      queryClient.removeQueries({
        queryKey: ["story-details", String(id)],
        exact: false,
      });

      return { previous };
    },
    onError: (err, id, context: any) => {
      // rollback
      if (context?.previous) {
        queryClient.setQueryData(["stories"], context.previous);
      }
    },
    onSuccess: () => {},
    onSettled: () => {
      // always refetch latest
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  // helper format ngày (dd/mm/yyyy)
  function formatShortDate(d: string | Date | number | undefined) {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const columns: Column<IStory>[] = [
    {
      key: "coverImage",
      title: "Ảnh",
      width: 80,
      render: (row: IStory) => {
        const cover = row.coverImage ?? "";
        const src =
          !cover || cover === ""
            ? "/placeholder.png"
            : cover.startsWith("http")
            ? cover
            : `https://mylove-backend-server-production.up.railway.app/public${cover}`;
        return (
          <Image
            src={src}
            w={60}
            h={60}
            radius={8}
            alt={row.title}
            fit="cover"
          />
        );
      },
    },
    { key: "title", title: "Tên" },
    {
      key: "summary",
      title: "Mô tả",
      render: (row: IStory) => (
        <Text size="sm" w={300}>
          {row.summary ?? ""}
        </Text>
      ),
    },
    {
      key: "date",
      title: "Ngày",
      width: 110,
      render: (row: IStory) => (
        <Text size="sm">{formatShortDate(row.date)}</Text>
      ),
    },
    {
      key: "tags",
      title: "Tags",
      render: (row: IStory) => {
        let tags: string[] = [];

        if (row.tags) {
          try {
            // Nếu tags là JSON string, parse ra mảng
            tags =
              typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags;
          } catch {
            tags = [];
          }
        }

        return (
          <Group gap="xs" w={200}>
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.map((t, idx) => (
                <Badge key={`${row.id}-tag-${idx}`} size="sm">
                  {t}
                </Badge>
              ))
            ) : (
              <Text size="xs" color="dimmed">
                —
              </Text>
            )}
          </Group>
        );
      },
    },
  ];

  // actions
  const handleDelete = (id: number | string) => {
    if (!confirm("Bạn có muốn xóa câu chuyện này?")) return;
    deleteMut.mutate(id);
  };

  // pass to modal: handle submit (create or update)
  const handleModalSubmit = async (values: any, formData?: FormData) => {
    try {
      if (storySelect && !check) {
        // update
        if (formData) {
          await updateMut.mutateAsync({
            id: storySelect.id,
            payload: formData,
          });
        } else {
          await updateMut.mutateAsync({
            id: storySelect.id,
            payload: { ...values, tags: JSON.stringify(values.tags ?? []) },
          });
        }
      } else {
        // create
        if (formData) {
          await createMut.mutateAsync(formData);
        } else {
          await createMut.mutateAsync({
            ...values,
            tags: JSON.stringify(values.tags ?? []),
          });
        }
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại! " + (err as Error).message);
    }
  };

  // When StoryViewerModal calls onAddDetail(detail), we invalidate story-details and optionally stories
  const handleAddDetail = (detail: StoryDetailBlock) => {
    // If you want to refetch stories or story-details, do it here
    // simplest: invalidate queries so UI refreshes
    if (!detail) return;
    // invalidate specific story-details and stories list
    queryClient.invalidateQueries({
      queryKey: ["story-details"],
    });
    queryClient.invalidateQueries({ queryKey: ["stories"] });
  };

  if (isLoading)
    return (
      <MyLayoutAdmin title="Quản lý câu chuyện">
        <Text>Đang tải...</Text>
      </MyLayoutAdmin>
    );
  if (isError)
    return (
      <MyLayoutAdmin title="Quản lý câu chuyện">
        <Text color="red">Lỗi: {(error as Error).message}</Text>
      </MyLayoutAdmin>
    );

  return (
    <>
      <MyLayoutAdmin title="Quản lý câu chuyện">
        <MyDataTable
          data={stories}
          columns={columns}
          renderAddButton={() => (
            <Button
              color="teal"
              onClick={() => {
                setOpen(true);
                setCheck(true);
                setStorySelect(null);
              }}
            >
              Thêm
            </Button>
          )}
          renderActions={(row: IStory) => (
            <Group gap="xs">
              <ActionIcon
                color="blue"
                onClick={() => {
                  setOpenViewer(true);
                  setStorySelect(row);
                }}
              >
                <IconEye size={16} />
              </ActionIcon>
              <ActionIcon
                color="yellow"
                onClick={() => {
                  setOpen(true);
                  setCheck(false);
                  setStorySelect(row);
                }}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon color="red" onClick={() => handleDelete(row.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
        />
      </MyLayoutAdmin>
      <CreateUpdateStoryModal
        opened={open}
        onClose={() => setOpen(false)}
        check={check}
        story={storySelect}
        onSubmit={handleModalSubmit}
      />
      <StoryViewerModal
        onAddDetail={handleAddDetail}
        opened={openViewer}
        onClose={() => {
          setOpenViewer(false);
          setStorySelect(null);
        }}
        album={storySelect}
      />
    </>
  );
}
