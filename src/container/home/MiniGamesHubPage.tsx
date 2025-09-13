"use client";

import {
  Grid,
  GridCol,
  Card,
  BackgroundImage,
  Overlay,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Stack,
  ThemeIcon,
  SimpleGrid,
  ScrollArea,
  Paper,
  Box,
  Flex,
} from "@mantine/core";
import {
  IconCards,
  IconPuzzle2,
  IconHeart,
  IconQuestionMark,
  IconBrain,
  IconPhotoHeart,
  IconMusic,
  IconSparkles,
  IconSticker,
  IconGoGame,
  IconDeviceGamepad,
} from "@tabler/icons-react";
import { dataMiniGameHome, dataQuizHome } from "@/modules/data/home/HomeData";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MiniGamesHubPage() {
  const route = useRouter();
  return (
    <Grid w={"100%"} align="stretch">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md" h={"100%"}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <ThemeIcon size={42} radius="xl" color="#1C9AD3">
                <IconDeviceGamepad size={22} />
              </ThemeIcon>
              <Title order={3}>Mini‑games</Title>
            </Group>
            <Button
              radius="xl"
              variant="gradient"
              onClick={() => {
                route.push("/home/minigames");
              }}
            >
              Trải nghiệm
            </Button>
          </Group>
          <Card
            withBorder
            radius="lg"
            p={0}
            h="100%"
            style={{ overflow: "hidden", position: "relative" }}
          >
            <BackgroundImage src={dataMiniGameHome.image} w="100%" h="100%">
              <Overlay
                gradient="linear-gradient(180deg, rgba(0,0,0,0) 10%, rgba(0,0,0,.55) 90%)"
                style={{
                  transition: "opacity .2s ease",
                }}
              />
            </BackgroundImage>
          </Card>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <ThemeIcon size={42} radius="xl" color="violet">
                <IconQuestionMark size={22} />
              </ThemeIcon>
              <Title order={3}>Trắc nghiệm vui</Title>
            </Group>
            <Button
              radius="xl"
              variant="default"
              onClick={() => {
                route.push("/home/quizs");
              }}
            >
              Xem tất cả
            </Button>
          </Group>

          <Stack gap="sm">
            {dataQuizHome.map((q) => (
              <Card key={q.id} withBorder radius="lg" p="md">
                <Flex align="center" wrap="nowrap">
                  <ThemeIcon
                    size={36}
                    radius="xl"
                    color="violet"
                    variant="light"
                  >
                    <IconPuzzle2 size={18} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }} ml={"md"}>
                    <Text fw={700}>{q.title}</Text>
                    <Text c="dimmed" fz="sm" lineClamp={2}>
                      {q.description}
                    </Text>
                  </Box>
                  <Button size="xs" radius="xl" color="violet" variant="light">
                    Làm ngay
                  </Button>
                </Flex>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
