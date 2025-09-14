export type MenuChild = { label: string; link: string };

export type MenuEntry = {
  label: string;
  link?: string;
  links?: MenuChild[];
  exact?: boolean;
};

export const menuHeader: MenuEntry[] = [
  { link: "/home", label: "Trang chủ", exact: true },
  { link: "/home/photos", label: "Album ảnh" },
  { link: "/home/stories", label: "Câu chuyện" },
  { link: "/home/timeline", label: "Mốc thời gian" },
  // {
  //   label: "Kỷ niệm",
  //   links: [
  //     { link: "/home/photos", label: "Album ảnh" },
  //     { link: "/home/stories", label: "Câu chuyện" },
  //     { link: "/home/timeline", label: "Mốc thời gian" },
  //   ],
  // },
  // { link: "/home/blogs", label: "Bài viết" },
  // { link: "/home/playlist", label: "Playlist" },
  // {
  //   label: "Khác",
  //   links: [
  //     { link: "/home/minigames", label: "Mini Games" },
  //     { link: "/home/quizs", label: "Trắc nghiệm vui" },
  //   ],
  // },
];
