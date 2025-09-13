import MyBreadcrumbs from "@/components/MyBreadcrumbs";
import { Container, Stack } from "@mantine/core";
import StoriesHome from "./StoriesHome";

export default function StoriesPage() {
  const items = [
    { title: "Trang chủ", href: "/home" },
    { title: "Câu chuyện", href: "/home/stories" },
  ];
  return (
    <Container size="lg" pt={"md"}>
      <Stack gap="md">
        <MyBreadcrumbs data={items} />
        <StoriesHome />
      </Stack>
    </Container>
  );
}
