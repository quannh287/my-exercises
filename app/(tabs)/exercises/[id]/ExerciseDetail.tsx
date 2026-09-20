"use client";

import { AppBar } from "@/components/ui/AppBar";
import { Card } from "@/components/ui/Card";
import { ExerciseGif } from "@/components/ExerciseGif";
import { bodyPartLabel, equipmentLabel } from "@/lib/labels";
import { useCatalog, useDetails } from "@/lib/useCatalog";

export function ExerciseDetail({ id }: { id: string }) {
  const { catalog, loading } = useCatalog();
  const ex = catalog?.byId.get(id);
  const details = useDetails(ex ? id : undefined);

  return (
    <main className="mx-auto max-w-lg pb-8">
      <AppBar title={ex?.nameVi ?? "Bài tập"} back="/exercises" />
      {loading ? <p className="px-4 py-10 text-center text-muted">Đang tải…</p> : null}
      {catalog && !ex ? <p className="px-4 py-10 text-center text-muted">Không tìm thấy bài này.</p> : null}

      {ex ? (
        <>
          <div className="aspect-square w-full bg-surface">
            <ExerciseGif src={ex.gifUrl} alt={ex.nameVi} size={640} />
          </div>
          <h1 className="px-4 pt-5 font-serif text-2xl font-bold">{ex.nameVi}</h1>
          <p className="ex-name px-4 pt-1 text-sm text-muted">{ex.name}</p>

          <Card className="mx-4 mt-4">
            <Meta label="Nhóm cơ" value={ex.bodyParts.map(bodyPartLabel).join(", ")} />
            <Meta label="Dụng cụ" value={ex.equipments.map(equipmentLabel).join(", ")} />
            <Meta label="Cơ chính" value={ex.targetMuscles.join(", ")} />
            {details?.secondaryMuscles.length ? <Meta label="Cơ phụ" value={details.secondaryMuscles.join(", ")} /> : null}
          </Card>

          <h2 className="px-4 pb-2 pt-7 font-serif text-base font-semibold text-ink">
            Hướng dẫn
          </h2>
          <Card className="mx-4">
            <ol className="list-inside list-decimal space-y-2 p-4 text-base leading-relaxed">
              {(details?.instructionsVi ?? []).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Card>
        </>
      ) : null}
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 px-4 py-2.5 not-last:border-b not-last:border-line/50">
      <span className="w-24 shrink-0 text-sm text-muted">{label}</span>
      <span className="flex-1 text-sm capitalize">{value}</span>
    </div>
  );
}
