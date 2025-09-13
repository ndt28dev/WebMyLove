"use client";

import Link from "next/link";
import {
  Card,
  Title,
  Text,
  Stack,
  Button,
  SimpleGrid,
  BackgroundImage,
  Overlay,
  Group,
  Box,
} from "@mantine/core";
import { IconPlaylist, IconArrowRight } from "@tabler/icons-react";
import { dataPlaylistHome } from "@/modules/data/home/HomeData";
import { useRouter } from "next/navigation";

export default function PlaylistSection() {
  const route = useRouter();
  return (
    <Box>
      <Stack align="center" gap="sm" mb={"md"}>
        <Title order={2} ta="center" c="pink">
          Playlist tình yêu của chúng ta
        </Title>
        <Text ta="center" maw={700} c="dimmed">
          Những giai điệu lưu giữ kỷ niệm, mỗi bài hát là một chương trong câu
          chuyện tình yêu đôi mình.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
        {dataPlaylistHome.map((pl) => (
          <Card
            key={pl.id}
            shadow="md"
            radius="lg"
            withBorder
            p="0"
            style={{
              overflow: "hidden",
              transition: "transform .25s ease, box-shadow .25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(0)";
            }}
          >
            <BackgroundImage
              src={pl.coverImage}
              h={400}
              radius="md"
              style={{ position: "relative" }}
            >
              <Overlay
                gradient="linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,.55) 100%)"
                opacity={1}
                zIndex={0}
              />
              <Stack
                justify="flex-end"
                h="100%"
                p="md"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Group gap="xs">
                  <IconPlaylist size={22} color="white" />
                  <Text fw={700} c="white">
                    {pl.title}
                  </Text>
                </Group>
                <Text
                  c="white"
                  size="sm"
                  style={{ opacity: 0.9 }}
                  lineClamp={2}
                >
                  {pl.description}
                </Text>
                <Button
                  component={Link}
                  href="/playlist"
                  color="#FF4D6D"
                  radius="xl"
                  rightSection={<IconArrowRight size={18} />}
                  onClick={() => route.push("/home/playlist")}
                >
                  Đến Playlist
                </Button>
              </Stack>
            </BackgroundImage>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}
