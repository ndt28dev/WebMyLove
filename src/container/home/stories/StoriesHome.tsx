"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Grid,
  Card,
  CardSection,
  BackgroundImage,
  Overlay,
  Box,
  Group,
  Title,
  Text,
  Badge,
  Stack,
  Loader,
  Center,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { IStory } from "@/modules/interface/IStory";

function formatDate(d?: string | Date | null) {
  try {
    if (!d) return "";
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return new Date(dateObj).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * Chuẩn hoá tags thành mảng chuỗi an toàn.
 * - Nếu là JSON string chứa array -> JSON.parse
 * - Nếu là "a,b,c" -> split
 * - Nếu là object -> Object.values
 * - Trả về string[] đã trim và loại bỏ rỗng / dấu quote
 */
function normalizeTags(tags: IStory["tags"]): string[] {
  if (!tags) return [];

  // Nếu đã là mảng
  if (Array.isArray(tags)) {
    return tags
      .map((t) => (t === null || t === undefined ? "" : String(t)))
      .map((s) => s.replace(/^"+|"+$/g, "").trim())
      .filter(Boolean);
  }

  // Nếu là chuỗi
  if (typeof tags === "string") {
    const s: string = (tags as string)?.trim() || "";

    // nếu có khả năng là 1 JSON array string: starts with '[' (cân nhắc cả escaped)
    const looksLikeJsonArray =
      s.startsWith("[") ||
      s.startsWith('"[') ||
      s.startsWith("\\[") ||
      /^\s*"\[/.test(s);

    if (looksLikeJsonArray) {
      try {
        // một số backend có thể trả string escaped, thử parse nhiều lần nếu cần
        let parsed: any = s;
        // nếu là string chứa JSON (ví dụ: "\"[...]" hoặc '["a","b"]'), cố gắng parse đến khi thành array hoặc fail
        let attempts = 0;
        while (typeof parsed === "string" && attempts < 3) {
          parsed = JSON.parse(parsed);
          attempts++;
        }
        if (Array.isArray(parsed)) {
          return parsed
            .map((v) => (v === null || v === undefined ? "" : String(v)))
            .map((t) => t.replace(/^"+|"+$/g, "").trim())
            .filter(Boolean);
        }
      } catch {
        // nếu parse lỗi thì fallback xuống split bên dưới
      }
    }

    // fallback: có thể là "a,b,c" hoặc ' "a","b" '
    // loại bỏ [] hoặc " nếu có phần bắt đầu/ending thừa
    let cleaned = s.replace(/^\[+/, "").replace(/\]+$/, "").trim();

    // loại bỏ cặp ngoặc kép ở đầu cuối nếu chuỗi toàn bị quote
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

    // split bằng dấu phẩy
    const parts = cleaned
      .split(",")
      .map((p: string) =>
        p
          .replace(/^"+|"+$/g, "")
          .replace(/^'+|'+$/g, "")
          .trim()
      )
      .filter(Boolean);

    return parts;
  }

  // Nếu là object -> lấy values
  if (typeof tags === "object") {
    try {
      const vals = Object.values(tags)
        .map((v) => (v === null || v === undefined ? "" : String(v)))
        .map((t) => t.replace(/^"+|"+$/g, "").trim())
        .filter(Boolean);
      return vals;
    } catch {
      return [];
    }
  }

  // Các kiểu khác -> convert thành string
  return [String(tags)].map((t) => t.trim()).filter(Boolean);
}

function StoryCard({ story }: { story: IStory }) {
  const [hovered, setHovered] = useState(false);

  // chuẩn hoá 1 lần trước render
  const tagsArray = normalizeTags(story.tags);

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      component={Link}
      href={`/home/stories/${story.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .14s ease, box-shadow .14s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 6px 16px rgba(0,0,0,.08)" : "none",
      }}
      aria-label={`Xem câu chuyện: ${story.title}`}
    >
      <CardSection style={{ position: "relative", height: 240 }}>
        <BackgroundImage
          src={`http://localhost:4000/public${story.coverImage}`}
          h="100%"
          style={{
            transition: "transform .3s ease",
            transform: hovered ? "scale(1.03)" : "scale(1)",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <Overlay gradient="linear-gradient(180deg, rgba(0,0,0,0) 10%, rgba(0,0,0,.65) 95%)" />
        </BackgroundImage>

        <Box
          p="md"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box ps={"md"} style={{ flex: 1, minWidth: 0 }}>
            <Title
              order={4}
              c="white"
              style={{ lineHeight: 1.15 }}
              lineClamp={1}
            >
              {story.title}
            </Title>
            <Group gap={6} c="gray.2" fz="xs" align="center">
              <IconCalendar size={14} />
              <Text>{formatDate(story.date)}</Text>
            </Group>
          </Box>
        </Box>
      </CardSection>

      <Box p="md">
        <Stack gap={"xs"}>
          <Text c="dimmed" fz="sm" lineClamp={1}>
            {story.summary}
          </Text>

          <Group gap={6}>
            {tagsArray.map((t, idx) => (
              <Badge key={`${t}-${idx}`} size="sm" variant="light" color="pink">
                {t}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Box>
    </Card>
  );
}

export default function StoriesGridTwoPerRow({
  apiUrl = "http://localhost:4000/api/stories",
}: {
  apiUrl?: string;
}) {
  const [stories, setStories] = useState<IStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchStories() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status} - ${text}`);
        }

        const data = await res.json();
        // nếu API trả { data: [...] } thì cần điều chỉnh; cố gắng map an toàn:
        const items: IStory[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setStories(items);
      } catch (err: any) {
        if (err.name === "AbortError") return; // unmount
        console.error("Fetch stories error:", err);
        setError(err.message || "Lỗi khi tải stories");
      } finally {
        setLoading(false);
      }
    }

    fetchStories();

    function onFocus() {
      fetchStories();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      controller.abort();
      window.removeEventListener("focus", onFocus);
    };
  }, [apiUrl]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Box py="xl">
        <Text color="red" ta="center" mb="sm">
          Có lỗi khi tải dữ liệu: {error}
        </Text>
        <Center>
          <Text c="dimmed">Hãy kiểm tra API hoặc thử tải lại trang.</Text>
        </Center>
      </Box>
    );
  }

  if (!stories.length) {
    return (
      <Box py="xl">
        <Text ta="center" c="dimmed">
          Chưa có câu chuyện nào.
        </Text>
      </Box>
    );
  }

  return (
    <Grid gutter="md">
      {stories.map((s) => (
        <Grid.Col key={s.id} span={{ base: 12, sm: 6 }}>
          <StoryCard story={s} />
        </Grid.Col>
      ))}
    </Grid>
  );
}
