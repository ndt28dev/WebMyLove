import { Container } from "@mantine/core";
import StoryDetailClient from "@/container/home/stories/id/StoryDetailClient";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container size="lg" pt="md">
      <StoryDetailClient id={id} />
    </Container>
  );
}
