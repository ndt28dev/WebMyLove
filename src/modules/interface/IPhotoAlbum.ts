import { IPhoto } from "./IPhoto";

export interface IPhotoAlbum {
  id: number;
  title: string;
  description?: string;
  coverImage: string;
  photos: IPhoto[];
}
