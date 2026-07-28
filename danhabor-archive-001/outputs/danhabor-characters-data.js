window.DANHABOR_CHARACTER_DEFAULTS = [
  {
    id: "lin-haining",
    name: "林海宁",
    foreignName: "LIN HAINING",
    avatar: "",
    passportCover: "./danhabor-passport-cover.png",
    visaPageImage: "./danhabor-passport-visa-page.png",
    passportPhoto: "",
    gender: "女 / F",
    birthDate: "15.07.1964",
    birthPlace: "丹港 / DANGANG",
    nationality: "丹港特别行政区",
    region: "中立共管区",
    occupation: "档案修复与历史影像研究员",
    passportNumber: "DG 4721857",
    issueDate: "21.04.1986",
    expiryDate: "20.04.1991",
    machineReadableCode: "P<DGCLIN<<HAINING<<<<<<<<<<<<<<<<<<<<<<\nDG47218575DG6407158F9104202<<<<<<<<<<08",
    summary: "顾水遥，生于七十年代末的南方城市，成长于变革与探索交织的年代。长期致力于城市记忆与近现代史研究，足迹遍布多地，在学术与现实之间不断寻找连接点。",
    experience: "擅长从碎片化记忆与历史影像中提炼线索，拥有出色的分析与重构能力。曾参与多个城市记忆与档案整理项目，涉及记录修复、口述史采集与跨机构资料整合，具备丰富的实地调查经验。",
    organizations: ["丹港影像修复室", "城市记忆研究组", "联合档案委员会"],
    timeline: [
      { date: "2018.06", text: "加入丹港行政管理局人物局，担任研究员" },
      { date: "2020.11", text: "参与南港工业带口述史计划与档案整理" },
      { date: "2022.04", text: "赴南城地区执行档案修复与调研任务" },
      { date: "2023.09", text: "协助处理潮城记忆数据异常事件" }
    ],
    stamps: [
      { place: "北丹港入境", date: "1987-05-16", tone: "red" },
      { place: "南洋民主共和国", date: "1987-05-18", tone: "blue" },
      { place: "中立区过境", date: "1987-05-20", tone: "violet" },
      { place: "南海利亚州", date: "1987-05-23", tone: "green" },
      { place: "马桥国际空港", date: "1987-05-25", tone: "blue" },
      { place: "北丹港离境", date: "1987-05-29", tone: "red" }
    ],
    gallery: [
      { src: "../public/assets/danhabor-001-cover.jpg", title: "丹港夜间城市旧照", year: "1989", caption: "修复自DNYTV1未编目影像带。" },
      { src: "../outputs/danhabor-ui-reference.png", title: "影像档案室工作台", year: "1990", caption: "档案编号与原始记录存在偏差。" }
    ],
    relatedObjects: [
      { title: "城市旧照", note: "边缘有重复曝光痕迹" },
      { title: "研究笔记摘录", note: "夹有三张跨区通行证" },
      { title: "访谈记录卡", note: "第17页被人为撕除" }
    ],
    relatedCharacters: ["zhou-tianming", "yi-jiaqi"],
    customPaperSections: [
      { id: "field-note", title: "现场记录", icon: "FIELD NOTE", body: "受访者多次将同一段影像描述为不同年份。现有时间码可能经过二次覆盖。", visible: true, clickable: true }
    ],
    theme: { accent: "#a56c2c", stamp: "#31576b" }
  },
  {
    id: "zhou-tianming",
    name: "周天明",
    foreignName: "ZHOU TIANMING",
    avatar: "",
    passportCover: "./danhabor-passport-cover.png",
    visaPageImage: "",
    passportPhoto: "",
    gender: "男 / M",
    birthDate: "08.11.1962",
    birthPlace: "南洋民主共和国海龙市",
    nationality: "南洋民主共和国",
    region: "北丹港特别广域市",
    occupation: "丹港警务处刑事调查员",
    passportNumber: "NP 0186214",
    issueDate: "02.09.1988",
    expiryDate: "01.09.1993",
    machineReadableCode: "P<NPZHOU<<TIANMING<<<<<<<<<<<<<<<<<<<<\nNP01862146NP6211087M9309011<<<<<<<<<<02",
    summary: "丹港警务处新调任调查员。相信程序能够保护真相，却逐渐发现程序本身正成为掩盖真相的工具。",
    experience: "警校毕业后曾参与空港治安与跨区证件核验，因在一次航班危机中识别出伪造调令被调入刑事调查组。擅长从日常流程中的异常细节追查人为痕迹。",
    organizations: ["丹港警务处", "联合行动协调中心", "空港治安联络组"],
    timeline: [
      { date: "1985.07", text: "南洋警校毕业，进入空港治安部门" },
      { date: "1987.12", text: "参与WXP-815航班危机处置" },
      { date: "1989.03", text: "调任丹港警务处刑事调查组" },
      { date: "1990.04", text: "接触未命名录像带案件" }
    ],
    stamps: [
      { place: "北丹港常驻", date: "1989-03-02", tone: "red" },
      { place: "马桥空港公务", date: "1989-08-21", tone: "blue" },
      { place: "中立区调查许可", date: "1990-04-18", tone: "violet" }
    ],
    gallery: [
      { src: "../public/assets/danhabor-001-cover.jpg", title: "马桥空港外勤记录", year: "1990", caption: "摄于联合检查区封锁线外。" }
    ],
    relatedObjects: [
      { title: "警务证件", note: "签发日期被重新覆盖" },
      { title: "航班旅客名单", note: "缺失第14号座位记录" }
    ],
    relatedCharacters: ["lin-haining", "yi-jiaqi"],
    customPaperSections: [
      { id: "case-note", title: "案件附注", icon: "CASE NOTE", body: "调查对象与DNYTV1录像带调用记录出现三次交叉。", visible: true, clickable: true }
    ],
    theme: { accent: "#8e4d35", stamp: "#284f68" }
  },
  {
    id: "yi-jiaqi",
    name: "伊嘉琪",
    foreignName: "YI JIAQI",
    avatar: "",
    passportCover: "./danhabor-passport-cover.png",
    visaPageImage: "",
    passportPhoto: "",
    gender: "女 / F",
    birthDate: "26.02.1965",
    birthPlace: "南丹港",
    nationality: "约克邦联海外大区",
    region: "南海利亚州",
    occupation: "边境资料调查员",
    passportNumber: "YC 9021765",
    issueDate: "12.01.1989",
    expiryDate: "11.01.1994",
    machineReadableCode: "P<YCYI<<JIAQI<<<<<<<<<<<<<<<<<<<<<<<<\nYC90217653YC6502269F9401118<<<<<<<<<<04",
    summary: "长期处理口岸资料与跨区证词。冷静、锋利，对丹港地下秩序与三方机构之间的默契有自己的判断。",
    experience: "曾在港务、边境审查和外侨资料部门轮调。熟悉三方法域互不兼容的证件体系，能够从印章、纸张与编号规律识别伪造记录。",
    organizations: ["南丹港边境事务局", "联合检察官办公室"],
    timeline: [
      { date: "1986.08", text: "进入南丹港边境事务局" },
      { date: "1988.02", text: "参与跨区证件标准化项目" },
      { date: "1989.11", text: "调任联合资料核验小组" },
      { date: "1990.04", text: "接手录像带来源追踪" }
    ],
    stamps: [
      { place: "南丹港公务", date: "1989-01-12", tone: "green" },
      { place: "中立区特别许可", date: "1989-11-06", tone: "violet" },
      { place: "北丹港临时入境", date: "1990-04-20", tone: "red" }
    ],
    gallery: [
      { src: "../outputs/danhabor-ui-reference.png", title: "边境资料核验台", year: "1990", caption: "原件右下角有被裁切的编号。" }
    ],
    relatedObjects: [
      { title: "跨区印章样本", note: "含两枚未登记版式" },
      { title: "口岸值班记录", note: "时间与电视台记录重叠" }
    ],
    relatedCharacters: ["zhou-tianming", "lin-haining"],
    customPaperSections: [
      { id: "border-note", title: "核验结论", icon: "VERIFY", body: "纸张、油墨与编号均真实，但签发机构在对应日期并不存在。", visible: true, clickable: true }
    ],
    theme: { accent: "#476576", stamp: "#824c3d" }
  }
];
