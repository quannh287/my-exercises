import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { validateStore } from "@/lib/types";

const MAX_BODY = 1024 * 1024;

const url = process.env.DATABASE_URL;
// Build trên máy chưa có env vẫn phải chạy; thiếu env thì từng request trả 503 thay vì crash cả route.
const sql = neon(url ?? "postgresql://user:pass@localhost/db");

// ponytail: tạo bảng lười mỗi lần cold start, tách ra migration khi có bảng thứ hai
let ready: Promise<unknown> | null = null;
const ensureTable = () =>
  (ready ??= sql`CREATE TABLE IF NOT EXISTS sync (
    id text PRIMARY KEY,
    version integer NOT NULL,
    data jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`.catch((err) => {
    ready = null; // lỗi mạng lúc cold start không được khoá bảng vĩnh viễn
    throw err;
  }));

// Server chỉ giữ hash: lộ database cũng không lấy được mã để đọc/ghi thay người dùng.
function rowId(req: Request): string | null {
  const code = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(code)) return null;
  return createHash("sha256").update(code).digest("hex");
}

async function handle(req: Request, run: (id: string) => Promise<Response>) {
  const id = rowId(req);
  if (!id) return Response.json({ error: "Mã đồng bộ không hợp lệ" }, { status: 401 });
  if (!url) return Response.json({ error: "Chưa cấu hình DATABASE_URL" }, { status: 503 });
  const started = Date.now();
  try {
    await ensureTable();
    return await run(id);
  } catch (err) {
    console.error("sync failed", { method: req.method, id: id.slice(0, 8), ms: Date.now() - started, err });
    return Response.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

export const GET = (req: Request) =>
  handle(req, async (id) => {
    const [row] = await sql`SELECT version, data FROM sync WHERE id = ${id}`;
    if (!row) return Response.json({ error: "Không có dữ liệu cho mã này" }, { status: 404 });
    return Response.json({ version: row.version, data: row.data });
  });

/** Ghi có điều kiện theo `version`: hai máy ghi cùng lúc thì máy chậm nhận 409 và phải gộp lại. */
export const PUT = (req: Request) =>
  handle(req, async (id) => {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return Response.json({ error: "Dữ liệu quá lớn" }, { status: 413 });
    let version: number;
    let data;
    try {
      const body = JSON.parse(raw);
      version = body.version;
      data = validateStore(body.data);
      if (!Number.isInteger(version) || version < 0) throw new Error("version");
    } catch {
      return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const json = JSON.stringify(data);
    const rows =
      version === 0
        ? await sql`INSERT INTO sync (id, version, data) VALUES (${id}, 1, ${json}::jsonb)
            ON CONFLICT (id) DO NOTHING RETURNING version`
        : await sql`UPDATE sync SET data = ${json}::jsonb, version = version + 1, updated_at = now()
            WHERE id = ${id} AND version = ${version} RETURNING version`;
    if (!rows.length) return Response.json({ error: "Dữ liệu đã đổi, cần gộp lại" }, { status: 409 });
    return Response.json({ version: rows[0].version });
  });
