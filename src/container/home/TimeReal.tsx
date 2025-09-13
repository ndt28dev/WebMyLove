import { ActionIcon, Box, Flex, Group, Paper, Text } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import duration from "dayjs/plugin/duration";
import { startDate } from "@/modules/data/home/HomeData";

dayjs.extend(duration);

export default function TimeReal() {
  const [time, setTime] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
  });
  const [isTotalDays, setIsTotalDays] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const diff = dayjs.duration(now.diff(startDate));

      // Tổng số ngày
      const totalDays = Math.floor(now.diff(startDate, "day"));

      setTime({
        years: diff.years(),
        months: diff.months(),
        days: diff.days(),
        hours: diff.hours(),
        minutes: diff.minutes(),
        seconds: diff.seconds(),
        totalDays,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
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
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
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
            time.years > 0 && { label: "Năm", value: time.years }, // ẩn nếu 0
            { label: "Tháng", value: time.months },
            { label: "Ngày", value: time.days },
            { label: "Giờ", value: time.hours },
            { label: "Phút", value: time.minutes },
            { label: "Giây", value: time.seconds },
          ]
            .filter(Boolean) // loại null
            .map((item: any, i) => (
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
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
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
  );
}
