const BODY_PART: Record<string, string> = {
  arms: "Tay",
  back: "Lưng",
  calves: "Bắp chân",
  chest: "Ngực",
  core: "Core / Bụng",
  legs: "Đùi",
  shoulders: "Vai",
};

const EQUIPMENT: Record<string, string> = {
  bands: "Dây thun",
  barbell: "Thanh đòn",
  "body only": "Tay không",
  cable: "Cáp",
  dumbbell: "Tạ đơn",
  "e-z curl bar": "Thanh EZ",
  "exercise ball": "Bóng thăng bằng",
  "foam roll": "Con lăn",
  kettlebells: "Tạ ấm",
  machine: "Máy",
  "medicine ball": "Bóng tạ",
  other: "Khác",
};

const MUSCLE: Record<string, string> = {
  abdominals: "Cơ bụng",
  abductors: "Cơ dạng",
  adductors: "Cơ khép",
  biceps: "Cơ tay trước",
  calves: "Bắp chân",
  chest: "Cơ ngực",
  forearms: "Cẳng tay",
  glutes: "Cơ mông",
  hamstrings: "Cơ đùi sau",
  lats: "Cơ xô",
  "lower back": "Thắt lưng",
  "middle back": "Lưng giữa",
  neck: "Cổ",
  quadriceps: "Cơ đùi trước",
  shoulders: "Cơ vai",
  traps: "Cơ thang",
  triceps: "Cơ tay sau",
};

const LEVEL: Record<number, string> = { 1: "Cơ bản", 2: "Trung cấp", 3: "Nâng cao" };

const BLOCK_KIND: Record<string, string> = {
  warmup: "Khởi động",
  main: "Bài chính",
  cooldown: "Giãn cơ",
};

const MECHANIC: Record<string, string> = { compound: "Đa khớp", isolation: "Cô lập" };

export const bodyPartLabel = (v: string) => BODY_PART[v] ?? v;
export const equipmentLabel = (v: string) => EQUIPMENT[v] ?? v;
export const muscleLabel = (v: string) => MUSCLE[v] ?? v;
export const levelLabel = (v: number) => LEVEL[v] ?? `Cấp ${v}`;
export const blockKindLabel = (v: string) => BLOCK_KIND[v] ?? v;
export const mechanicLabel = (v: string | null) => (v ? MECHANIC[v] ?? v : null);
