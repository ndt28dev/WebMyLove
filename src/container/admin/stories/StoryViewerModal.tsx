"use client";

import { useState, useEffect, useRef } from "react";
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Card,
  Image,
  ActionIcon,
  SimpleGrid,
  Divider,
  Box,
  Badge,
  FileInput,
  Select,
  Loader,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  MediaItem,
  StoryDetailBlock,
  IStory,
  MediaKind,
} from "@/modules/interface/IStory";

type Props = {
  album: IStory | null;
  onAddDetail: (detail: StoryDetailBlock) => void;
  opened: boolean;
  onClose: () => void;
};

const DETAILS_URL_BASE =
  "https://my-love-backend-production-6dbc.up.railway.app/api";

/** Local state type for media entries in the form */
type MediaState = MediaItem & {
  id?: number | null; // optional, backend id nếu có
  url: string;
  type: MediaKind | "image" | "video";
  caption?: string | null;
  file?: File | null;
  previewUrl?: string | null;
};

export default function StoryViewerModal({
  album,
  onAddDetail,
  opened,
  onClose,
}: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [mediaList, setMediaList] = useState<MediaState[]>([]);

  const mediaListRef = useRef<MediaState[]>(mediaList);
  useEffect(() => {
    mediaListRef.current = mediaList;
  }, [mediaList]);

  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

  const [localDetails, setLocalDetails] = useState<StoryDetailBlock[]>([]);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingDetail, setEditingDetail] = useState<StoryDetailBlock | null>(
    null
  );

  // cleanup object URLs on unmount using ref (avoid adding mediaList to deps)
  useEffect(() => {
    return () => {
      try {
        mediaListRef.current.forEach((m) => {
          if (m.previewUrl && m.previewUrl.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(m.previewUrl);
            } catch (e) {
              /* ignore */
            }
          }
        });
      } catch (e) {
        /* ignore */
      }
    };
    // empty deps -> run only on unmount
  }, []);

  // Fetch details when modal opens or album changes
  useEffect(() => {
    if (!opened) return;
    if (!album || !album.id) {
      setLocalDetails([]);
      return;
    }

    const controller = new AbortController();
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      setDetailsError(null);
      try {
        const resp = await fetch(
          `${DETAILS_URL_BASE}/story-details/story/${encodeURIComponent(
            String(album.id)
          )}`,
          { method: "GET", signal: controller.signal }
        );
        if (!resp.ok) {
          const body = await resp.json().catch(() => null);
          const msg =
            (body && (body.message || body.error)) || `HTTP ${resp.status}`;
          throw new Error(msg);
        }
        const json = await resp.json().catch(() => null);
        let details: StoryDetailBlock[] = [];

        if (json && json.data) {
          if (Array.isArray(json.data.details)) {
            details = json.data.details;
          } else if (Array.isArray(json.data)) {
            details = json.data;
          } else if (Array.isArray(json.details)) {
            details = json.details;
          }
        } else if (Array.isArray(json)) {
          details = json;
        }

        setLocalDetails(details);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch details:", err);
        setDetailsError(err?.message || "Lỗi khi tải chi tiết");
        setLocalDetails([]);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => controller.abort();
  }, [opened, album]);

  const handleAddMedia = () => {
    setMediaList((prev) => [
      ...prev,
      {
        id: prev.length + 1, // or any other unique identifier
        url: "",
        type: "image",
        caption: "",
        file: null,
        previewUrl: null,
      },
    ]);
  };

  const handleFileChange = (idx: number, file: File | null) => {
    setMediaList((prev) => {
      const next = [...prev];
      const old = next[idx];
      if (old?.previewUrl && old.previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(old.previewUrl);
        } catch (e) {
          /* ignore */
        }
      }
      if (file) {
        const obj = URL.createObjectURL(file);
        const typeFromFile = file.type.startsWith("video/") ? "video" : "image";
        next[idx] = {
          ...next[idx],
          file,
          previewUrl: obj,
          // keep existing url (in case user edits url field)
          url: next[idx].url || "",
          type: typeFromFile,
        };
      } else {
        next[idx] = { ...next[idx], file: null, previewUrl: null };
      }
      return next;
    });
  };

  const handleMediaChange = (
    idx: number,
    key: keyof MediaItem,
    value: string
  ) => {
    setMediaList((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value } as MediaState;
      return next;
    });
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaList((prev) => {
      const next = [...prev];
      const item = next[idx];
      if (item?.id) {
        setRemovedMediaIds((prevIds) =>
          Array.from(new Set([...prevIds, item.id!]))
        );
      }
      if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch (e) {
          /* ignore */
        }
      }
      next.splice(idx, 1);
      return next;
    });
  };

  const resetForm = () => {
    try {
      mediaListRef.current.forEach((m) => {
        if (m.previewUrl && m.previewUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(m.previewUrl);
          } catch (e) {}
        }
      });
    } catch (e) {}
    setTitle("");
    setDescription("");
    setMediaList([]);
    setErrorMsg(null);
    setIsSubmitting(false);
    setEditingDetail(null);
    setRemovedMediaIds([]);
  };

  // open edit modal and populate form
  const handleEditDetail = (detail: StoryDetailBlock) => {
    setEditingDetail(detail);
    setTitle(detail.title ?? "");
    setDescription(detail.description ?? "");
    const publicRoot = DETAILS_URL_BASE.replace("/api", "");
    const mapped: MediaState[] = (detail.media ?? []).map((m) => {
      // compute previewUrl: if m.url looks absolute -> use as-is, else build from publicRoot
      const rawUrl = (m as any).url ?? "";
      let previewUrl: string | null = null;
      if (rawUrl) {
        if (/^https?:\/\//i.test(rawUrl)) {
          previewUrl = rawUrl;
        } else {
          // avoid accidental double /public segments
          const candidate = `${publicRoot.replace(
            /\/$/,
            ""
          )}/public/${rawUrl.replace(/^\//, "")}`;
          previewUrl = candidate;
        }
      }
      return {
        id: (m as any).id ?? null,
        url: rawUrl,
        caption: (m as any).caption ?? "",
        type: (m as any).type ?? (m as any).media_type ?? "image",
        file: null,
        previewUrl,
      } as MediaState;
    });
    setMediaList(mapped);
    setRemovedMediaIds([]);
    setAddModalOpen(true);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!album || !album.id) {
      setErrorMsg("Không có album hợp lệ (story_id missing).");
      return;
    }

    const sanitized: MediaState[] = mediaList
      .map((m) => {
        let finalType: MediaKind = "image";
        if (m.file) {
          finalType = m.file.type
            ? m.file.type.startsWith("video/")
              ? "video"
              : "image"
            : /\.(mp4|mov|webm)$/i.test(m.file.name)
            ? "video"
            : "image";
        } else if ((m as any).type) {
          finalType = (m as any).type;
        }

        return {
          id: m.id ?? undefined,
          url: (m.url || "").trim(),
          type: finalType,
          caption: (m.caption || "").trim(),
          file: m.file ?? null,
          previewUrl: m.previewUrl ?? null,
        } as MediaState;
      })
      .filter((m) => m.url || m.file);

    const payloadJson = {
      story_id: album.id,
      title: title?.trim() || null,
      description: description?.trim() || null,
      mediaList: sanitized.map((m) => ({
        id: m.id ?? undefined,
        url: m.url || null,
        type: m.type,
        caption: m.caption || null,
      })),
      removedMediaIds: removedMediaIds.length > 0 ? removedMediaIds : undefined,
    };

    setIsSubmitting(true);

    try {
      let resp: Response | null = null;
      const hasFile = sanitized.some((m) => m.file);
      const isEdit = !!editingDetail;
      const endpoint = isEdit
        ? `${DETAILS_URL_BASE}/story-details/${editingDetail!.id}`
        : `${DETAILS_URL_BASE}/story-details`;

      if (hasFile) {
        const form = new FormData();
        form.append("story_id", String(payloadJson.story_id));
        if (payloadJson.title) form.append("title", payloadJson.title);
        if (payloadJson.description)
          form.append("description", payloadJson.description);

        const filesForUpload = sanitized.filter((m) => m.file);
        filesForUpload.forEach((m) => {
          if (m.file) form.append("mediaFiles", m.file, m.file.name);
        });

        const mediaMeta = sanitized.map((m) => ({
          id: m.id ?? null,
          url: m.url || null,
          type: m.type,
          caption: m.caption || null,
        }));
        form.append("mediaMeta", JSON.stringify(mediaMeta));

        if (removedMediaIds.length > 0) {
          form.append("removedMediaIds", JSON.stringify(removedMediaIds));
        }

        resp = await fetch(endpoint, {
          method: isEdit ? "PUT" : "POST",
          body: form,
        });
      } else {
        const body = {
          ...payloadJson,
        };
        resp = await fetch(endpoint, {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const json = await resp!.json().catch(() => null);
      if (!resp!.ok) {
        const serverMsg =
          (json && (json.message || (json.error && json.error.message))) ||
          `Server responded with ${resp!.status}`;
        throw new Error(serverMsg);
      }

      // refetch details to refresh UI
      const fetchResp = await fetch(
        `${DETAILS_URL_BASE}/story-details/story/${encodeURIComponent(
          album.id
        )}`
      );
      const fetchJson = await fetchResp.json().catch(() => null);
      let updatedDetails: StoryDetailBlock[] = [];
      if (fetchJson && fetchJson.data) {
        if (Array.isArray(fetchJson.data.details)) {
          updatedDetails = fetchJson.data.details;
        } else if (Array.isArray(fetchJson.data)) {
          updatedDetails = fetchJson.data;
        }
      } else if (Array.isArray(fetchJson)) {
        updatedDetails = fetchJson;
      }

      setLocalDetails(updatedDetails);
      try {
        if (updatedDetails.length > 0) onAddDetail?.(updatedDetails[0]);
      } catch (e) {
        console.warn("onAddDetail callback failed:", e);
      }

      resetForm();
      setAddModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create/update story detail:", err);
      setErrorMsg(err?.message || "Lỗi khi lưu chi tiết. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteDetail = async (id: number) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa chi tiết này không?")) return;

    try {
      const resp = await fetch(`${DETAILS_URL_BASE}/story-details/${id}`, {
        method: "DELETE",
      });

      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(
          (json && (json.message || json.error)) || `HTTP ${resp.status}`
        );
      }

      alert(
        (json && (json.message || "Đã xóa chi tiết thành công")) ||
          "Đã xóa chi tiết thành công"
      );

      const fetchResp = await fetch(
        `${DETAILS_URL_BASE}/story-details/story/${encodeURIComponent(
          album?.id || ""
        )}`
      );
      const fetchJson = await fetchResp.json().catch(() => null);
      let updatedDetails: StoryDetailBlock[] = [];
      if (fetchJson && fetchJson.data) {
        if (Array.isArray(fetchJson.data.details)) {
          updatedDetails = fetchJson.data.details;
        } else if (Array.isArray(fetchJson.data)) {
          updatedDetails = fetchJson.data;
        }
      } else if (Array.isArray(fetchJson)) {
        updatedDetails = fetchJson;
      }

      setLocalDetails(updatedDetails);
    } catch (err: any) {
      console.error("Failed to delete story detail:", err);
      alert(err?.message || "Lỗi khi xóa chi tiết. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={"Quản lý chi tiết câu chuyện"}
        size="xl"
      >
        <Stack gap="md">
          <Box>
            <Title order={4} mb={6}>
              {album?.title ?? "Không có tiêu đề"}
            </Title>
            <Text size="sm" color="dimmed" lineClamp={3}>
              {album?.summary ?? "Không có mô tả"}
            </Text>
          </Box>

          <Group align="center">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                resetForm();
                setAddModalOpen(true);
              }}
            >
              Thêm chi tiết
            </Button>
          </Group>

          <Divider />

          <Stack gap="sm">
            {isLoadingDetails ? (
              <Group mt="md">
                <Loader />
              </Group>
            ) : detailsError ? (
              <Text color="red">{detailsError}</Text>
            ) : localDetails.length > 0 ? (
              localDetails.map((d) => (
                <Card key={d.id} shadow="xs" padding="md" radius="md">
                  <Group align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group align="flex-start" justify="space-between">
                        <Stack gap={5} flex={1}>
                          {d.title && <Title order={5}>{d.title}</Title>}
                          {d.description && (
                            <Text size="sm" color="dimmed" mb="xs">
                              {d.description}
                            </Text>
                          )}
                        </Stack>
                        <Group gap={5}>
                          <ActionIcon
                            color="yellow"
                            onClick={() => handleEditDetail(d)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>

                          <ActionIcon
                            color="red"
                            onClick={() => handleDeleteDetail(d.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      {d.media && d.media.length > 0 && (
                        <SimpleGrid cols={3} spacing="xs" mt="sm">
                          {d.media.map((m, i) => (
                            <Card
                              key={m.id ?? i}
                              padding={6}
                              radius="md"
                              withBorder
                            >
                              {m.url ? (
                                m.type === "image" ? (
                                  <Image
                                    src={`${DETAILS_URL_BASE.replace(
                                      "/api",
                                      ""
                                    )}/public/${m.url}`}
                                    alt={m.caption ?? `media-${i}`}
                                    height={120}
                                    fit="cover"
                                  />
                                ) : (
                                  <video
                                    src={`${DETAILS_URL_BASE.replace(
                                      "/api",
                                      ""
                                    )}/public/${m.url}`}
                                    height={120}
                                    style={{ display: "block", width: "100%" }}
                                    controls
                                  />
                                )
                              ) : (
                                <Box
                                  style={{
                                    height: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text size="xs" color="dimmed">
                                    No preview
                                  </Text>
                                </Box>
                              )}
                              <Group
                                mt={6}
                                justify="space-between"
                                align="center"
                              >
                                <Text size="xs" flex={1}>
                                  {m.caption ?? ""}
                                </Text>
                                <Badge size="xs">{m.type}</Badge>
                              </Group>
                            </Card>
                          ))}
                        </SimpleGrid>
                      )}
                    </div>
                  </Group>
                </Card>
              ))
            ) : (
              <Text size="sm" color="dimmed">
                Không có chi tiết nào trong album.
              </Text>
            )}
          </Stack>

          <Group justify="flex-end">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={addModalOpen}
        onClose={() => {
          resetForm();
          setAddModalOpen(false);
        }}
        title={editingDetail ? "Sửa chi tiết" : "Thêm chi tiết mới"}
        size="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Tiêu đề"
            placeholder="Nhập tiêu đề (tùy chọn)"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <Textarea
            label="Mô tả"
            placeholder="Nhập mô tả (tùy chọn)"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <Divider my="sm" />

          <Group gap={5} justify="space-between">
            <TextInput readOnly value={`${mediaList.length} mục`} w={80} />
            <Group justify="space-between" flex={1}>
              <Button
                onClick={handleAddMedia}
                leftSection={<IconPlus size={14} />}
              >
                Thêm media
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // revoke blob urls
                  try {
                    mediaList.forEach((m) => {
                      if (m.previewUrl && m.previewUrl.startsWith("blob:")) {
                        try {
                          URL.revokeObjectURL(m.previewUrl);
                        } catch (e) {}
                      }
                    });
                  } catch (e) {}
                  setMediaList([]);
                  setRemovedMediaIds([]);
                }}
              >
                Xóa tất cả
              </Button>
            </Group>
          </Group>

          <Stack>
            {mediaList.map((m, idx) => (
              <Card key={m.id ?? idx} shadow="sm" padding="sm" radius="md">
                <Group align="center" gap="sm">
                  <Box style={{ width: 120 }}>
                    <FileInput
                      placeholder="Chọn file"
                      value={m.file ?? null}
                      onChange={(file) => handleFileChange(idx, file)}
                      accept="image/*,video/*"
                      clearable
                    />
                    {m.previewUrl ? (
                      m.type === "image" ? (
                        <Image
                          src={m.previewUrl}
                          alt="preview"
                          height={80}
                          w={120}
                          fit="cover"
                          mt={8}
                        />
                      ) : (
                        <video
                          src={m.previewUrl ?? undefined}
                          height={80}
                          style={{ display: "block", marginTop: 8, width: 120 }}
                          controls
                        />
                      )
                    ) : null}
                  </Box>

                  <TextInput
                    style={{ flex: 1 }}
                    placeholder="Caption"
                    value={m.caption ?? ""}
                    onChange={(e) =>
                      handleMediaChange(idx, "caption", e.currentTarget.value)
                    }
                  />
                  <Select
                    style={{ width: 140 }}
                    data={[
                      { value: "image", label: "Image" },
                      { value: "video", label: "Video" },
                    ]}
                    value={m.type ?? "image"}
                    onChange={(val) =>
                      handleMediaChange(idx, "type", val ?? "image")
                    }
                    disabled={!!m.file}
                  />

                  <ActionIcon
                    color="red"
                    onClick={() => handleRemoveMedia(idx)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>

          {errorMsg && <Text color="red">{errorMsg}</Text>}

          <Group mt="md" gap={"xs"} justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                resetForm();
                setAddModalOpen(false);
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting}>
              Lưu
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
