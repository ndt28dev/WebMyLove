"use client";
import { MyTimeline } from "@/components/MyTimeline";
// remove static import of loveTimelineData
import { formatDate } from "@/utils/Format";
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  rem,
  ScrollArea,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconCalendarHeart,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LoveType } from "@/modules/enum/LoveType";
import {
  iconColorMapper,
  ILovePhoto,
  ILoveTimeline,
} from "@/modules/interface/ILoveTimeline";
import { useMediaQuery } from "@mantine/hooks";

const typeLabel: Record<LoveType, string> = {
  [LoveType.MEET_DAY]: "Gặp nhau",
  [LoveType.BIRTHDAY]: "Sinh nhật",
  [LoveType.DINNER]: "Ăn uống",
  [LoveType.TRAVEL]: "Du lịch",
  [LoveType.ANNIVERSARY]: "Kỷ niệm",
  [LoveType.SURPRISE]: "Bất ngờ",
  [LoveType.MESSAGE]: "Nhắn tin",
  [LoveType.ORTHER]: "Khác",
};

export default function TimelineHome() {
  const [typeFilter, setTypeFilter] = useState<LoveType | "all">("all");
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState<string | null>(null);

  // new: timeline data from API
  const [timelineData, setTimelineData] = useState<ILoveTimeline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fetch data from API
  useEffect(() => {
    const ctrl = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:4000/api/timeline", {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        // expect json is an array of timeline items; adjust if nested
        setTimelineData(Array.isArray(json) ? json : json.data ?? []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Fetch timeline error:", err);
        setError(err.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => ctrl.abort();
  }, []);

  // type options unchanged
  const typeOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả loại" },
      ...Object.keys(iconColorMapper).map((k) => ({
        value: k,
        label: typeLabel[k as LoveType],
      })),
    ],
    []
  );

  // year options computed from timelineData
  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        timelineData
          .filter((i) => i.date !== undefined) // Add this line
          .map((i) => new Date(i.date!).getFullYear())
      )
    )
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }));
    return years;
  }, [timelineData]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
        value: String(m),
        label: `${m.toString().padStart(2, "0")} - Tháng ${m}`,
      })),
    []
  );

  const clearFilters = () => {
    setTypeFilter("all");
    setYearFilter(null);
    setMonthFilter(null);
  };

  // filtered data now based on timelineData
  const filteredData = useMemo<ILoveTimeline[]>(() => {
    return timelineData.filter((item) => {
      const d = item.date ? new Date(item.date) : new Date();
      if (typeFilter !== "all" && item.icon !== typeFilter) return false;
      if (yearFilter && d.getFullYear() !== Number(yearFilter)) return false;
      if (monthFilter && d.getMonth() + 1 !== Number(monthFilter)) return false;
      return true;
    });
  }, [timelineData, typeFilter, yearFilter, monthFilter]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [photoIdx, setPhotoIdx] = useState<number>(0);

  // reset indices when filters or data change
  useEffect(() => {
    setActiveIdx(0);
    setPhotoIdx(0);
  }, [typeFilter, yearFilter, monthFilter, timelineData]);

  const activeItem = useMemo(
    () => filteredData[activeIdx],
    [filteredData, activeIdx]
  );

  const photos = useMemo<ILovePhoto[]>(
    () =>
      (activeItem?.photos ?? []).map((p) => ({
        ...p,
        type: p.type ?? (/\.(mp4|webm|ogg)$/i.test(p.url) ? "video" : "image"),
      })),
    [activeItem]
  );

  const hasPhotos = photos.length > 0;
  const current = hasPhotos ? photos[photoIdx] : undefined;

  const prev = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  }, [hasPhotos, photos.length]);

  const next = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIdx((i) => (i + 1) % photos.length);
  }, [hasPhotos, photos.length]);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    setPhotoIdx(0);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        {loading ? (
          <Center style={{ minHeight: 300 }}>
            <Loader />
          </Center>
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : activeItem ? (
          <>
            <Stack gap={2}>
              <Title order={4} style={{ lineHeight: 1.2 }}>
                {activeItem.title}
              </Title>
              <Group gap={6} align="center">
                <IconCalendarHeart size={16} color="#FF4D6D" />
                {activeItem.date && (
                  <Text fz="sm" c="dimmed">
                    {formatDate(activeItem.date)}
                  </Text>
                )}
              </Group>
            </Stack>

            <Stack gap="sm" mt="xs">
              {activeItem.description && (
                <Text c="dimmed" fz="sm">
                  {activeItem.description}
                </Text>
              )}

              {hasPhotos && (
                <Box pos="relative">
                  <AspectRatio
                    ratio={current?.type === "video" ? 16 / 9 : 16 / 9}
                  >
                    {current?.type === "image" ? (
                      <img
                        src={`http://localhost:4000/public${current?.url}`}
                        alt={current.caption || activeItem.title}
                        style={{
                          width: "100%",
                          height: "600px",
                          objectFit: "contain",
                          borderRadius: 12,
                          display: "block",
                        }}
                      />
                    ) : (
                      <Flex direction="column" justify="center" h="600px">
                        <video
                          src={`http://localhost:4000/public${current?.url}`}
                          controls
                          playsInline
                          preload="metadata"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            background: "#000",
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      </Flex>
                    )}
                  </AspectRatio>

                  {photos.length > 1 && (
                    <>
                      <ActionIcon
                        variant="outline"
                        radius="xl"
                        size="lg"
                        color="blue"
                        onClick={prev}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: rem(8),
                          transform: "translateY(-50%)",
                        }}
                        title="Ảnh trước"
                      >
                        <IconChevronLeft />
                      </ActionIcon>

                      <ActionIcon
                        variant="outline"
                        radius="xl"
                        size="lg"
                        color="blue"
                        onClick={next}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: rem(8),
                          transform: "translateY(-50%)",
                        }}
                        title="Ảnh sau"
                      >
                        <IconChevronRight />
                      </ActionIcon>
                    </>
                  )}
                </Box>
              )}

              <Flex justify="space-between" align="center">
                {hasPhotos && current?.caption && (
                  <Text ta="center" c="dimmed" fz="sm" flex={1}>
                    {current.caption}
                  </Text>
                )}
                <Badge variant="filled" radius="sm" color="teal">
                  {hasPhotos ? `${photoIdx + 1}/${photos.length}` : "0/0"}
                </Badge>
              </Flex>
            </Stack>
          </>
        ) : (
          <Text c="dimmed">Không có mốc nào phù hợp bộ lọc.</Text>
        )}
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper radius="md" p="0" mb="sm">
          <Group gap="sm" wrap="wrap" align="end" justify="end">
            <Group gap="sm" wrap="wrap">
              <Select
                label="Năm"
                placeholder="Tất cả"
                data={yearOptions}
                value={yearFilter}
                onChange={setYearFilter}
                clearable
                w={140}
              />
              <Select
                label="Tháng"
                placeholder="Tất cả"
                data={monthOptions}
                value={monthFilter}
                onChange={setMonthFilter}
                clearable
                w={180}
              />
            </Group>

            <Button variant="subtle" color="gray" onClick={clearFilters}>
              Xoá lọc
            </Button>
          </Group>
        </Paper>

        <ScrollArea.Autosize mah={"750"} maw="100%" pr="md">
          <MyTimeline
            loveTimelineData={filteredData}
            onSelect={handleSelect}
            selectedIdx={activeIdx}
          />
        </ScrollArea.Autosize>
      </Grid.Col>
    </Grid>
  );
}
