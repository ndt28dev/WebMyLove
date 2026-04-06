// src/components/CreateUpdateAlbumModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  FileButton,
  Image,
  Stack,
  Text,
  Box,
} from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";
import { IPhotoAlbum } from "@/modules/interface/IPhotoAlbum";

export interface NewAlbumPayload {
  title: string;
  description?: string;
  coverImage?: File | null;
}

type Props = {
  opened: boolean;
  onClose: () => void;
  initial?: Partial<NewAlbumPayload>;
  onSubmit: (payload: NewAlbumPayload) => Promise<void> | void;
  title?: string;
  defaultData?: IPhotoAlbum | null;
};

export default function CreateUpdateAlbumModal({
  opened,
  onClose,
  initial,
  onSubmit,
  title,
  defaultData,
}: Props) {
  // Trường người dùng upload (File) — chỉ send khi user upload mới
  const [coverImage, setCoverImage] = useState<File | null>(
    initial?.coverImage ?? null
  );
  // URL ảnh đã có trên server (nếu đang edit)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [submitting, setSubmitting] = useState(false);

  // preview: nếu user upload file => createObjectURL, ngược lại dùng existingCoverUrl
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // tạo object URL khi có file upload và dọn khi thay đổi
  useEffect(() => {
    if (!coverImage) {
      // clear object URL
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(coverImage);
    setFilePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setFilePreviewUrl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverImage]);

  // khi defaultData thay đổi (mở modal edit) — set dữ liệu hiện có
  useEffect(() => {
    if (defaultData) {
      setAlbumTitle(defaultData.title ?? "");
      setDescription(defaultData.description ?? "");
      // đặt existing url (đường dẫn tới server public)
      setExistingCoverUrl(
        defaultData.coverImage
          ? `https://mylove-backend-server-production.up.railway.app/public${defaultData.coverImage}`
          : null
      );
      // xóa file upload cũ nếu có
      setCoverImage(null);
    } else {
      // nếu không có defaultData (tạo mới) và có initial, reset theo initial
      setAlbumTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setExistingCoverUrl(null);
      setCoverImage(initial?.coverImage ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultData, opened]);

  // Khi modal đóng, reset state nhẹ (giúp lần mở sau không giữ data cũ)
  useEffect(() => {
    if (!opened) {
      setSubmitting(false);
      // không reset toàn bộ để giữ possibility reuse if needed
    }
  }, [opened]);

  const handleUploadCover = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      // bạn có thể thông báo lỗi người dùng ở đây
      return;
    }
    // upload file mới -> clear existing url (nghĩa là sẽ thay ảnh)
    setExistingCoverUrl(null);
    setCoverImage(file);
  };

  const handleSubmit = async () => {
    if (!albumTitle.trim()) {
      alert("Vui lòng nhập tên album");
      return;
    }

    // Nếu đang tạo mới (không có defaultData) thì bắt buộc phải có ảnh
    const isCreating = !defaultData;
    if (isCreating && !coverImage) {
      alert("Vui lòng chọn ảnh nền");
      return;
    }

    setSubmitting(true);
    try {
      const payload: NewAlbumPayload = {
        title: albumTitle.trim(),
        description: description.trim() || undefined,
        // chỉ include coverImage nếu có file upload mới
        coverImage: coverImage ?? undefined,
      };

      await onSubmit(payload);
      onClose();
      // optional: reset form after success (chỉ khi tạo mới)
      if (isCreating) {
        setAlbumTitle("");
        setDescription("");
        setCoverImage(null);
        setExistingCoverUrl(null);
      }
    } catch (err) {
      console.error("Create/Update album error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // determine preview src: priority file preview -> existingCoverUrl -> null
  const previewSrc = filePreviewUrl ?? existingCoverUrl ?? null;

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg">
      <Stack gap="md">
        <TextInput
          label="Tên album"
          placeholder="Nhập tên album"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn cho album"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />

        <Box>
          <Text size="sm" fw={500} mb="xs">
            Ảnh nền
          </Text>
          <Box
            style={{
              width: "100%",
              height: 280,
              borderRadius: 8,
              overflow: "hidden",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt="cover"
                fit="cover"
                style={{ width: 280, height: "100%" }}
                radius={8}
              />
            ) : (
              <Text color="dimmed" ta="center">
                Chưa chọn ảnh nền
              </Text>
            )}
          </Box>

          <Group mt="sm" justify="flex-start">
            <FileButton
              onChange={(f) => handleUploadCover(f ?? null)}
              accept="image/*"
              multiple={false}
            >
              {(props) => (
                <Button
                  leftSection={<IconPhoto size={14} />}
                  {...props}
                  size="sm"
                >
                  Tải ảnh nền
                </Button>
              )}
            </FileButton>
          </Group>
        </Box>

        <Group gap={"xs"} justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} color={"teal"} loading={submitting}>
            Lưu
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
