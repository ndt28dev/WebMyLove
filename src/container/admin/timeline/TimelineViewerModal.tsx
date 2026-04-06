// src/components/TimelineViewerModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Group,
  Stack,
  SimpleGrid,
  Card,
  TextInput,
  FileInput,
  Text,
  ActionIcon,
  Image,
  Box,
  Loader,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { ILoveTimeline, ILovePhoto } from "@/modules/interface/ILoveTimeline";
import { LoveType } from "@/modules/enum/LoveType";

type Props = {
  opened: boolean;
  onClose: () => void;
  timeline?: ILoveTimeline | null;
  onSubmit?: (payload: ILoveTimeline) => Promise<void> | void;
};

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE as string) ||
  "https://mylove-backend-server-production.up.railway.app";

export default function TimelineViewerModal({
  opened,
  onClose,
  timeline,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(timeline?.title ?? "");
  const [description, setDescription] = useState(timeline?.description ?? "");
  const [date, setDate] = useState(
    timeline?.date ? new Date(timeline.date).toISOString().slice(0, 10) : ""
  );

  const [media, setMedia] = useState<
    Array<ILovePhoto & { file?: File | null }>
  >((timeline?.photos ?? []) as any);

  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const originalPhotosRef = useRef<Array<ILovePhoto>>([]);
  useEffect(() => {
    if (timeline?.photos) {
      originalPhotosRef.current = timeline.photos;
    } else {
      originalPhotosRef.current = [];
    }
  }, [timeline]);

  const fullApiUrl = (url: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  };

  // helper: derive final src for media (handles blob: and server stored path)
  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("/public")) return `${API_BASE}${url}`;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return `${API_BASE}/public${url.startsWith("/") ? url : "/" + url}`;
  };

  useEffect(() => {
    if (!opened) return;

    let abort = false;
    const controller = new AbortController();

    const loadPhotos = async () => {
      if (timeline && (timeline as any).id) {
        try {
          setLoadingPhotos(true);
          const res = await fetch(
            fullApiUrl(`/api/timeline-photos/timeline/${(timeline as any).id}`),
            { signal: controller.signal, credentials: "same-origin" }
          );
          if (!res.ok) {
            console.warn("Failed fetching timeline photos:", res.statusText);
            if (!abort) {
              setMedia(
                (timeline.photos ?? []).map((p) => ({ ...p, file: undefined }))
              );
              originalPhotosRef.current = timeline.photos ?? [];
            }
          } else {
            const text = await res.text();
            let data: any = {};
            try {
              data = text ? JSON.parse(text) : {};
            } catch (err) {
              console.warn("Invalid JSON from photos API:", err);
            }
            const photosFromApi: ILovePhoto[] = Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
              ? data
              : [];

            if (!abort) {
              setMedia(photosFromApi.map((p) => ({ ...p, file: undefined })));
              originalPhotosRef.current = photosFromApi;
            }
          }
        } catch (err: any) {
          if (err.name === "AbortError") {
          } else {
            console.warn("Error fetching timeline photos:", err);
            if (!abort) {
              setMedia(
                (timeline?.photos ?? []).map((p) => ({ ...p, file: undefined }))
              );
              originalPhotosRef.current = timeline?.photos ?? [];
            }
          }
        } finally {
          if (!abort) setLoadingPhotos(false);
        }
      } else {
        setMedia(
          (timeline?.photos ?? []).map((p) => ({ ...p, file: undefined }))
        );
        originalPhotosRef.current = timeline?.photos ?? [];
      }
    };

    loadPhotos();

    return () => {
      abort = true;
      controller.abort();
    };
  }, [timeline?.id, opened]);

  useEffect(() => {
    if (timeline) {
      setTitle(timeline.title ?? "");
      setDescription(timeline.description ?? "");
      setDate(
        timeline.date ? new Date(timeline.date).toISOString().slice(0, 10) : ""
      );
      if (!timeline.id) {
        setMedia(
          (timeline.photos ?? []).map((p) => ({ ...p, file: undefined })) as any
        );
        originalPhotosRef.current = timeline.photos ?? [];
      }
    } else {
      setTitle("");
      setDescription("");
      setDate("");
      setMedia([]);
      originalPhotosRef.current = [];
    }
  }, [timeline, opened]);

  const revokeIfBlob = (url?: string) => {
    try {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  };

  const addMedia = () => {
    setMedia((prev) => [
      ...prev,
      { id: Date.now(), url: "", type: "image", caption: "", file: null },
    ]);
  };

  const updateMedia = (
    id: number,
    field: keyof ILovePhoto | "file",
    value: string | File | null
  ) => {
    setMedia((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (field === "file") {
          const oldFile = (m as any).file as File | undefined;
          if (oldFile && (m.url || "").startsWith("blob:")) {
            revokeIfBlob(m.url);
          }
          const file = value as File | null;
          if (!file) {
            return { ...m, file: null };
          }
          const url = URL.createObjectURL(file);
          const type = file.type.startsWith("video") ? "video" : "image";
          return { ...m, file, url, type };
        }
        return { ...m, [field]: value };
      })
    );
  };

  const handleFileChange = (id: number, file: File | null) => {
    if (!file) return;
    updateMedia(id, "file", file);
  };

  const deletePhotoApi = async (id: number) => {
    try {
      const res = await fetch(fullApiUrl(`/api/timeline-photos/${id}`), {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Delete failed (${res.status})`);
      }
      return true;
    } catch (err) {
      console.warn("deletePhotoApi error:", err);
      return false;
    }
  };

  const handleRemoveMedia = async (id: number) => {
    const item = media.find((m) => m.id === id);
    if (!item) return;

    const ok = window.confirm("Bạn có chắc muốn xóa ảnh/video này?");
    if (!ok) return;

    const isRemote =
      !!(item as any).id &&
      originalPhotosRef.current.some((p) => p.id === item.id);
    if (isRemote) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
      originalPhotosRef.current = originalPhotosRef.current.filter(
        (p) => p.id !== id
      );

      const success = await deletePhotoApi(id);
      if (!success) {
        alert("Xóa ảnh trên server thất bại. Vui lòng thử lại.");
        setMedia((prev) => [item, ...prev]);
        originalPhotosRef.current = [
          item as ILovePhoto,
          ...originalPhotosRef.current,
        ];
      } else {
        revokeIfBlob(item.url);
      }
    } else {
      revokeIfBlob(item.url);
      setMedia((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const jsonFetch = async (url: string, opts: RequestInit = {}) => {
    const full = fullApiUrl(url);
    const res = await fetch(full, {
      credentials: "same-origin",
      headers: { ...(opts.headers || {}) },
      ...opts,
    });
    const text = await res.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      throw new Error(
        `Invalid JSON response from ${full}: ${text.substring(0, 1000)}`
      );
    }

    if (!res.ok) {
      const msg =
        data?.message || data?.error || res.statusText || "Request failed";
      throw new Error(`${msg} (url: ${full}, status: ${res.status})`);
    }
    return data;
  };

  // ---------- Viewer modal state & helper ----------
  const [viewerOpened, setViewerOpened] = useState(false);
  const [viewerSrc, setViewerSrc] = useState("");
  const [viewerType, setViewerType] = useState<"image" | "video">("image");
  const [viewerCaption, setViewerCaption] = useState("");

  const openViewer = (item: ILovePhoto & { file?: File | null }) => {
    const src = item.url
      ? item.url.startsWith("blob:")
        ? item.url
        : getMediaUrl(item.url)
      : "";
    setViewerSrc(src);
    setViewerType((item.type as any) === "video" ? "video" : "image");
    setViewerCaption(item.caption ?? "");
    setViewerOpened(true);
  };

  // ---------- Submit logic (modified to NOT update title/date/description for existing timeline) ----------
  const handleSubmit = async () => {
    if (!title.trim() || !date) {
      alert("Vui lòng nhập ngày và tiêu đề");
      return;
    }

    try {
      // If timeline exists, we DO NOT update title/description/date on server.
      // We only use these values when creating a new timeline.
      let timelineId: number;
      if (timeline?.id) {
        timelineId = timeline.id;
      } else {
        // create new timeline
        const payloadTimeline: Partial<ILoveTimeline> = {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          icon: timeline?.icon ?? LoveType.MEET_DAY,
        };

        const res = await jsonFetch(`/api/timeline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadTimeline),
        });
        timelineId = res.data?.id;
        if (!timelineId)
          throw new Error("Không nhận được id timeline sau khi tạo");
      }

      // handle deleted photos
      const originalPhotos = originalPhotosRef.current ?? [];
      const currentIds = new Set(media.map((m) => m.id));

      const deleted = originalPhotos.filter((op) => !currentIds.has(op.id));
      for (const del of deleted) {
        if ((del as any).id) {
          try {
            await fetch(fullApiUrl(`/api/timeline-photos/${del.id}`), {
              method: "DELETE",
              credentials: "same-origin",
            });
          } catch (err) {
            console.warn("Failed to delete photo", del.id, err);
          }
        }
      }

      const originalById = new Map<number, ILovePhoto>();
      for (const op of originalPhotos) originalById.set(op.id, op);

      for (const item of media) {
        const orig = originalById.get(item.id as number);
        const isExisting = !!orig;

        if (item.file) {
          const form = new FormData();
          form.append("photo", item.file);
          form.append("timeline_id", String(timelineId));
          if (item.type) form.append("type", item.type);
          if (item.caption) form.append("caption", item.caption);

          if (isExisting && item.id) {
            await fetch(fullApiUrl(`/api/timeline-photos/${item.id}`), {
              method: "PUT",
              body: form,
              credentials: "same-origin",
            });
          } else {
            await fetch(fullApiUrl(`/api/timeline-photos`), {
              method: "POST",
              body: form,
              credentials: "same-origin",
            });
          }
          continue;
        }

        if (isExisting && item.id) {
          const changed =
            (item.caption ?? "") !== (orig.caption ?? "") ||
            (item.type ?? "") !== (orig.type ?? "") ||
            (item.url ?? "") !== (orig.url ?? "");

          if (changed) {
            await jsonFetch(`/api/timeline-photos/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                timeline_id: timelineId,
                url: item.url,
                type: item.type,
                caption: item.caption,
              }),
            });
          }
        } else {
          await jsonFetch(`/api/timeline-photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timeline_id: timelineId,
              url: item.url,
              type: item.type,
              caption: item.caption,
            }),
          });
        }
      }

      // build result payload to return via onSubmit
      const resultPayload: ILoveTimeline = {
        id: timelineId,
        // keep original title/description/date if editing existing timeline
        title: timeline?.title ?? title.trim(),
        description: timeline?.description ?? description.trim(),
        date: timeline?.date ? new Date(timeline.date) : new Date(date),
        icon: timeline?.icon ?? LoveType.MEET_DAY,
        photos: media.map(({ file, ...rest }) => rest as ILovePhoto),
      };

      if (onSubmit) await onSubmit(resultPayload);
      onClose();
    } catch (err: any) {
      console.error("Submit timeline error:", err);
      alert(err?.message || "Lỗi khi lưu timeline");
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Chi tiết Timeline"
        size="xl"
      >
        <Stack gap="xs">
          <Group gap={5}>
            <Text fw={600}>Tiêu đề:</Text>
            <Text>{title}</Text>
          </Group>
          <Group gap={5} align="flex-start">
            <Text fw={600}>Mô tả:</Text>
            <Text flex={1}>{description}</Text>
          </Group>
          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={addMedia}>
              Thêm ảnh/video({media.length})
            </Button>
            {loadingPhotos && <Loader size="xs" />}
          </Group>

          <SimpleGrid cols={1}>
            {media.map((item) => (
              <Card key={item.id} shadow="sm" p="sm">
                <Group align="center">
                  <Box
                    onClick={() => openViewer(item)}
                    style={{
                      width: 120,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: item.url ? "pointer" : "default",
                    }}
                  >
                    {item.url ? (
                      item.type === "video" ? (
                        <video
                          src={
                            item.url.startsWith("blob:")
                              ? item.url
                              : `${API_BASE}/public${item.url}`
                          }
                          controls
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      ) : (
                        <Image
                          src={
                            item.url.startsWith("blob:")
                              ? item.url
                              : `${API_BASE}/public${item.url}`
                          }
                          alt={item.caption}
                          width={120}
                          height={80}
                          fit="cover"
                        />
                      )
                    ) : (
                      <Text color="dimmed" size="xs">
                        Chưa chọn
                      </Text>
                    )}
                  </Box>

                  <Stack gap={"xs"} style={{ flex: 1 }}>
                    <Group mt="xs" gap="sm" justify="space-between">
                      <FileInput
                        placeholder="Chọn ảnh hoặc video"
                        accept="image/*,video/*"
                        onChange={(file) =>
                          handleFileChange(item.id as number, file)
                        }
                        key={`fileinput-${item.id}-${
                          (item as any).file ? 1 : 0
                        }`}
                      />
                      <ActionIcon
                        color="red"
                        onClick={() => handleRemoveMedia(item.id as number)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                    <TextInput
                      placeholder="Nhập caption"
                      value={item.caption ?? ""}
                      onChange={(e) =>
                        updateMedia(
                          item.id as number,
                          "caption",
                          e.currentTarget.value
                        )
                      }
                    />
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>

          <Group gap="xs" justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Hủy
            </Button>
            <Button color="teal" onClick={handleSubmit}>
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={viewerOpened}
        onClose={() => setViewerOpened(false)}
        title={viewerCaption || "Xem media"}
        size="xl"
        centered
      >
        <Box
          style={{
            width: "100%",
            maxHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {viewerType === "video" ? (
            <video
              src={viewerSrc}
              controls
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          ) : (
            <Image
              src={viewerSrc}
              alt={viewerCaption}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
        {viewerCaption && (
          <Text mt="sm" size="sm" color="dimmed">
            {viewerCaption}
          </Text>
        )}
      </Modal>
    </>
  );
}
