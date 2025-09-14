"use client";
import { Container, Stack } from "@mantine/core";
import Slideshow from "./Slideshow";
import TimeReal from "./TimeReal";
import LoveStoryPage from "./LoveStoryPage";
import BlogCarousel from "./BlogCarousel";
import PlaylistSection from "./PlaylistSection";
import MiniGamesHubPage from "./MiniGamesHubPage";

export default function HomePage() {
  return (
    <Container size="lg" pt={"md"}>
      <Stack align="center" gap="xl">
        <Slideshow />
        <TimeReal />
        <LoveStoryPage />
        <BlogCarousel />
        {/* <PlaylistSection /> */}
        {/* <MiniGamesHubPage /> */}
      </Stack>
    </Container>
  );
}
