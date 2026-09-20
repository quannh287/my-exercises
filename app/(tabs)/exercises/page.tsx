import { AppBar } from "@/components/ui/AppBar";
import { ExerciseBrowser } from "@/components/ExerciseBrowser";

export default function ExercisesPage() {
  return (
    <main className="mx-auto max-w-lg pb-8">
      <AppBar title="Bài tập" />
      <ExerciseBrowser />
    </main>
  );
}
