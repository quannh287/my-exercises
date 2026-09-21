// free-exercise-db chỉ có 17 giá trị `primaryMuscles`, không có khái niệm "nhóm cơ" —
// mà cả lịch tập của app xoay quanh Block.bodyPart, nên gom tay về 7 nhóm người tập hay chia buổi.
export const MUSCLE_GROUP = {
  chest: "chest",

  lats: "back",
  "middle back": "back",
  "lower back": "back",
  traps: "back",

  shoulders: "shoulders",
  neck: "shoulders",

  biceps: "arms",
  triceps: "arms",
  forearms: "arms",

  quadriceps: "legs",
  hamstrings: "legs",
  glutes: "legs",
  adductors: "legs",
  abductors: "legs",

  calves: "calves",

  abdominals: "core",
};

export const BODY_PARTS = ["chest", "back", "shoulders", "arms", "legs", "calves", "core"];

/** Nhóm cơ của một bài, giữ thứ tự BODY_PARTS để danh sách hiển thị ổn định. */
export function groupsOf(primaryMuscles) {
  const hit = new Set(primaryMuscles.map((m) => MUSCLE_GROUP[m]).filter(Boolean));
  return BODY_PARTS.filter((g) => hit.has(g));
}
