"use client";
import { LoveType } from "@/modules/enum/LoveType";
import {
  iconColorMapper,
  ILoveTimeline,
} from "@/modules/interface/ILoveTimeline";
import { formatDate } from "@/utils/Format";
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Flex,
  Group,
  Modal,
  rem,
  Stack,
  Text,
  Timeline,
  Title,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlbum,
  IconBeach,
  IconBike,
  IconCake,
  IconChevronLeft,
  IconChevronRight,
  IconGift,
  IconHeart,
  IconHeartUp,
  IconMessageHeart,
  IconPhoto,
  IconPhotoHeart,
  IconPictureInPicture,
  IconPizza,
} from "@tabler/icons-react";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

interface MyTimelineProps {
  loveTimelineData: ILoveTimeline[];
  onSelect?: (index: number) => void;
  selectedIdx?: number;
}

export const iconMapper: Record<LoveType, JSX.Element> = {
  [LoveType.MEET_DAY]: <IconHeart size={18} color="white" />,
  [LoveType.BIRTHDAY]: <IconCake size={18} color="white" />,
  [LoveType.DINNER]: <IconPizza size={18} color="white" />,
  [LoveType.TRAVEL]: <IconBeach size={18} color="white" />,
  [LoveType.ANNIVERSARY]: <IconHeartUp size={18} color="white" />,
  [LoveType.SURPRISE]: <IconGift size={18} color="white" />,
  [LoveType.MESSAGE]: <IconMessageHeart size={18} color="white" />,
  [LoveType.ORTHER]: <IconPhoto size={18} color="white" />,
};

const BULLET_SIZE = 30;

export function MyTimeline({
  loveTimelineData,
  onSelect,
  selectedIdx,
}: MyTimelineProps) {
  return (
    <Timeline
      active={loveTimelineData.length - 1}
      bulletSize={BULLET_SIZE}
      lineWidth={3}
    >
      {loveTimelineData.map((item, idx) => {
        const colorToken = iconColorMapper[item.icon];

        return (
          <Timeline.Item
            bg={idx === selectedIdx ? "#f5f5f5" : "transparent"}
            key={item.id}
            color={colorToken as any}
            bullet={
              <ActionIcon
                variant="filled"
                radius="xl"
                size={BULLET_SIZE - 6}
                color={colorToken as any}
                title="Xem ảnh"
                aria-label="Xem ảnh"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(idx);
                }}
                style={{ cursor: "pointer" }}
              >
                {iconMapper[item.icon]}
              </ActionIcon>
            }
            title={
              <Flex align="center" gap="xs">
                <Title
                  style={{ cursor: "pointer" }}
                  order={4}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(idx);
                  }}
                >
                  {item.title}
                </Title>
                <Badge bg="#FF4D6D" radius="md">
                  {formatDate(item.date)}
                </Badge>
              </Flex>
            }
          >
            <Text size="sm" mt={4}>
              {item.description}
            </Text>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
}
