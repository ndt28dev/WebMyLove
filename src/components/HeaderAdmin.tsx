"use client";

import { useEffect, useState } from "react";
import { Center, Text, Group, Badge } from "@mantine/core";
import { formatDateTime } from "@/utils/Format";

export default function HeaderAdmin() {
  const [now, setNow] = useState(() => {
    if (typeof window === "undefined") return "";
    return formatDateTime(new Date());
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(formatDateTime(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Center h={50} bg={"brand.1"}>
      <Group gap={"xs"}>
        <Text fz={25} fw={"bold"} c={"brand.5"}>
          Admin web My Love
        </Text>
        <Badge size="lg" color="brand.5">
          {mounted ? now : ""}
        </Badge>
      </Group>
    </Center>
  );
}
