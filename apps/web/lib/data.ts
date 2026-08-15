export type ElementKey = "金" | "木" | "水" | "火" | "土";

export type Crystal = {
  id: string;
  name: string;
  element: ElementKey;
  image: string;
};

export const elementMascots: Record<ElementKey, string> = {
  金: "/assets/ip/ip-metal.png",
  木: "/assets/ip/ip-wood.png",
  水: "/assets/ip/ip-water.png",
  火: "/assets/ip/ip-fire.png",
  土: "/assets/ip/ip-earth.png",
};

export const catalog: Record<ElementKey, Crystal[]> = {
  金: [
    ["白水晶", "01_白水晶.png"], ["白幽灵", "02_白幽灵.png"], ["银曜石", "03_银曜石.png"],
    ["白阿塞", "04_白阿塞.png"], ["雪花幽灵", "05_雪花幽灵.png"], ["白月光", "06_白月光.png"],
  ].map(([name, file], index) => ({ id: `metal-${index}`, name, element: "金", image: `/assets/crystals/01_金_白色无色银色系/${file}` })),
  土: [
    ["黄水晶", "01_黄水晶.png"], ["金发晶", "02_金发晶.png"], ["金曜石", "03_金曜石.png"],
    ["黄阿塞", "04_黄阿塞.png"], ["黄兔毛", "05_黄兔毛.png"], ["蜜蜡", "06_蜜蜡.png"],
    ["黄玛瑙", "07_黄玛瑙.png"], ["铜发晶", "08_铜发晶.png"], ["虎眼石", "14_虎眼石.png"],
  ].map(([name, file], index) => ({ id: `earth-${index}`, name, element: "土", image: `/assets/crystals/02_土_黄色金色棕色系/${file}` })),
  木: [
    ["绿幽灵", "01_绿幽灵.png"], ["绿发晶", "02_绿发晶.png"], ["绿草莓", "03_绿草莓.png"],
    ["绿兔毛", "04_绿兔毛.png"], ["葡萄石", "05_葡萄石.png"], ["东陵玉", "06_东陵玉.png"],
  ].map(([name, file], index) => ({ id: `wood-${index}`, name, element: "木", image: `/assets/crystals/03_木_绿色青色系/${file}` })),
  火: [
    ["石榴石", "01_石榴石.png"], ["粉水晶", "02_粉水晶.png"], ["樱花玛瑙", "03_樱花玛瑙.png"],
    ["红玛瑙", "04_红玛瑙.png"], ["南红玛瑙", "05_南红玛瑙.png"], ["草莓晶", "06_草莓晶.png"],
    ["紫水晶", "13_紫水晶.png"], ["紫龙晶", "20_紫龙晶.png"], ["红碧玺", "23_红碧玺.png"],
  ].map(([name, file], index) => ({ id: `fire-${index}`, name, element: "火", image: `/assets/crystals/04_火_红色粉色橙红色紫色系/${file}` })),
  水: [
    ["海蓝宝", "01_海蓝宝.png"], ["黑曜石", "02_黑曜石.png"], ["蓝玉髓", "03_蓝玉髓.png"],
    ["蓝月光", "04_蓝月光.png"], ["蓝纹玛瑙", "05_蓝纹玛瑙.png"], ["蓝晶石", "06_蓝晶石.png"],
  ].map(([name, file], index) => ({ id: `water-${index}`, name, element: "水", image: `/assets/crystals/05_水_蓝色黑色深灰色系/${file}` })),
};

export const demoBazi = [
  { name: "年柱", stem: "乙", stemGod: "正官", branch: "亥", branchGod: "偏财" },
  { name: "月柱", stem: "甲", stemGod: "七杀", branch: "申", branchGod: "食神" },
  { name: "日柱", stem: "戊", stemGod: "坤造", branch: "辰", branchGod: "比肩" },
  { name: "时柱", stem: "己", stemGod: "劫财", branch: "未", branchGod: "劫财" },
];

export const clusterImages = [
  "/assets/clusters/01_深紫色.png",
  "/assets/clusters/02_黄色.png",
  "/assets/clusters/03_绿色.png",
];
