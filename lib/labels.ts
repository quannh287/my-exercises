const BODY_PART: Record<string, string> = {
  back: "Lưng",
  cardio: "Cardio",
  chest: "Ngực",
  "lower arms": "Cẳng tay",
  "lower legs": "Bắp chân",
  neck: "Cổ",
  shoulders: "Vai",
  "upper arms": "Tay trên",
  "upper legs": "Đùi",
  waist: "Core / Bụng",
};

const EQUIPMENT: Record<string, string> = {
  assisted: "Có hỗ trợ",
  band: "Dây thun",
  barbell: "Thanh đòn",
  "body weight": "Tay không",
  "bosu ball": "Bosu ball",
  cable: "Cáp",
  dumbbell: "Tạ đơn",
  "elliptical machine": "Máy elliptical",
  "ez barbell": "Thanh EZ",
  hammer: "Búa tạ",
  kettlebell: "Tạ ấm",
  "leverage machine": "Máy đòn bẩy",
  "medicine ball": "Bóng tạ",
  "olympic barbell": "Thanh Olympic",
  "resistance band": "Dây kháng lực",
  roller: "Con lăn",
  rope: "Dây thừng",
  "skierg machine": "Máy SkiErg",
  "sled machine": "Máy đẩy xe",
  "smith machine": "Máy Smith",
  "stability ball": "Bóng thăng bằng",
  "stationary bike": "Xe đạp tại chỗ",
  "stepmill machine": "Máy leo bậc",
  tire: "Lốp xe",
  "trap bar": "Thanh trap",
  "upper body ergometer": "Máy tay quay",
  weighted: "Có thêm tạ",
  "wheel roller": "Bánh xe lăn",
};

export const bodyPartLabel = (v: string) => BODY_PART[v] ?? v;
export const equipmentLabel = (v: string) => EQUIPMENT[v] ?? v;

/** Instructions arrive as "Step:1 Lie face down…" with the marker glued to the text. */
export const cleanInstruction = (v: string) => v.replace(/^Step:\d+\s*/, "");
