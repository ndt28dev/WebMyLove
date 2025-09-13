import { Container, Stack } from "@mantine/core";
import PhotosHome from "./PhotosHome";
import MyBreadcrumbs from "@/components/MyBreadcrumbs";

export default function PhotosPage() {
  const items = [
    { title: "Trang chủ", href: "/home" },
    { title: "Album ảnh", href: "/home/photos" },
  ];
  return (
    <Container size="lg" pt={"md"}>
      <Stack gap="md">
        <MyBreadcrumbs data={items} />
        <PhotosHome />
      </Stack>
    </Container>
  );
}
