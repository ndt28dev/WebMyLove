"use client";
import {
  Card,
  Image,
  Text,
  Title,
  Box,
  Group,
  Stack,
  Button,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { dataLoveBlogsHome } from "@/modules/data/home/HomeData";

export default function BlogCarousel() {
  const autoplay = useRef(Autoplay({ delay: 3000 }));
  return (
    <>
      <Carousel
        slideSize="70%"
        height={400}
        orientation="horizontal"
        emblaOptions={{
          loop: true,
          dragFree: false,
          align: "center",
        }}
        styles={{
          control: {
            backgroundColor: "white",
            color: "black",
            border: "none",
            "&:hover": {
              backgroundColor: "rgba(255, 105, 180, 1)",
            },
          },
        }}
      >
        {dataLoveBlogsHome.map((blog) => (
          <Carousel.Slide key={blog.id}>
            <Card
              p={0}
              shadow="none"
              radius="md"
              withBorder={false}
              me={"sm"}
              style={{
                height: "100%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src={blog.images[0]}
                alt={blog.title}
                height={"100%"}
                fit="cover"
              />

              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1))",
                  color: "white",
                }}
              >
                <Stack gap="xs">
                  <Title order={4} fw={600}>
                    {blog.title}
                  </Title>
                  <Text size="sm" lineClamp={2}>
                    {blog.details[0]?.description}
                  </Text>
                  <Button
                    size="sm"
                    radius="sm"
                    variant="filled"
                    color="#FF4D6D"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => {
                      // console.log("Go to blog", blog.id);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Carousel.Slide>
        ))}
      </Carousel>
    </>
  );
}
