"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  Badge,
  Image,
  AspectRatio,
  Group,
  Box,
  Modal,
  SimpleGrid,
  Flex,
} from "@mantine/core";
import MyBreadcrumbs from "@/components/MyBreadcrumbs";
import type {
  IStory,
  StoryDetailBlock,
  MediaItem,
} from "@/modules/interface/IStory";
import { formatDate } from "@/utils/Format";

const API_BASE =
  "https://my-love-backend-production-6dbc.up.railway.app/api/stories";

function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <Box ml="calc(50% - 50vw)" mr="calc(50% - 50vw)">
      {children}
    </Box>
  );
}

function NarrativeBlock({
  block,
  onPreview,
}: {
  block: StoryDetailBlock;
  onPreview: (m: MediaItem) => void;
}) {
  const media = block.media ?? [];
  const hasOnlyOne = media.length === 1;

  return (
    <Stack gap="xs">
      {block.title && <Title order={3}>{block.title}</Title>}
      {block.description && <Text c="dimmed">{block.description}</Text>}

      {/* 1 item */}
      {hasOnlyOne ? (
        <Flex direction="column">
          <AspectRatio ratio={16 / 9}>
            {media[0].type === "image" ? (
              <Image
                src={`https://my-love-backend-production-6dbc.up.railway.app/public${media[0].url}`}
                alt={media[0].caption || block.title || "photo"}
                fit="cover"
                onClick={() => onPreview(media[0])}
                style={{ cursor: "zoom-in", borderRadius: 8 }}
              />
            ) : (
              <video
                src={`https://my-love-backend-production-6dbc.up.railway.app/public${media[0].url}`}
                controls
                style={{ borderRadius: 8 }}
              />
            )}
          </AspectRatio>
          {media[0].caption && (
            <Text ta="center" c="dimmed" fz="sm" mt={8}>
              {media[0].caption}
            </Text>
          )}
        </Flex>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {media.map((m) => (
            <Box key={m.id} onClick={() => m.type === "image" && onPreview(m)}>
              <AspectRatio
                ratio={4 / 3}
                style={{ cursor: m.type === "image" ? "zoom-in" : "default" }}
              >
                {m.type === "image" ? (
                  <Image
                    src={`https://my-love-backend-production-6dbc.up.railway.app/public${m.url}`}
                    alt="photo"
                    fit="cover"
                    style={{ cursor: "zoom-in", borderRadius: 8 }}
                  />
                ) : (
                  <video
                    src={`https://my-love-backend-production-6dbc.up.railway.app/public${m.url}`}
                    controls
                    style={{ borderRadius: 8 }}
                  />
                )}
              </AspectRatio>
              {m.caption && (
                <Text ta="center" c="dimmed" fz="sm" mt={6}>
                  {m.caption}
                </Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

export default function StoryDetailClient({ id }: { id: string }) {
  const [story, setStory] = useState<IStory | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  // 🔥 Fetch story theo ID
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`);
        const json = await res.json();
        setStory(json?.data || json);
      } catch (err) {
        console.error("Fetch story error", err);
      }
    })();
  }, [id]);

  const blocks = useMemo(() => story?.details || [], [story]);

  const openPreview = (m: MediaItem) => {
    if (m.type !== "image") return;
    setPreview(m);
    setPreviewOpen(true);
  };

  if (!story) return <Text>Đang tải...</Text>;

  const items = [
    { title: "Trang chủ", href: "/" },
    { title: "Câu chuyện", href: "/home/stories" },
    { title: story.title, href: `/home/stories/${story.id}` },
  ];

  return (
    <Container size="lg">
      <Stack gap="md">
        <MyBreadcrumbs data={items} />

        <Group justify="space-between">
          <div>
            <Title order={2}>{story.title}</Title>
            <Badge>{story.date ? formatDate(new Date(story.date)) : ""}</Badge>
          </div>
          <Group>
            {(Array.isArray(story.tags)
              ? story.tags
              : (() => {
                  try {
                    return JSON.parse(story.tags as string) as string[];
                  } catch {
                    return [];
                  }
                })()
            ).map((t) => (
              <Badge key={t} variant="light" color="pink">
                {t}
              </Badge>
            ))}
          </Group>
        </Group>

        {story.summary && <Text c="dimmed">{story.summary}</Text>}

        <AspectRatio ratio={16 / 9}>
          <Image
            src={`https://my-love-backend-production-6dbc.up.railway.app/public${story.coverImage}`}
            alt={story.title}
            fit="cover"
            radius="md"
          />
        </AspectRatio>

        <Stack gap="lg">
          {blocks.map((b) => (
            <Box key={b.id}>
              <NarrativeBlock block={b} onPreview={openPreview} />
            </Box>
          ))}
        </Stack>

        <Modal
          opened={previewOpen}
          onClose={() => setPreviewOpen(false)}
          centered
          padding={0}
          withCloseButton={false}
        >
          {preview && (
            <Image
              src={`https://my-love-backend-production-6dbc.up.railway.app/public${preview.url}`}
              alt={preview.caption || story.title}
              fit="contain"
              onClick={() => setPreviewOpen(false)}
              style={{ cursor: "zoom-out" }}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
}
