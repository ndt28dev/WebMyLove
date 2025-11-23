import { IPhoto } from "./IPhoto";

export interface IPhotoAlbum {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  photos: IPhoto[];
}
