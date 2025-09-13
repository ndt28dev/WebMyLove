export type MediaType = "image" | "video";

export interface IPhoto {
  id: number;
  url: string;
  type: MediaType;
  caption?: string;
}
