"use client";

import { useEffect, useRef, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  FileInput,
  Image,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IStory } from "@/modules/interface/IStory";

type FormValues = {
  title: string;
  date: string; // YYYY-MM-DD
  coverImage: File | string | null;
  summary: string;
  tags: string[];
};

interface Props {
  opened: boolean;
  onClose: () => void;
  check: boolean; // true = add, false = edit
  story: IStory | null;
  onSubmit?: (values: FormValues, formData?: FormData) => Promise<void> | void;
}

export default function CreateUpdateStoryModal({
  opened,
  onClose,
  check,
  story,
  onSubmit,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const prevObjectUrl = useRef<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      title: "",
      date: "",
      coverImage: null,
      summary: "",
      tags: [],
    },
  });

  // convert date/string -> yyyy-mm-dd
  const toDateInput = (d?: string | Date | number | null) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // populate form when edit or open
  useEffect(() => {
    if (!opened) {
      form.reset();
      if (prevObjectUrl.current) {
        try {
          URL.revokeObjectURL(prevObjectUrl.current);
        } catch {}
        prevObjectUrl.current = null;
      }
      setPreview(null);
      return;
    }

    if (story && !check) {
      // parse tags JSON string -> array
      let tags: string[] = [];
      if (story.tags) {
        try {
          tags =
            typeof story.tags === "string"
              ? JSON.parse(story.tags)
              : story.tags;
        } catch {
          tags = [];
        }
      }

      form.setValues({
        title: story.title ?? "",
        date: toDateInput(story.date),
        coverImage: story.coverImage ?? null,
        summary: story.summary ?? "",
        tags,
      });

      if (story.coverImage) {
        const src = story.coverImage.startsWith("http")
          ? story.coverImage
          : `http://localhost:4000/public${story.coverImage}`;
        setPreview(src);
      } else {
        setPreview(null);
      }
    } else {
      form.reset();
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, story, check]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) {
        try {
          URL.revokeObjectURL(prevObjectUrl.current);
        } catch {}
        prevObjectUrl.current = null;
      }
    };
  }, []);

  function handleFileSelect(file: File | null) {
    if (prevObjectUrl.current) {
      try {
        URL.revokeObjectURL(prevObjectUrl.current);
      } catch {}
      prevObjectUrl.current = null;
    }

    if (!file) {
      form.setFieldValue("coverImage", null);
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    prevObjectUrl.current = url;
    setPreview(url);
    form.setFieldValue("coverImage", file);
  }

  const handleSubmit = async (values: FormValues) => {
    if (!values.title.trim()) {
      alert("Vui lòng nhập tên câu chuyện!");
      return;
    }
    if (!values.date.trim()) {
      alert("Vui lòng chọn ngày!");
      return;
    }
    if (!values.coverImage) {
      alert("Vui lòng chọn ảnh bìa!");
      return;
    }

    let fd: FormData | undefined = undefined;
    if (values.coverImage instanceof File) {
      fd = new FormData();
      fd.append("cover", values.coverImage);
      fd.append("title", values.title);
      fd.append("date", values.date);
      fd.append("summary", values.summary);
      fd.append("tags", JSON.stringify(values.tags));
      if (story && !check) fd.append("id", String(story.id));
    }

    try {
      if (onSubmit) {
        await onSubmit(values, fd);
      } else {
        console.log("Submit", values);
      }
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Lưu thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={check ? "Thêm câu chuyện" : "Chỉnh sửa câu chuyện"}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Tên câu chuyện"
          placeholder="Nhập tên"
          {...form.getInputProps("title")}
          required
        />

        <TextInput
          type="date"
          label="Ngày"
          mt="md"
          {...form.getInputProps("date")}
          required
        />

        <Textarea
          label="Tóm tắt"
          placeholder="Nhập mô tả ngắn..."
          mt="md"
          autosize
          minRows={3}
          {...form.getInputProps("summary")}
        />

        <FileInput
          label="Ảnh bìa"
          placeholder="Chọn ảnh"
          accept="image/*"
          mt="md"
          onChange={handleFileSelect}
          required
        />

        {preview && (
          <Image
            src={preview}
            alt="preview"
            mt="sm"
            radius={8}
            w={120}
            h={120}
            fit="cover"
          />
        )}

        <MultiSelect
          label="Tags"
          placeholder="Nhập tag"
          data={[
            "nhắn tin",
            "đi làm",
            "hẹn hò",
            "ăn uống",
            "xem phim",
            "sinh nhật",
            "valentine",
            "du lịch",
            "kỷ niệm",
            "đời thường",
          ]}
          value={form.values.tags}
          onChange={(val) => form.setFieldValue("tags", val)}
          searchable
          mt="md"
        />

        <Group justify="flex-end" gap={"xs"} mt="md">
          <Button variant="default" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" color="teal">
            {check ? "Thêm" : "Cập nhật"}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
