import { ExerciseDetail } from "./ExerciseDetail";

export default async function Page({ params }: PageProps<"/exercises/[id]">) {
  const { id } = await params;
  return <ExerciseDetail id={id} />;
}
