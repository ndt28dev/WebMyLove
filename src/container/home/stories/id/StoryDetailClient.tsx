"use client";

import Link from "next/link";
import {
  Box,
  Group,
  Title,
  Text,
  Badge,
  Image,
  AspectRatio,
  SimpleGrid,
  Modal,
  Container,
  Stack,
  Flex,
} from "@mantine/core";
import { useMemo, useState } from "react";
import type {
  IStory,
  StoryDetailBlock,
  MediaItem,
} from "@/modules/interface/IStory";
import { formatDate } from "@/utils/Format";
import MyBreadcrumbs from "@/components/MyBreadcrumbs";

/* Full-bleed container: giúp media (1 ảnh/video) tràn 2 mép màn hình để
   cảm giác “kể chuyện” liền mạch, giống tạp chí. */
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
      {block.title && (
        <Title order={3} mt="sm" style={{ lineHeight: 1.25 }}>
          {block.title}
        </Title>
      )}

      {block.description && (
        <Text fz="md" c="dimmed">
          {block.description}
        </Text>
      )}
      {hasOnlyOne ? (
        <Flex direction="column">
          <AspectRatio
            ratio={16 / 9}
            style={{ borderRadius: 12, overflow: "hidden" }}
          >
            {media[0].type === "image" ? (
              <Image
                src={media[0].url}
                alt={media[0].caption || block.title || "photo"}
                fit="cover"
                style={{ cursor: "zoom-in" }}
                onClick={() => onPreview(media[0])}
                h={400}
              />
            ) : (
              <video
                src={media[0].url}
                controls
                playsInline
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  background: "#000",
                  display: "block",
                }}
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {media.map((m, idx) => (
            <Box key={idx}>
              <AspectRatio
                ratio={m.type === "image" ? 4 / 3 : 4 / 3}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: m.type === "image" ? "zoom-in" : "default",
                }}
                onClick={() => m.type === "image" && onPreview(m)}
              >
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt={m.caption || block.title || "photo"}
                    fit="cover"
                  />
                ) : (
                  <video
                    src={m.url}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      background: "#000",
                      display: "block",
                    }}
                  />
                )}
              </AspectRatio>

              {m.caption && (
                <Text ta={"center"} c="dimmed" fz="sm" mt={6} lineClamp={2}>
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

export default function StoryDetailClient({ story }: { story: IStory }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const blocks = useMemo(() => story.details || [], [story.details]);

  const openPreview = (m: MediaItem) => {
    if (m.type !== "image") return;
    setPreview(m);
    setPreviewOpen(true);
  };

  const items = [
    { title: "Trang chủ", href: "/" },
    { title: "Câu chuyện", href: "/home/stories" },
    { title: story?.title, href: `/home/stories/${story.id}` }, // MyBreadcrumbs sẽ tự xử lý item cuối
  ];

  return (
    <Container size="lg">
      <Stack gap="md">
        <MyBreadcrumbs data={items} />

        <Group justify="space-between">
          <Group>
            <div>
              <Title order={2}>{story.title}</Title>
              <Badge>{formatDate(story.date)}</Badge>
            </div>
          </Group>
          <Group gap={8} wrap="wrap">
            {story.tags?.map((t) => (
              <Badge key={t} variant="light" color="pink">
                {t}
              </Badge>
            ))}
          </Group>
        </Group>

        {story.summary && (
          <Text c="dimmed" fz="md">
            {story.summary}
          </Text>
        )}

        <AspectRatio ratio={16 / 9} mb="md">
          <Image
            src={story.coverImage}
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
          size="auto"
          padding={0}
          withCloseButton={false}
          overlayProps={{ backgroundOpacity: 0.85, blur: 2 }}
          styles={{
            content: { background: "transparent", boxShadow: "none" },
            body: { padding: 0 },
          }}
          zIndex={5000}
        >
          {preview && (
            <Image
              src={preview.url}
              alt={preview.caption || story.title}
              maw="95vw"
              mah="95vh"
              fit="contain"
              style={{ cursor: "zoom-out" }}
              onClick={() => setPreviewOpen(false)}
            />
          )}
        </Modal>
      </Stack>
    </Container>
  );
}
