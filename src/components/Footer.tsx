"use client";
import { Box, Container, Divider, Group, Text } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";

export default function Footer() {
  return (
    <Box mt={"md"} p={"xs"} bg={"#ebebeb"}>
      <Group justify="center" gap="xs">
        <Text size="sm" c="dimmed">
          Thực hiện bởi
        </Text>
        <IconHeart size={16} color="pink" fill="pink" />
        <Text size="sm" c="dimmed">
          Ndt28dev
        </Text>
      </Group>
      <Text size="xs" c="dimmed" ta="center" mt="xs" fs="italic">
        “Mỗi khoảnh khắc bên nhau là một kỷ niệm ngọt ngào.”
      </Text>
    </Box>
  );
}
