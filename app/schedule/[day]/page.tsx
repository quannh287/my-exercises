import { DayEditor } from "./DayEditor";
import { WEEK_DAYS, type WeekDay } from "@/lib/types";

export function generateStaticParams() {
  return WEEK_DAYS.map((day) => ({ day }));
}

export default async function Page({ params }: PageProps<"/schedule/[day]">) {
  const { day } = await params;
  return <DayEditor dayKey={day as WeekDay} />;
}
