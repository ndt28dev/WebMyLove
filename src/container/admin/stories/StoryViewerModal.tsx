// src/components/StoryViewerModal.tsx
"use client";

import { useState, useEffect } from "react";
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

const DETAILS_URL_BASE = "http://localhost:4000/api";

export default function StoryViewerModal({
  album,
  onAddDetail,
  opened,
  onClose,
}: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // mediaList sử dụng cho form thêm / sửa
  // ensure MediaItem may contain id from server
  const [mediaList, setMediaList] = useState<
    (MediaItem & {
      id?: number;
      file?: File | null;
      previewUrl?: string | null;
    })[]
  >([]);

  // danh sách id media đã bị xóa trong quá trình edit -> gửi cho backend
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

  // localDetails chứa dữ liệu lấy từ API (list của StoryDetailBlock)
  const [localDetails, setLocalDetails] = useState<StoryDetailBlock[]>([]);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✨ mới: state cho chi tiết đang sửa (null = đang thêm mới)
  const [editingDetail, setEditingDetail] = useState<StoryDetailBlock | null>(
    null
  );

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaList.forEach((m) => {
        if (m.previewUrl && m.previewUrl.startsWith("blob:"))
          URL.revokeObjectURL(m.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const json = await resp.json();
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
      { url: "", type: "image", caption: "", file: null, previewUrl: null },
    ]);
  };

  const handleFileChange = (idx: number, file: File | null) => {
    setMediaList((prev) => {
      const next = [...prev];
      if (next[idx]?.previewUrl) {
        // nếu đây là preview blob object, revoke; (nếu là url remote không revoke)
        try {
          if (next[idx].previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(next[idx].previewUrl!);
          }
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
          url: next[idx].url || "",
          type: typeFromFile, // ✅ ép type từ file
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
      next[idx] = { ...next[idx], [key]: value } as any;
      return next;
    });
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaList((prev) => {
      const next = [...prev];
      const item = next[idx];
      // nếu media có id (tồn tại server), đánh dấu xóa để gửi backend
      if (item?.id) {
        setRemovedMediaIds((prevIds) =>
          Array.from(new Set([...prevIds, item.id!]))
        );
      }
      if (item?.previewUrl) {
        try {
          if (item.previewUrl.startsWith("blob:"))
            URL.revokeObjectURL(item.previewUrl);
        } catch (e) {}
      }
      next.splice(idx, 1);
      return next;
    });
  };

  const resetForm = () => {
    mediaList.forEach((m) => {
      try {
        if (m.previewUrl && m.previewUrl.startsWith("blob:"))
          URL.revokeObjectURL(m.previewUrl);
      } catch (e) {}
    });
    setTitle("");
    setDescription("");
    setMediaList([]);
    setErrorMsg(null);
    setIsSubmitting(false);
    setEditingDetail(null);
    setRemovedMediaIds([]);
  };

  // ✨ Mở modal sửa, điền dữ liệu sẵn vào form
  const handleEditDetail = (detail: StoryDetailBlock) => {
    setEditingDetail(detail);
    setTitle(detail.title ?? "");
    setDescription(detail.description ?? "");
    // chuyển media từ server -> mediaList (previewUrl trỏ tới public path nếu có)
    const publicRoot = DETAILS_URL_BASE.replace("/api", "");
    const mapped = (detail.media ?? []).map((m) => ({
      // keep id if backend returned it (important for update)
      id: (m as any).id,
      url: m.url ?? "",
      caption: m.caption ?? "",
      // prefer m.type, fallback to m.media_type, default image
      type: (m as any).type ?? (m as any).media_type ?? "image",
      file: null,
      // preview points to public path (not blob)
      previewUrl: m.url ? `${publicRoot}/public/${m.url}` : null,
    }));
    setMediaList(mapped as any);
    setRemovedMediaIds([]);
    setAddModalOpen(true);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!album || !album.id) {
      setErrorMsg("Không có album hợp lệ (story_id missing).");
      return;
    }

    const sanitized = mediaList
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
          id: (m as any).id, // may be undefined for new items
          url: (m.url || "").trim(),
          type: finalType,
          caption: (m.caption || "").trim(),
          file: m.file ?? null,
          previewUrl: m.previewUrl ?? null,
        };
      })
      // keep only items that have url (existing) or a file (new)
      .filter((m) => m.url || m.file);

    const payloadJson = {
      story_id: album.id,
      title: title?.trim() || null,
      description: description?.trim() || null,
      // include id for existing media so backend can match by id when updating
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
        // Build FormData: files + mediaMeta + removedMediaIds + story fields
        const form = new FormData();
        form.append("story_id", String(payloadJson.story_id));
        if (payloadJson.title) form.append("title", payloadJson.title);
        if (payloadJson.description)
          form.append("description", payloadJson.description);

        // attach files in the same order as they appear in sanitized.filter(m => m.file)
        const filesForUpload = sanitized.filter((m) => m.file);
        filesForUpload.forEach((m) => {
          if (m.file) form.append("mediaFiles", m.file, m.file.name);
        });

        // We need mediaMeta that describes the full desired mediaList order.
        // For items that are existing (have id), url will be present and file=null.
        // For items that are new (have file) we include type/caption and id may be undefined.
        const mediaMeta = sanitized.map((m) => ({
          id: m.id ?? null,
          url: m.url || null,
          type: m.type,
          caption: m.caption || null,
          // For new files, backend will consume files in the same order as filesForUpload.
          // We don't include any file index here; backend should map by order of received files.
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
        // purely JSON update/create
        const body = {
          ...payloadJson,
        };
        resp = await fetch(endpoint, {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const json = await resp!.json();
      if (!resp!.ok) {
        const serverMsg =
          json && (json.message || (json.error && json.error.message));
        throw new Error(serverMsg || `Server responded with ${resp!.status}`);
      }

      // Sau khi thêm/sửa xong → fetch lại toàn bộ chi tiết từ server
      const fetchResp = await fetch(
        `${DETAILS_URL_BASE}/story-details/story/${encodeURIComponent(
          album.id
        )}`
      );
      const fetchJson = await fetchResp.json();
      let updatedDetails: StoryDetailBlock[] = [];
      if (fetchJson && fetchJson.data) {
        if (Array.isArray(fetchJson.data.details)) {
          updatedDetails = fetchJson.data.details;
        } else if (Array.isArray(fetchJson.data)) {
          updatedDetails = fetchJson.data;
        }
      }

      setLocalDetails(updatedDetails);
      try {
        onAddDetail?.(updatedDetails[0]);
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

      const json = await resp.json();

      if (!resp.ok) {
        throw new Error(json.message || `Server responded with ${resp.status}`);
      }

      alert(json.message || "Đã xóa chi tiết thành công");
      // Sau khi xóa → fetch lại toàn bộ chi tiết từ server
      const fetchResp = await fetch(
        `${DETAILS_URL_BASE}/story-details/story/${encodeURIComponent(
          album?.id || ""
        )}`
      );
      const fetchJson = await fetchResp.json();
      let updatedDetails: StoryDetailBlock[] = [];
      if (fetchJson && fetchJson.data) {
        if (Array.isArray(fetchJson.data.details)) {
          updatedDetails = fetchJson.data.details;
        } else if (Array.isArray(fetchJson.data)) {
          updatedDetails = fetchJson.data;
        }
      }

      setLocalDetails(updatedDetails);
    } catch (err: any) {
      console.error("Failed to delete story detail:", err);
      alert(err.message || "Lỗi khi xóa chi tiết. Vui lòng thử lại.");
    }
  };

  return (
    <>
      {/* Modal chính */}
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

          {/* Hiển thị các detail lấy từ API */}
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
                          {/* ✨ nút edit — gọi handleEditDetail */}
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
                            <Card key={i} padding={6} radius="md" withBorder>
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

      {/* Modal phụ: thêm / sửa chi tiết */}
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
                  mediaList.forEach((m) => {
                    try {
                      if (m.previewUrl && m.previewUrl.startsWith("blob:"))
                        URL.revokeObjectURL(m.previewUrl);
                    } catch (e) {}
                  });
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
              <Card key={idx} shadow="sm" padding="sm" radius="md">
                <Group align="center" gap="sm">
                  <Box style={{ width: 120 }}>
                    <FileInput
                      placeholder="Chọn file"
                      value={undefined}
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
                          src={m.previewUrl}
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
                    disabled={!!m.file} // disable khi đã chọn file
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
