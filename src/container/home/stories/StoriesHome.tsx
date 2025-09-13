"use client";

import { useState } from "react";
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
  ThemeIcon,
  Badge,
  Stack,
} from "@mantine/core";
import { IconHeart, IconCalendar } from "@tabler/icons-react";
import { IStory } from "@/modules/interface/IStory";
import { loveStories } from "@/modules/data/stories/data";

function formatDate(d?: Date) {
  try {
    return d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";
  } catch {
    return "";
  }
}

function StoryCard({ story }: { story: IStory }) {
  const [hovered, setHovered] = useState(false);

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
          src={story.coverImage}
          h="100%"
          style={{
            transition: "transform .3s ease",
            transform: hovered ? "scale(1.03)" : "scale(1)",
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
            <Group gap={6} c="gray.2" fz="xs">
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
            {story.tags!.map((t) => (
              <Badge key={t} size="sm" variant="light" color="pink">
                {t}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Box>
    </Card>
  );
}

export default function StoriesGridTwoPerRow() {
  return (
    <Grid gutter="md">
      {loveStories.map((s) => (
        <Grid.Col key={s.id} span={{ base: 12, sm: 6 }}>
          <StoryCard story={s} />
        </Grid.Col>
      ))}
    </Grid>
  );
}
