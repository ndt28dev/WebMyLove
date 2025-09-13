import { MantineColor } from "@mantine/core";
import { LoveType } from "../enum/LoveType";

export const iconColorMapper: Record<LoveType, MantineColor | string> = {
  [LoveType.MEET_DAY]: "pink",
  [LoveType.BIRTHDAY]: "yellow",
  [LoveType.DINNER]: "orange",
  [LoveType.TRAVEL]: "teal",
  [LoveType.ANNIVERSARY]: "grape",
  [LoveType.SURPRISE]: "violet",
  [LoveType.MESSAGE]: "cyan",
  [LoveType.ORTHER]: "lime",
};

export interface ILovePhoto {
  url: string;
  type?: string;
  caption?: string;
}

export interface ILoveTimeline {
  id: number;
  date: Date;
  title: string;
  description: string;
  icon: LoveType;
  photos?: ILovePhoto[];
}
