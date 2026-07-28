export type TapeId = "001" | "002" | "003" | "004" | "005" | "006" | "007";

export interface Tape {
  id: TapeId;
  tapeNo: string;
  title: string;
  labelTitle: string;
  status: "available" | "locked";
  type: string;
  episode: string;
  synopsis: string[];
  cover: string;
  video: string;
}

export const tapes: Tape[] = [
  {
    id: "001",
    tapeNo: "TAPE 001",
    title: "丹港风云录 001",
    labelTitle: "丹港风云录",
    status: "available",
    type: "架空 / 犯罪 / 剧情",
    episode: "系列第一部",
    synopsis: [
      "未来架空的丹港市，表面繁荣之下暗流涌动。",
      "新人警探与搭档深入调查一系列离奇案件，",
      "逐步揭开城市背后隐藏的真相与巨大阴谋。",
    ],
    cover: "/assets/danhabor-001-cover.jpg",
    video: "/assets/danhabor-001.mp4",
  },
  {
    id: "002",
    tapeNo: "TAPE 002",
    title: "未命名案件 002",
    labelTitle: "未命名案件",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
  {
    id: "003",
    tapeNo: "TAPE 003",
    title: "夜雨追踪 003",
    labelTitle: "夜雨追踪",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
  {
    id: "004",
    tapeNo: "TAPE 004",
    title: "绣蚀之城 004",
    labelTitle: "绣蚀之城",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
  {
    id: "005",
    tapeNo: "TAPE 005",
    title: "边缘证词 005",
    labelTitle: "边缘证词",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
  {
    id: "006",
    tapeNo: "TAPE 006",
    title: "沉默代码 006",
    labelTitle: "沉默代码",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
  {
    id: "007",
    tapeNo: "TAPE 007",
    title: "黑洲迷雾 007",
    labelTitle: "黑洲迷雾",
    status: "locked",
    type: "档案封存",
    episode: "未开放",
    synopsis: ["该录像尚未开放调取。"],
    cover: "",
    video: "",
  },
];

export const archivePanels = {
  case: {
    title: "CASE FILE",
    subtitle: "案件档案",
    body: [
      "管控物资违规流转案：丹港海关扣押记录出现多处消失的编号，线索指向临港仓储区与数个临时登记公司。",
      "815 航班危机：一架夜间返港客机在最终进近阶段失去识别信号，地面单位接到互相矛盾的指令来源。",
    ],
  },
  character: {
    title: "CHARACTER",
    subtitle: "角色图鉴",
    body: [
      "周天明：丹港警务处新人警探，擅长从普通程序错误中追出隐藏的人为痕迹。",
      "伊嘉琪：长期处理边境资料与口岸证词，冷静、锋利，对丹港地下秩序有自己的判断。",
    ],
  },
  world: {
    title: "WORLD",
    subtitle: "世界观设定",
    body: [
      "丹芷是一座多方秩序交汇的中立橱窗港口城市，表面以贸易、金融和电视工业维持繁荣。",
      "城市真正的边界不在海岸线上，而在档案、证词、广播频率和通行许可之间。",
    ],
  },
  behind: {
    title: "BEHIND",
    subtitle: "幕后制作",
    body: [
      "制作工具：个人手稿、Gemini、ChatGPT、Seedance 2.0、即梦、UpDream、Suno。",
      "流程：世界观整理、角色草图、静态设定、镜头生成、音乐与音效、字幕剪辑。制作周期约 5 天，每天 4-6 小时。",
    ],
  },
} as const;

export type ArchivePanelId = keyof typeof archivePanels;
