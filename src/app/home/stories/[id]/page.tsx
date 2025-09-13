import { notFound } from "next/navigation";
import { Container } from "@mantine/core";
import { loveStories } from "@/modules/data/stories/data";
import type { IStory } from "@/modules/interface/IStory";
import StoryDetailClient from "@/container/home/stories/id/StoryDetailClient";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const story = loveStories.find((s) => String(s.id) === id) as
    | IStory
    | undefined;
  if (!story) notFound();

  return (
    <Container size="lg" pt="md">
      <StoryDetailClient story={story} />
    </Container>
  );
}

export async function generateStaticParams() {
  return loveStories.map((s) => ({ id: String(s.id) }));
}
