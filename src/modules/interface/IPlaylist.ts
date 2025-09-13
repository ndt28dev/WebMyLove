export interface IPlaylist {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  song: {
    title: string;
    artist: string;
    url: string;
    duration?: string;
  };
}
