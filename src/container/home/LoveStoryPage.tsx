"use client";
import {
  Button,
  Container,
  Grid,
  GridCol,
  Image,
  Paper,
  Stack,
  Text,
  Timeline,
  Box,
  Group,
  Center,
} from "@mantine/core";
import {
  IconPhotoHeart,
  IconMessageHeart,
  IconCalendarHeart,
  IconHeart,
  IconSparkles,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import MyButton from "../../components/MyButton";
import dayjs from "dayjs";
import { JSX, useEffect, useState } from "react";
import {
  dataLoveTimelineHome,
  dataSlidesLoveStoryHome,
} from "@/modules/data/home/HomeData";
import { MyTimeline } from "@/components/MyTimeline";

export default function LoveStoryPage() {
  const router = useRouter();
  const today = dayjs().format("DD/MM/YYYY");

  const [index, setIndex] = useState(0);

  // Tự động đổi ảnh sau 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % dataSlidesLoveStoryHome.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const slide = dataSlidesLoveStoryHome[index];

  return (
    <Grid gutter="xl" align="center ">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Box
          pos="relative"
          style={{
            height: 400,
            borderRadius: "16px",
            overflow: "hidden",
          }}
          bg={"red"}
        >
          <Image
            src={slide.image}
            alt="Ảnh kỷ niệm"
            fit="cover"
            h="100%"
            w="100%"
          />

          <Box
            pos="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <Box
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "start",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <Text fz="xl" fw={700} c="white">
                {slide.title}
              </Text>
              {slide.content.map((para, i) => (
                <Text key={i} ta={"left"} mt="sm" fz="md" c="white">
                  {para}
                </Text>
              ))}
            </Box>
          </Box>
        </Box>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="lg">
          <MyTimeline loveTimelineData={dataLoveTimelineHome} />
          <MyButton
            icon={<IconHeart size={18} />}
            size="md"
            onClick={() => router.push("/home/timeline")}
            radius="lg"
          >
            Chuyện tình yêu của mình
          </MyButton>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
