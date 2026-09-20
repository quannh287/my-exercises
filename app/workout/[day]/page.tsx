import { WorkoutRunner } from "./WorkoutRunner";
import { WEEK_DAYS, type WeekDay } from "@/lib/types";

export function generateStaticParams() {
  return WEEK_DAYS.map((day) => ({ day }));
}

export default async function Page({ params }: PageProps<"/workout/[day]">) {
  const { day } = await params;
  return <WorkoutRunner dayKey={day as WeekDay} />;
}
