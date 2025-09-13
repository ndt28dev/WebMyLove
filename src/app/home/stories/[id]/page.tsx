import { notFound } from "next/navigation";
import { Container } from "@mantine/core";
import { loveStories } from "@/modules/data/stories/data";
import type { IStory } from "@/modules/interface/IStory";
import StoryDetailClient from "@/container/home/stories/id/StoryDetailClient";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const story = loveStories.find((s) => String(s.id) === id) as
    | IStory
    | undefined;
  if (!story) return notFound();

  return (
    <Container size="lg" pt="md">
      <StoryDetailClient story={story} />
    </Container>
  );
}
