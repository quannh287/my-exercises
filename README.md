# Lịch tập

Web app cá nhân, dùng trên điện thoại: tự đặt lịch tập lặp theo thứ trong tuần (T2 Core, T4 Ngực, T6 Chân…), chọn bài từ thư viện 1500 bài có GIF hướng dẫn, đặt số set / rep / thời gian nghỉ. Đến ngày tập thì bấm **Bắt đầu**, app dẫn qua từng bài, từng set, tự đếm ngược lúc nghỉ, xong buổi thì ghi vào lịch sử.

Cài lên màn hình chính như app (PWA). Không cần đăng nhập, không có server.

**Bản deploy:** https://my-exercises-gamma.vercel.app/ (Vercel).

## Chạy

```bash
pnpm install
pnpm data:fetch   # BẮT BUỘC trước lần chạy đầu — mất ~1 phút
pnpm dev          # http://localhost:3000
```

`pnpm data:fetch` gọi 60 request để tải toàn bộ 1500 bài về `public/data/`. **Thiếu bước này màn "Bài tập" sẽ trắng trơn.** Thư mục `public/data/` được commit vào repo nên clone về là chạy được ngay; chỉ cần chạy lại khi muốn cập nhật dữ liệu.

Các lệnh khác: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test` (logic tiến trình buổi tập), `pnpm data:vi` (dựng lại file dịch tiếng Việt từ `.translate/`).

## Triển khai

Deploy trên **Vercel**, tự build mỗi lần push lên `main`. Không cần bước nào thêm: `public/data/` đã commit sẵn trong repo nên build trên Vercel không phải gọi ExerciseDB. Chỉ khi muốn cập nhật dữ liệu mới chạy `pnpm data:fetch` ở máy rồi commit file JSON.

## Nguồn dữ liệu

Bài tập, mô tả và GIF lấy từ **[ExerciseDB](https://oss.exercisedb.dev/docs)** (bản free, không cần API key). Xem điều khoản sử dụng của họ trước khi dùng cho mục đích thương mại.

- API: `https://oss.exercisedb.dev/api/v1` · OpenAPI spec: `https://oss.exercisedb.dev/swagger` (trang `/docs` chỉ là viewer, `/openapi.json` trả 404)
- GIF: `https://static.exercisedb.dev/media/<exerciseId>.gif` — không mirror vào repo, tải trực tiếp từ CDN và được service worker cache lại

| Endpoint | Query chính |
|---|---|
| `GET /exercises` | `name`, `bodyParts`, `targetMuscles`, `secondaryMuscles`, `equipments`, `limit`, `after`, `before` |
| `GET /exercises/search` | `search`, `threshold` (0 = khớp chính xác → 1 = rất lỏng) |
| `GET /exercises/{exerciseId}` | — |
| `GET /bodyparts` · `/muscles` · `/equipments` | — (10 / 50 / 28 giá trị) |

### ⚠️ Hai cái bẫy khi phân trang

Cả hai đều **không báo lỗi**, chỉ âm thầm trả sai — đủ để mất nửa tiếng nếu tự dò:

1. **`limit` bị chặn ở 25** (mặc định 10). Truyền `limit=1500` vẫn chỉ nhận về 25 bản ghi.
2. **Con trỏ là `after=<exerciseId>`**, không phải `cursor`, không phải `offset`. Truyền sai tên thì API trả về đúng trang đầu mỗi lần → vòng lặp fetch chạy vô hạn trên cùng 25 bài.

Cách đúng: lấy `meta.nextCursor` gán vào `after` cho request kế, dừng khi `meta.hasNextPage === false`. Script `scripts/fetch-exercises.mjs` đã xử lý sẵn, kèm retry cho 429/5xx (API rate-limit khá gắt, script tự giãn nhịp).

### Bản dịch tiếng Việt

Tên bài và hướng dẫn được dịch sẵn sang tiếng Việt, lưu riêng ở `public/data/vi.json` dạng từ điển `chuỗi tiếng Anh → tiếng Việt`. File dump gốc (`exercises.json`) giữ nguyên tiếng Anh, nên chạy lại `pnpm data:fetch` không làm mất bản dịch.

Giao diện hiển thị tiếng Việt làm chính, tên tiếng Anh nhỏ bên dưới (để còn tra YouTube). Ô tìm kiếm khớp cả hai, không cần gõ dấu.

## Dữ liệu của bạn nằm ở đâu

Lịch tập và lịch sử lưu trong **localStorage** của trình duyệt, key `workout.v1`. Nghĩa là:

- Chỉ tồn tại trên đúng trình duyệt đó. Đổi máy, đổi trình duyệt, hay xoá site data là **mất sạch**.
- Không đồng bộ, không backup tự động, không có server nào giữ hộ.
- Cách duy nhất để backup hay chuyển máy: **tab Tôi → Xuất dữ liệu (JSON)**, rồi Nhập lại ở máy mới.

## Cấu trúc

```
app/               routes (App Router)
  (tabs)/          3 tab chính: Lịch, Bài tập, Tôi
  schedule/[day]/  sửa buổi tập của một thứ + màn chọn bài
  workout/[day]/   chế độ tập toàn màn hình
  history/         lịch sử buổi đã tập
components/ui/     primitives: Button, Card, ListRow, NumberStepper, Sheet, TabBar
lib/               store (localStorage), catalog loader, nhãn tiếng Việt
scripts/           dump data từ API, dựng file dịch
public/data/       JSON đã dump (commit vào repo)
```

Không có route handler hay API nội bộ nào: toàn bộ là JSON tĩnh + localStorage.

## Design system

Light-only, phỏng theo iOS. Token khai báo bằng `@theme` trong `app/globals.css` (Tailwind v4 không dùng `tailwind.config`).

| Token | Giá trị | Dùng cho |
|---|---|---|
| `bg` | `#F2F2F7` | nền trang |
| `surface` | `#FFFFFF` | card, thanh nav |
| `line` | `#E5E5EA` | viền, đường phân cách |
| `ink` / `muted` | `#000000` / `#8E8E93` | chữ chính / chữ phụ |
| `accent` | `#007AFF` | nút chính, link, trạng thái chọn |
| `danger` | `#FF3B30` | xoá, huỷ |

Quy tắc: một màu accent duy nhất, không màu thứ ba. Mọi vùng chạm ≥ 44px, nút chính cao 52px. Số liệu (set/rep/timer) dùng font mono + `tabular-nums` để không nhảy khi đếm ngược. Không viết biến thể dark.

Danh sách 1500 bài không dùng thư viện virtual list — CSS `content-visibility: auto` (class `.vrow`) đã đủ để trình duyệt bỏ qua layout/paint/decode cho các dòng ngoài màn hình. Cần Safari 18+.

## Cập nhật dữ liệu

Chạy lại `pnpm data:fetch`. Trường `fetchedAt` trong `public/data/exercises.json` cho biết bản hiện tại tải từ lúc nào. Nếu ExerciseDB thêm bài mới, chạy thêm `pnpm data:vi` sau khi bổ sung bản dịch cho phần mới.
