import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Paper,
  Text,
  Stack,
} from "@mantine/core";
import { IconArrowsExchange, IconMoodCry } from "@tabler/icons-react";
import { useState } from "react";

export default function TimeReal() {
  const [isTotalDays, setIsTotalDays] = useState(false);

  const time = {
    years: 1,
    months: 3,
    days: 28,
    hours: 16,
    minutes: 11,
    seconds: 0,
    totalDays: 483, // bạn có thể chỉnh lại nếu muốn
  };

  return (
    <Stack align="center" w="100%">
      <Flex align={"center"} justify={"space-between"} w={"100%"}>
        <ActionIcon
          variant="light"
          color="pink"
          size={50}
          radius="xl"
          onClick={() => setIsTotalDays((prev) => !prev)}
        >
          <IconArrowsExchange size={30} />
        </ActionIcon>

        {isTotalDays ? (
          <Group gap="md" justify="center" flex={1}>
            {[
              { label: "Ngày", value: time.totalDays },
              { label: "Giờ", value: time.hours },
              { label: "Phút", value: time.minutes },
              { label: "Giây", value: time.seconds },
            ].map((item, i) => (
              <Paper
                key={i}
                shadow="sm"
                radius="md"
                p="sm"
                style={{ minWidth: 80 }}
              >
                <Group gap={4} justify="center">
                  {String(item.value)
                    .padStart(2, "0")
                    .split("")
                    .map((digit, j) => (
                      <Box
                        key={j}
                        style={{
                          width: 60,
                          height: 90,
                          backgroundColor: "pink",
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text fw={700} fz={36} c="white">
                          {digit}
                        </Text>
                      </Box>
                    ))}
                </Group>
                <Text fz="18px" fw={700} c="pink" ta="center" mt={4}>
                  {item.label}
                </Text>
              </Paper>
            ))}
          </Group>
        ) : (
          <Group gap="md" justify="center" flex={1}>
            {[
              { label: "Năm", value: time.years },
              { label: "Tháng", value: time.months },
              { label: "Ngày", value: time.days },
              { label: "Giờ", value: time.hours },
              { label: "Phút", value: time.minutes },
              { label: "Giây", value: time.seconds },
            ].map((item: any, i) => (
              <Paper
                key={i}
                shadow="sm"
                radius="md"
                p="sm"
                style={{ minWidth: 80 }}
              >
                <Group gap={4} justify="center">
                  {String(item.value)
                    .padStart(2, "0")
                    .split("")
                    .map((digit, j) => (
                      <Box
                        key={j}
                        style={{
                          width: 60,
                          height: 90,
                          backgroundColor: "pink",
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text fw={700} fz={36} c="white">
                          {digit}
                        </Text>
                      </Box>
                    ))}
                </Group>
                <Text fz="18px" fw={700} c="pink" ta="center" mt={4}>
                  {item.label}
                </Text>
              </Paper>
            ))}
          </Group>
        )}
      </Flex>

      <Paper
        mt="md"
        p="lg"
        radius="xl"
        shadow="lg"
        style={{
          background: "linear-gradient(135deg, #ffe4ec, #fff0f6)",
          border: "2px solid #ff85a2",
          textAlign: "center",
        }}
      >
        <Stack align="center" gap={8}>
          <Group gap={8}>
            <IconMoodCry size={28} color="#ff4d6d" />
            <Text fw={800} fz="xl" c="#d6336c">
              Đã dừng lại rồi huhu
            </Text>
          </Group>

          <Text fz="md" c="dimmed" fw={500}>
            Hiện tại chỉ cập nhật đến{" "}
            <Text span fw={700} c="#e64980">
              ngày 13 tháng 9 năm 2025
            </Text>
            , sẽ cập nhật sớm vào thời gian tới
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
