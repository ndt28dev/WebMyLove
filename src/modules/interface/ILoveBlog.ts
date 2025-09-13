import { LoveType } from "../enum/LoveType";

export interface ILoveBlogDetail {
  id: number;
  title: string;
  description: string;
}

export interface ILoveBlog {
  id: number;
  images: string[];
  title: string;
  details: ILoveBlogDetail[];
  createdAt?: Date;
  type?: LoveType;
}
