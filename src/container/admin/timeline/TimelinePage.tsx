"use client";

import { useState } from "react";
import { MyDataTable } from "@/components/MyDataTable";
import MyLayoutAdmin from "@/components/MyLayoutAdmin";
import { Text, Button, Group, ActionIcon } from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { ILoveTimeline } from "@/modules/interface/ILoveTimeline";
import { formatDate } from "@/utils/Format";
import CreateUpdateTimelineModal from "./CreateUpdateTimelineModal";
import TimelineViewerModal from "./TimelineViewerModal";

const API_BASE = "https://my-love-backend-production-6dbc.up.railway.app/api";

const fetchTimeline = async () => {
  const res = await fetch(`${API_BASE}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
};

export default function TimelinePage() {
  const [openModal, setOpenModal] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState<any>(null);
  const [timelineSelect, setTimelineSelect] = useState<ILoveTimeline | null>(
    null
  );

  const queryClient = useQueryClient();

  const {
    data: timelines,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["timeline"],
    queryFn: fetchTimeline,
  });

  const addTimelineMutation = useMutation({
    mutationFn: async (payload: ILoveTimeline) => {
      const res = await fetch(`${API_BASE}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Add failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeline"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ILoveTimeline;
    }) => {
      const res = await fetch(`${API_BASE}/timeline/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timeline"] }),
  });

  const handleSubmit = (payload: ILoveTimeline) => {
    if (isNew) {
      addTimelineMutation.mutate(payload);
    } else {
      if (!selectedTimeline) return;
      updateTimelineMutation.mutate({ id: selectedTimeline.id, payload });
    }
    setOpenModal(false);
  };

  const deleteTimeline = async (id: string, queryClient: QueryClient) => {
    if (!confirm("Bạn có chắc muốn xóa mốc thời gian này?")) return;
    const res = await fetch(`${API_BASE}/timeline/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const txt = await res.text();
      alert(txt || "Delete failed");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["timeline"] });
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {(error as Error).message}</Text>;

  return (
    <MyLayoutAdmin title="Quản lý mốc thời gian">
      <MyDataTable
        data={timelines ?? []}
        columns={[
          {
            key: "date",
            title: "Ngày",
            render: (row: any) => <span>{formatDate(new Date(row.date))}</span>,
          },
          { key: "title", title: "Tiêu đề" },
          {
            key: "description",
            title: "Mô tả",
            render: (row: any) => (
              <Text w={300} size="sm">
                {row.description}
              </Text>
            ),
          },
          { key: "icon", title: "Icon" },
        ]}
        renderAddButton={() => (
          <Button
            color="teal"
            onClick={() => {
              setOpenModal(true);
              setIsNew(true);
              setSelectedTimeline(null);
            }}
          >
            Thêm
          </Button>
        )}
        renderActions={(row: any) => (
          <Group gap="xs">
            <ActionIcon
              color="blue"
              onClick={() => {
                setOpenViewer(true);
                setTimelineSelect(row);
              }}
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              color="yellow"
              onClick={() => {
                setOpenModal(true);
                setIsNew(false);
                setSelectedTimeline(row);
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              color="red"
              onClick={() => deleteTimeline(row.id, queryClient)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      />

      <CreateUpdateTimelineModal
        opened={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
        defaultData={selectedTimeline}
        title={isNew ? "Thêm mốc thời gian" : "Cập nhật mốc thời gian"}
      />
      <TimelineViewerModal
        opened={openViewer}
        onClose={() => setOpenViewer(false)}
        timeline={timelineSelect}
      />
    </MyLayoutAdmin>
  );
}
