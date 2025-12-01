"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  Stack,
  Select,
} from "@mantine/core";
import { ILoveTimeline } from "@/modules/interface/ILoveTimeline";
import { LoveType } from "@/modules/enum/LoveType";

type Props = {
  opened: boolean;
  onClose: () => void;
  initial?: Partial<ILoveTimeline>;
  onSubmit: (payload: ILoveTimeline) => Promise<void> | void;
  title?: string;
  defaultData?: ILoveTimeline | null;
};

export const defaultTimelineIcon = LoveType.MEET_DAY;

const formatDateForInput = (d?: string | Date | null) => {
  if (!d) return "";
  const dateObj = typeof d === "string" ? new Date(d) : d;
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function CreateUpdateTimelineModal({
  opened,
  onClose,
  initial,
  onSubmit,
  title,
  defaultData,
}: Props) {
  const [date, setDate] = useState<string>(
    initial?.date ? formatDateForInput(initial.date) : ""
  );
  const [timelineTitle, setTimelineTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState<LoveType>(
    initial?.icon ?? Object.values(LoveType)[0]
  );

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultData) {
      setDate(formatDateForInput(defaultData.date));
      setTimelineTitle(defaultData.title ?? "");
      setDescription(defaultData.description ?? "");
      setIcon(defaultData.icon ?? defaultTimelineIcon);
    } else {
      setDate(initial?.date ? formatDateForInput(initial.date) : "");
      setTimelineTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setIcon(initial?.icon ?? defaultTimelineIcon);
    }
  }, [defaultData, initial, opened]);

  const handleSubmit = async () => {
    if (!date || !timelineTitle.trim()) {
      alert("Vui lòng nhập ngày và tiêu đề");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ILoveTimeline = {
        date: new Date(date),
        title: timelineTitle.trim(),
        description: description.trim(),
        icon: icon,
      };

      await onSubmit(payload);
      onClose();

      if (!defaultData) {
        setDate("");
        setTimelineTitle("");
        setDescription("");
        setIcon(defaultTimelineIcon);
      }
    } catch (err) {
      console.error("Create/Update timeline error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg">
      <Stack gap="md">
        <TextInput
          label="Ngày"
          type="date"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Tiêu đề"
          placeholder="Nhập tiêu đề mốc thời gian"
          value={timelineTitle}
          onChange={(e) => setTimelineTitle(e.currentTarget.value)}
          required
        />
        <Textarea
          label="Mô tả"
          placeholder="Mô tả cho mốc thời gian"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Select
          label="Loại mốc thời gian"
          placeholder="Chọn loại"
          value={icon}
          onChange={(val) => setIcon(val as LoveType)}
          data={Object.entries(LoveType).map(([key, value]) => ({
            value: value,
            label: key.replace("_", " "),
          }))}
        />
        <Group gap={"xs"} justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button color="teal" onClick={handleSubmit} loading={submitting}>
            Lưu
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
