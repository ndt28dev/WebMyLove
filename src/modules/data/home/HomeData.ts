import { ILoveTimeline } from "@/modules/interface/ILoveTimeline";
import dayjs from "dayjs";
import { LoveType } from "../../enum/LoveType";
import { ILoveBlog } from "@/modules/interface/ILoveBlog";
import { IPlaylist } from "@/modules/interface/IPlaylist";
import { IMiniGame } from "@/modules/interface/IMiniGame";
import { IQuiz } from "@/modules/interface/IQuiz";

export const images = [
  "/img/banner/banner8.jpg",
  "/img/banner/banner1.jpg",
  "/img/banner/banner7.jpg",
  "/img/banner/banner10.jpg",
];

export const startDate = dayjs("2024-12-08T00:00:00");

export const dataSlidesLoveStoryHome = [
  {
    image: "/img/homestories/1.jpg",
    title: "Khoảnh khắc định mệnh",
    content: [
      "Khoảnh khắc anh gặp em, trái tim anh như lạc nhịp, để rồi anh biết mình đã tìm thấy điều quý giá nhất trong cuộc đời.",
      "Ánh mắt em, nụ cười em như ngọn nắng sưởi ấm cả thế giới nhỏ bé của anh, khiến anh chẳng thể nào quên.",
    ],
  },
  {
    image: "/img/homestories/2.jpg",
    title: "Những ngày ngập tràn hạnh phúc",
    content: [
      "Mỗi khoảnh khắc bên em đều thật đặc biệt, từ những buổi hẹn hò giản dị cho đến những lần cùng nhau lang thang dưới ánh đèn phố.",
      "Em chính là niềm vui nhỏ bé nhưng trọn vẹn nhất trong thế giới của anh.",
    ],
  },
  {
    image: "/img/homestories/3.jpg",
    title: "Cùng nhau vượt sóng gió",
    content: [
      "Tình yêu không chỉ có tiếng cười, mà còn cả những lúc giận hờn, những phút không hiểu nhau. Nhưng anh biết, chính điều đó làm ta thêm bền chặt.",
      "Cảm ơn em vì đã luôn tin tưởng, bao dung và cùng anh bước qua mọi thử thách.",
    ],
  },
  {
    image: "/img/homestories/4.jpg",
    title: "Tương lai ta cùng viết",
    content: [
      "Anh mong rằng dù sau này đi đâu, làm gì, ta vẫn luôn nắm chặt tay nhau trên mọi chặng đường.",
      "Tình yêu này sẽ lớn dần theo năm tháng, viết nên những chương ngọt ngào nhất của cuộc đời.",
    ],
  },
  {
    image: "/img/homestories/5.jpg",
    title: "Yêu thương giản dị",
    content: [
      "Không cần những lời hoa mỹ, chỉ cần em ở bên, mọi thứ trong anh đều trở nên đủ đầy.",
      "Có em, những ngày bình thường cũng biến thành kỷ niệm đáng nhớ.",
    ],
  },
  {
    image: "/img/homestories/6.jpg",
    title: "Những nụ cười ta trao nhau",
    content: [
      "Mỗi khi em cười, dường như cả thế giới đều dừng lại để ngắm nhìn.",
      "Anh chỉ mong có thể mãi là lý do khiến em mỉm cười hạnh phúc.",
    ],
  },
  {
    image: "/img/homestories/7.jpg",
    title: "Khoảng trời riêng của đôi mình",
    content: [
      "Giữa bao bộn bề, chỉ cần có em, anh như tìm thấy một khoảng trời bình yên.",
      "Em là nơi anh muốn trở về, là ngôi nhà nhỏ trong trái tim anh.",
    ],
  },
  {
    image: "/img/homestories/8.jpg",
    title: "Dấu yêu khắc mãi",
    content: [
      "Mỗi con đường ta từng đi, mỗi kỷ niệm ta cùng nhau giữ, đều trở thành dấu ấn không thể phai mờ.",
      "Em chính là bản nhạc đẹp nhất, vang lên trong từng nhịp đập trái tim anh.",
    ],
  },
  {
    image: "/img/homestories/9.jpg",
    title: "Lời hẹn ước ngọt ngào",
    content: [
      "Anh hứa sẽ luôn ở đây, lắng nghe, chở che và yêu em bằng tất cả trái tim.",
      "Dù năm tháng đổi thay, tình yêu này vẫn sẽ nguyên vẹn dành cho riêng em.",
    ],
  },
  {
    image: "/img/homestories/10.jpg",
    title: "Mãi mãi là em",
    content: [
      "Trong hàng tỷ con người, chỉ có em là duy nhất với anh.",
      "Nếu được chọn lại một lần nữa, anh vẫn sẽ chọn em, chọn tình yêu này, chọn hạnh phúc của đôi ta.",
    ],
  },
];

export const dataLoveTimelineHome: ILoveTimeline[] = [
  {
    id: 1,
    date: new Date("2024-10-01"),
    title: "Ngày đầu tiên nhắn tin tiếp cận em",
    description:
      "Khoảnh khắc anh lấy hết can đảm để nhắn cho em dòng tin đầu tiên. Từ giây phút ấy, mọi thứ đã thay đổi, và anh bắt đầu mong chờ được ở gần em hơn.",
    icon: LoveType.MEET_DAY,
  },
  {
    id: 2,
    date: new Date("2024-12-08"),
    title: "Ngày tỏ tình em",
    description:
      "Ngày anh nói lời yêu, trái tim hồi hộp xen lẫn hạnh phúc. Khoảnh khắc ấy trở thành một kỷ niệm không bao giờ phai trong tim anh. ",
    icon: LoveType.MEET_DAY,
  },
  {
    id: 3,
    date: dayjs().toDate(),
    title: "Chặng đường yêu thương",
    description:
      "Từ ngày ấy đến hôm nay, tình yêu của chúng ta lớn dần, vững chắc và đầy ắp những kỷ niệm. Mỗi ngày trôi qua, anh càng trân trọng em nhiều hơn và mong rằng ta sẽ cùng nhau viết tiếp những chương mới.",
    icon: LoveType.ANNIVERSARY,
  },
];

export const dataLoveBlogsHome: ILoveBlog[] = [
  {
    id: 1,
    images: ["/img/blog/ngaydautiengapem/1-1.jpg"],
    title: "Ngày đầu tiên gặp em",
    details: [
      {
        id: 1,
        title: "Khoảnh khắc định mệnh",
        description:
          "Ngày ấy, giữa muôn vàn gương mặt, ánh mắt em bất chợt chạm vào anh. Tim anh khẽ rung lên, và từ giây phút ấy, anh biết rằng cuộc đời mình đã sang một trang mới.",
      },
    ],
    createdAt: new Date("2024-10-01"),
    type: LoveType.MEET_DAY,
  },
  {
    id: 2,
    images: ["/img/blog/ngayngoloiyeuem/20-1.jpg"],
    title: "Ngày ngỏ lời yêu em",
    details: [
      {
        id: 1,
        title: "Lời nói từ trái tim",
        description:
          "Anh đã lấy hết can đảm để nói lời yêu thương. Giây phút ấy, thế giới như ngừng lại, chỉ còn lại nhịp đập của hai con tim cùng hòa chung một giai điệu.",
      },
    ],
    createdAt: new Date("2024-12-08"),
    type: LoveType.SURPRISE,
  },
  {
    id: 3,
    images: ["/img/blog/chuyendulichdautien/27-1.jpg"],
    title: "Chuyến du lịch đầu tiên",
    details: [
      {
        id: 1,
        title: "Kỷ niệm khó quên",
        description:
          "Đó không chỉ là một chuyến đi, mà là hành trình lưu giữ tiếng cười, những cái nắm tay thật chặt, và những kỷ niệm khiến ta nhớ mãi về nhau.",
      },
    ],
    createdAt: new Date("2025-02-20"),
    type: LoveType.TRAVEL,
  },
  {
    id: 4,
    images: ["/img/blog/landaudontetxanhau/q-11.jpg"],
    title: "Lần đầu đón Tết xa nhau",
    details: [
      {
        id: 1,
        title: "Những ngày xa",
        description:
          "Dù không thể bên nhau trong ngày Tết, nhưng từng lời chúc, từng tin nhắn yêu thương vẫn khiến khoảng cách trở nên thật nhỏ bé.",
      },
    ],
    createdAt: new Date("2025-02-01"),
    type: LoveType.ANNIVERSARY,
  },
  {
    id: 5,
    images: ["/img/blog/changduongyeuthuonghiennay/26-3.jpg"],
    title: "Chặng đường yêu thương hiện nay",
    details: [
      {
        id: 1,
        title: "Hành trình đã qua",
        description:
          "Nhìn lại những ngày đầu bỡ ngỡ, những khoảnh khắc ngọt ngào và cả những khó khăn đã cùng nhau vượt qua, ta càng thấy tình yêu này thêm bền chặt.",
      },
    ],
    createdAt: new Date(),
    type: LoveType.SURPRISE,
  },
];

export const dataPlaylistHome: IPlaylist[] = [
  {
    id: 1,
    title: "Kỷ niệm ngọt ngào",
    description: "Những bài hát ghi dấu từng khoảnh khắc yêu thương.",
    coverImage: "/img/playlist/1/anhchinh.jpg",
    images: [
      "/img/playlist1-1.jpg",
      "/img/playlist1-2.jpg",
      "/img/playlist1-3.jpg",
    ],
    song: {
      title: "Nơi này có anh",
      artist: "Sơn Tùng M-TP",
      url: "/music/song1.mp3",
      duration: "03:45",
    },
  },
  {
    id: 2,
    title: "Chuyện tình chúng ta",
    description: "Mỗi bài hát là một chương trong câu chuyện tình yêu.",
    coverImage: "/img/playlist/2/anhchinh.jpg",
    images: ["/img/playlist2-1.jpg", "/img/playlist2-2.jpg"],
    song: {
      title: "Vì anh đâu có biết",
      artist: "Madihu",
      url: "/music/song2.mp3",
      duration: "03:30",
    },
  },
  {
    id: 3,
    title: "Giai điệu hạnh phúc",
    description: "Âm nhạc mang đến sự vui vẻ, ấm áp bên nhau.",
    coverImage: "/img/playlist/3/anhchinh.png",
    images: ["/img/playlist3-1.jpg", "/img/playlist3-2.jpg"],
    song: {
      title: "Ánh nắng của anh",
      artist: "Đức Phúc",
      url: "/music/song3.mp3",
      duration: "04:15",
    },
  },
];

export const dataMiniGameHome: IMiniGame = {
  id: 1,
  title: "Memory đôi ta",
  description: "Lật thẻ tìm cặp ảnh của chúng mình.",
  image: "/img/minigames/backgrHome.png",
};

export const dataQuizHome: IQuiz[] = [
  {
    id: 1,
    title: "Quiz: Chúng mình hiểu nhau cỡ nào?",
    description: "10 câu hỏi nhanh, điểm ngay!",
    image: "/img/quiz/quiz1.jpg",
  },
  {
    id: 2,
    title: "True/False Love",
    description: "Đúng – sai chuyện tụi mình, chọn nhanh trong 5 giây!",
    image: "/img/quiz/quiz2.jpg",
  },
  {
    id: 3,
    title: "Tính cách ‘hợp gu’",
    description: "Khám phá gu tình yêu của hai đứa.",
    image: "/img/quiz/quiz3.jpg",
  },
  {
    id: 4,
    title: "Kỷ niệm đáng nhớ",
    description: "Thử xem ai nhớ kỷ niệm chung nhiều hơn!",
    image: "/img/quiz/quiz4.jpg",
  },
];
