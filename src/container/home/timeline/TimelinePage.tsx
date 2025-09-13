import MyBreadcrumbs from "@/components/MyBreadcrumbs";
import { Container, Stack } from "@mantine/core";
import TimelineHome from "./TimelineHome";

export default function TimelinePage() {
  const items = [
    { title: "Trang chủ", href: "/home" },
    { title: "Mốc thời gian", href: "/home/timeline" },
  ];
  return (
    <Container size="lg" pt={"md"}>
      <Stack gap="md">
        <MyBreadcrumbs data={items} />
        <TimelineHome />
      </Stack>
    </Container>
  );
}
