import { ExerciseBrowser } from "@/components/ExerciseBrowser";

export default function ExercisesPage() {
  return (
    <main className="mx-auto max-w-lg pb-8">
      <div className="px-4 pb-1 pt-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight">Thư viện bài tập</h1>
        <p className="mt-1 text-sm text-muted">Lọc theo nhóm cơ và dụng cụ · có sẵn offline</p>
      </div>
      <ExerciseBrowser />
    </main>
  );
}
