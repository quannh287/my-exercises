import { PickClient } from "./PickClient";
import { WEEK_DAYS, type WeekDay } from "@/lib/types";

export function generateStaticParams() {
  return WEEK_DAYS.map((day) => ({ day }));
}

export default async function Page({ params, searchParams }: PageProps<"/schedule/[day]/pick">) {
  const [{ day }, sp] = await Promise.all([params, searchParams]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return <PickClient dayKey={day as WeekDay} blockId={one(sp.block) ?? ""} bodyPart={one(sp.bodyPart)} />;
}
