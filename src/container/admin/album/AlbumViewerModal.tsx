"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Button,
  Group,
  Text,
  SimpleGrid,
  Image,
  Stack,
  Box,
  FileButton,
  ActionIcon,
  ScrollArea,
  Center,
  Tooltip,
  Divider,
  Badge,
  Flex,
  SegmentedControl,
} from "@mantine/core";
import { IconTrash, IconPlus, IconX, IconZoomIn } from "@tabler/icons-react";

export type AlbumMedia = {
  id: string | number;
  url: string;
  type: "image" | "video";
  file?: File;
};

export type AlbumForViewer = {
  id: string | number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  media?: AlbumMedia[];
};

type Props = {
  opened: boolean;
  onClose: () => void;
  album: AlbumForViewer | null;
  onSave?: (
    albumId: string | number,
    images: File[],
    videos: File[],
    coverPath: string | null
  ) => Promise<void>;
  imageBaseUrl?: string;
};

export default function AlbumViewerModal({
  opened,
  onClose,
  album,
  onSave,
  imageBaseUrl = "http://localhost:4000/public",
}: Props) {
  const [localMedia, setLocalMedia] = useState<AlbumMedia[]>([]);
  const [activePreview, setActivePreview] = useState<AlbumMedia | null>(null);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const [initialCoverUrl, setInitialCoverUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // loading state for delete operations
  const [loadingDelete, setLoadingDelete] = useState<Record<string, boolean>>(
    {}
  );

  const tempUrlsRef = useRef<string[]>([]);

  // fetch media when modal opens (keeps previous logic)
  useEffect(() => {
    if (!opened || !album?.id) return;

    const fetchMedia = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/photo-album/${album.id}`
        );
        if (!res.ok) throw new Error("Không lấy được media album");

        const data = await res.json();
        if (!Array.isArray(data)) return;

        const mapped = data.map((m) => ({
          id: m.id,
          url: m.url.startsWith("http") ? m.url : `${imageBaseUrl}${m.url}`,
          type: m.type,
        }));

        setLocalMedia(mapped);

        const coverResolved = album.coverImage?.startsWith("http")
          ? album.coverImage
          : album.coverImage
          ? `${imageBaseUrl}${album.coverImage}`
          : mapped.find((x) => x.type === "image")?.url ?? null;

        setSelectedCoverUrl(coverResolved);
        setInitialCoverUrl(coverResolved);
      } catch (err) {
        console.error("Fetch album media error:", err);
      }
    };

    fetchMedia();
  }, [opened, album?.id, imageBaseUrl]);

  // cleanup temp URLs on unmount
  useEffect(() => {
    return () => {
      tempUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      tempUrlsRef.current = [];
    };
  }, []);

  const addLocalFiles = (
    files?: File[] | null,
    type: "image" | "video" = "image"
  ) => {
    if (!files || files.length === 0) return;
    const temp = Array.from(files).map((f, i) => {
      const url = URL.createObjectURL(f);
      tempUrlsRef.current.push(url);
      return { id: `temp-${Date.now()}-${i}`, url, file: f, type };
    });
    setLocalMedia((cur) => [...cur, ...temp]);
  };

  const isTemp = (id: string | number) => String(id).startsWith("temp-");

  /**
   * Delete a single media item.
   * - If temp (not uploaded): just remove locally and revoke objectURL.
   * - If persisted: optimistic remove then call DELETE /api/photo-album/:id
   *   rollback on failure (or refetch).
   */
  const deleteLocalMedia = async (m: AlbumMedia) => {
    // temp item -> just remove & revoke URL
    if (isTemp(m.id)) {
      setLocalMedia((cur) => {
        try {
          if (m.url && m.url.startsWith("blob:")) URL.revokeObjectURL(m.url);
        } catch {}
        return cur.filter((i) => i.id !== m.id);
      });
      if (activePreview?.id === m.id) setActivePreview(null);
      if (selectedCoverUrl === m.url) setSelectedCoverUrl(null);
      return;
    }

    // persisted item: call API to delete
    const idStr = String(m.id);
    const confirmed = confirm("Bạn có chắc muốn xóa mục này?");
    if (!confirmed) return;

    // backup for rollback
    const prior = [...localMedia];

    // optimistic update: remove immediately from UI
    setLocalMedia((cur) => cur.filter((i) => String(i.id) !== idStr));
    if (activePreview?.id === m.id) setActivePreview(null);
    if (selectedCoverUrl === m.url) setSelectedCoverUrl(null);

    // set loading
    setLoadingDelete((s) => ({ ...s, [idStr]: true }));

    try {
      const res = await fetch(
        `http://localhost:4000/api/photo-album/${encodeURIComponent(idStr)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        // rollback UI
        setLocalMedia(prior);
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || "Delete failed");
      }
      // success: nothing to do (files removed on server)
    } catch (err) {
      console.error("Delete API error:", err);
      alert("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setLoadingDelete((s) => {
        const copy = { ...s };
        delete copy[idStr];
        return copy;
      });
    }
  };

  /**
   * Delete all media in this album.
   * - Removes temp items locally.
   * - For persisted items, tries bulk endpoint DELETE /api/photo-album/photo/:photoId first.
   * - If bulk not available, falls back to deleting each persisted item individually.
   * - On any error, tries to refetch media from server to restore UI.
   */
  const deleteAll = async () => {
    if (!album) return;
    if (!confirm("Bạn có chắc muốn xóa tất cả media trong album này?")) return;

    // separate persisted and temp
    const temps = localMedia.filter((m) => isTemp(m.id));
    const persisted = localMedia.filter((m) => !isTemp(m.id));

    // revoke temp URLs and remove temps locally
    temps.forEach((t) => {
      try {
        if (t.url && t.url.startsWith("blob:")) URL.revokeObjectURL(t.url);
      } catch {}
    });

    // optimistic: clear UI
    setLocalMedia([]);
    setActivePreview(null);
    setSelectedCoverUrl(null);

    if (persisted.length === 0) {
      // nothing to delete on server
      return;
    }

    try {
      // try bulk delete by album id if backend supports it
      let bulkOk = false;
      try {
        const resBulk = await fetch(
          `http://localhost:4000/api/photo-album/photo/${encodeURIComponent(
            String(album.id)
          )}`,
          { method: "DELETE" }
        );
        if (resBulk.ok) {
          bulkOk = true;
        } else {
          console.warn("Bulk delete returned", resBulk.status);
        }
      } catch (err) {
        console.warn("Bulk delete not available:", err);
      }

      if (!bulkOk) {
        // fallback: delete individual persisted items
        for (const p of persisted) {
          try {
            const res = await fetch(
              `http://localhost:4000/api/photo-album/${encodeURIComponent(
                String(p.id)
              )}`,
              { method: "DELETE" }
            );
            if (!res.ok) {
              const t = await res.text().catch(() => res.statusText);
              console.warn("Failed delete item", p.id, t);
              // continue to attempt deleting remaining items
            }
          } catch (err) {
            console.error("Error deleting item", p.id, err);
          }
        }
      }
    } catch (err) {
      console.error("Delete all error:", err);
      alert("Xóa tất cả thất bại. Đang refetch dữ liệu...");

      // try to refetch to restore UI
      try {
        const res = await fetch(
          `http://localhost:4000/api/photo-album/${encodeURIComponent(
            String(album.id)
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(
            (m: { id: string; url: string; type: string }) => ({
              id: m.id,
              url: m.url.startsWith("http") ? m.url : `${imageBaseUrl}${m.url}`,
              type: m.type,
            })
          );
          setLocalMedia(mapped);
          // restore cover
          const coverResolved = album.coverImage?.startsWith("http")
            ? album.coverImage
            : album.coverImage
            ? `${imageBaseUrl}${album.coverImage}`
            : mapped.find((x: { type: string }) => x.type === "image")?.url ??
              null;
          setSelectedCoverUrl(coverResolved);
        }
      } catch (e) {
        console.error("Refetch after deleteAll failed:", e);
      }
    }
  };

  const handleSave = async () => {
    if (!album) return;

    const formData = new FormData();
    formData.append("photo_id", String(album.id));

    localMedia
      .filter((m) => m.type === "image" && m.file)
      .forEach((m) => formData.append("images", m.file!));

    localMedia
      .filter((m) => m.type === "video" && m.file)
      .forEach((m) => formData.append("videos", m.file!));

    let coverToSend = selectedCoverUrl;
    if (coverToSend?.startsWith(imageBaseUrl)) {
      coverToSend = coverToSend.slice(imageBaseUrl.length);
      if (!coverToSend.startsWith("/")) coverToSend = `/${coverToSend}`;
    }
    formData.append("cover", coverToSend ?? "");

    try {
      // call backend endpoint that replaces media for album
      const res = await fetch(`http://localhost:4000/api/photo-album`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        throw new Error(txt || "Lưu thất bại");
      }
      onClose();
    } catch (err) {
      console.error("Save album error:", err);
      alert("Lưu album thất bại. Vui lòng thử lại.");
      // optionally refetch server media here
    }
  };

  const thumbnails = useMemo(
    () => localMedia.filter((m) => m.type === mediaType),
    [localMedia, mediaType]
  );

  const { imageCount, videoCount } = useMemo(() => {
    return {
      imageCount: localMedia.filter((m) => m.type === "image").length,
      videoCount: localMedia.filter((m) => m.type === "video").length,
    };
  }, [localMedia]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="xl"
        title="Quản lý media trong album"
      >
        <Stack gap="md">
          <Flex gap={16} align="center">
            <Image
              src={selectedCoverUrl ?? undefined}
              alt="cover"
              fit="cover"
              style={{ width: 100, height: 100, background: "#f5f5f5" }}
              radius={8}
            />
            <Stack gap={4}>
              <Text fw={700} size="lg">
                {album?.title ?? "Không có tên"}
              </Text>
              <Text color="dimmed" size="sm">
                {album?.description ?? "Không có mô tả"}
              </Text>
            </Stack>
          </Flex>

          <Group justify="space-between">
            {mediaType === "image" ? (
              <FileButton
                accept="image/*"
                multiple
                onChange={(f) => addLocalFiles(f, "image")}
              >
                {(props) => (
                  <Button leftSection={<IconPlus size={16} />} {...props}>
                    Thêm ảnh ({imageCount})
                  </Button>
                )}
              </FileButton>
            ) : (
              <FileButton
                accept="video/*"
                multiple
                onChange={(f) => addLocalFiles(f, "video")}
              >
                {(props) => (
                  <Button
                    variant="outline"
                    leftSection={<IconPlus size={16} />}
                    {...props}
                  >
                    Thêm video ({videoCount})
                  </Button>
                )}
              </FileButton>
            )}

            <SegmentedControl
              value={mediaType}
              onChange={(val) => setMediaType(val as "image" | "video")}
              data={[
                { label: "Ảnh", value: "image" },
                { label: "Video", value: "video" },
              ]}
            />
          </Group>

          <Divider />

          <ScrollArea style={{ height: 320 }}>
            {thumbnails.length === 0 ? (
              <Center style={{ minHeight: 200 }}>
                <Text color="dimmed">Không có {mediaType} trong album này</Text>
              </Center>
            ) : (
              <SimpleGrid cols={4} spacing="sm">
                {thumbnails.map((m) => {
                  const isCover =
                    m.type === "image" && selectedCoverUrl === m.url;
                  return (
                    <Box
                      key={String(m.id)}
                      style={(theme) => ({
                        position: "relative",
                        borderRadius: theme.radius.sm,
                        overflow: "hidden",
                        boxShadow: isCover
                          ? theme.shadows.md
                          : theme.shadows.xs,
                        border: isCover
                          ? `2px solid ${theme.colors.teal[6]}`
                          : undefined,
                        cursor: "pointer",
                      })}
                      onClick={() => {
                        if (m.type === "image") setSelectedCoverUrl(m.url);
                        setActivePreview(m);
                      }}
                    >
                      {m.type === "image" ? (
                        <Image
                          src={m.url}
                          alt={`media-${m.id}`}
                          height={150}
                          style={{ objectFit: "cover", width: "100%" }}
                        />
                      ) : (
                        <video
                          src={m.url}
                          height={150}
                          style={{ objectFit: "cover", width: "100%" }}
                        />
                      )}

                      <Group
                        p="xs"
                        gap="xs"
                        style={{
                          position: "absolute",
                          left: 6,
                          right: 6,
                          bottom: 6,
                        }}
                      >
                        <Tooltip label="Xem lớn">
                          <ActionIcon
                            color="gray"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePreview(m);
                            }}
                          >
                            <IconZoomIn size={16} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Xóa">
                          <ActionIcon
                            color="red"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLocalMedia(m);
                            }}
                            disabled={!!loadingDelete[String(m.id)]}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>

                        {isCover && (
                          <Badge ml="auto" radius="sm" color="teal">
                            Ảnh bìa
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </ScrollArea>

          <Group mt="md" justify="space-between">
            <Button color="red" onClick={deleteAll} variant="default">
              Xóa hết
            </Button>

            <Group gap={8}>
              <Button variant="default" onClick={onClose}>
                Hủy
              </Button>
              <Button color="teal" onClick={handleSave}>
                Lưu
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={!!activePreview}
        onClose={() => setActivePreview(null)}
        size="xl"
        title={activePreview?.type === "image" ? "Xem ảnh" : "Xem video"}
      >
        {activePreview?.type === "image" ? (
          <Image
            src={activePreview.url}
            alt="preview"
            fit="contain"
            style={{ width: "100%", maxHeight: 500 }}
          />
        ) : (
          <video
            src={activePreview?.url}
            controls
            style={{ width: "100%", maxHeight: 500 }}
          />
        )}

        <Group mt="md" justify="flex-end">
          <Button
            color="red"
            onClick={async () => {
              if (activePreview) {
                await deleteLocalMedia(activePreview);
              }
              setActivePreview(null);
            }}
            leftSection={<IconTrash size={14} />}
            loading={!!loadingDelete[String(activePreview?.id)]}
          >
            Xóa
          </Button>

          <Button
            variant="default"
            onClick={() => setActivePreview(null)}
            leftSection={<IconX size={14} />}
          >
            Đóng
          </Button>
        </Group>
      </Modal>
    </>
  );
}
