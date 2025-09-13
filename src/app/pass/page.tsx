"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Text,
  Center,
  Group,
  ActionIcon,
  Box,
  Image,
  useMantineTheme,
  Tooltip,
  Loader,
} from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@mantine/hooks";

export default function PassPage() {
  const [digits, setDigits] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(false); // 👈 thêm state loading
  const router = useRouter();

  const theme = useMantineTheme();

  const largerThanXs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const largerThanSm = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const largerThanMd = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const largerThanLg = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const largerThanXl = useMediaQuery(`(min-width: ${theme.breakpoints.xl})`);

  let overlayStyle = {
    top: "64%",
    left: "44%",
    gap: "12px",
    larger: false,
  };

  if (largerThanXl) {
    overlayStyle = { top: "64.7%", left: "47%", gap: "36px", larger: true };
  } else if (largerThanLg) {
    overlayStyle = { top: "64%", left: "47.1%", gap: "23px", larger: true };
  } else if (largerThanMd) {
    overlayStyle = { top: "64%", left: "47%", gap: "17px", larger: true };
  } else if (largerThanSm) {
    overlayStyle = { top: "64%", left: "47.1%", gap: "9px", larger: true };
  } else if (largerThanXs) {
    overlayStyle = { top: "64%", left: "47%", gap: "1px", larger: true };
  }

  const handleChange = (index: number, delta: number) => {
    setDigits((prev) =>
      prev.map((d, i) => (i === index ? (d + delta + 10) % 10 : d))
    );
  };

  useEffect(() => {
    const code = digits.join("");
    if (code === "60812") {
      setLoading(true);
      const timer = setTimeout(() => {
        router.push("/home");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [digits, router]);

  return (
    <Container
      fluid
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        background: "linear-gradient(135deg, #E5A7DE 0%, #FECCC8 100%)",
      }}
    >
      <Image
        src="/img/avtpass1.png"
        alt="ảnh nền"
        w="100%"
        h="100vh"
        fit={overlayStyle.larger ? "fill" : "cover"}
      />

      <Box
        style={{
          position: "absolute",
          top: "2%",
          left: "2%",
        }}
      >
        <Tooltip label="Ví dụ: 01-01-2020 -> pass: 60101" withArrow>
          <ActionIcon variant="light" color="blue" size={30} radius="xl">
            <IconInfoCircle size={30} />
          </ActionIcon>
        </Tooltip>
      </Box>

      <Box
        style={{
          position: "absolute",
          top: overlayStyle.top,
          left: overlayStyle.left,
          transform: "translateX(-50%)",
          display: "flex",
          gap: overlayStyle.gap,
        }}
      >
        {digits.map((digit, i) => (
          <Center key={i} style={{ flexDirection: "column" }}>
            <ActionIcon
              variant="filled"
              color="pink"
              onClick={() => handleChange(i, +1)}
              size="md"
            >
              <IconChevronUp size={22} />
            </ActionIcon>

            <Text fw={700} fz={22} ta="center" c="black">
              {digit}
            </Text>

            <ActionIcon
              variant="filled"
              color="pink"
              onClick={() => handleChange(i, -1)}
              size="md"
            >
              <IconChevronDown size={22} />
            </ActionIcon>
          </Center>
        ))}
      </Box>

      {loading && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: 100,
          }}
        >
          <Loader size="lg" color="pink" />
          <Text mt="md" c="pink" fw={600}>
            Đang mở khóa tình yêu...
          </Text>
        </Box>
      )}
    </Container>
  );
}
