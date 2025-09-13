export type MediaKind = "image" | "video";

export interface MediaItem {
  url: string;
  type: MediaKind; // "image" | "video"
  caption?: string;
}

export interface StoryDetailBlock {
  id: number;
  title?: string;
  description?: string;
  media?: MediaItem[];
}

export const STORY_TAGS = [
  "nhắn tin",
  "đi làm",
  "hẹn hò",
  "ăn uống",
  "xem phim",
  "sinh nhật",
  "valentine",
  "du lịch",
  "kỷ niệm",
  "đời thường",
] as const;
export type StoryTag = (typeof STORY_TAGS)[number];

export interface IStory {
  id: number;
  title: string;
  date: Date;
  coverImage: string;
  summary?: string;
  tags: StoryTag[];
  details: StoryDetailBlock[];
}
