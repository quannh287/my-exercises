# Lịch tập

Web app cá nhân, dùng trên điện thoại: đặt lịch tập lặp theo thứ trong tuần, chọn bài từ thư viện 873 bài có ảnh hướng dẫn và chia 3 cấp độ, xếp buổi thành khởi động / bài chính / giãn cơ, đặt số set / rep / thời gian nghỉ (hoặc số giây giữ tư thế), rồi bấm **Bắt đầu** để app dẫn qua từng set và ghi vào lịch sử.

Cài lên màn hình chính như app (PWA). Không đăng nhập, không server.

**Bản deploy:** https://my-exercises-gamma.vercel.app/

## Tech stack

| Lớp | Dùng gì |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript strict |
| UI | Tailwind CSS v4 (`@theme` trong `app/globals.css`, không có `tailwind.config`) |
| Dữ liệu | JSON tĩnh trong `public/data/` (dump lúc build) + `localStorage` cho dữ liệu người dùng |
| Offline | Service worker `public/sw.js`: cache-first cho `/data/` và ảnh bài tập từ jsdelivr |
| Nhắc lịch | Notification API + `registration.showNotification`, hẹn giờ ngay trong trang — không có push server |
| Hạ tầng | Vercel, build lại mỗi lần push `main`. Không database, không route handler |

## Chạy

```bash
pnpm install
pnpm data:fetch   # BẮT BUỘC trước lần chạy đầu — tải 873 bài về data/
pnpm dev          # http://localhost:3000
```

Lệnh khác: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test`.

## Ghi dữ liệu ở đâu

Toàn bộ dữ liệu người dùng nằm trong **localStorage** của đúng trình duyệt đó:

| Key | Nội dung |
|---|---|
| `workout.v2` | `{ schedule, logs, reminder }` — lịch tuần, lịch sử buổi tập, thiết lập nhắc giờ |
| `workout.reminder.fired` | ngày (local) đã bắn nhắc gần nhất, để không nhắc trùng trong ngày |

Không đồng bộ, không backup tự động. Đổi máy hay xoá site data là mất sạch — backup bằng **tab Tôi → Xuất dữ liệu (JSON)**, rồi Nhập lại ở máy mới.

Dữ liệu bài tập đi đường khác:

- `pnpm data:fetch` tải bundle [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) (pin theo commit) về `data/exercises.json` + `data/taxonomy.json`. `level` và `category` lấy thẳng từ nguồn, nhóm cơ gom từ `primaryMuscles` qua bảng map ở `scripts/muscle-groups.mjs`.
- `pnpm build` (qua `prebuild`) chạy `scripts/build-catalog.mjs`, tách thành `public/data/catalog.json` (danh sách) và `details.json` (hướng dẫn, chỉ tải khi mở một bài).
- Bản dịch: `pnpm data:split` sinh batch trong `.translate/`, dịch xong đặt cạnh dưới tên `*.out.json`, rồi `pnpm data:vi` gộp thành `data/vi.json`. Câu hướng dẫn chưa dịch thì rơi về tiếng Anh, không chặn build.
- Ảnh không mirror vào repo, tải thẳng từ jsdelivr và được service worker cache lại.

## Bản quyền

- **Code**: dự án cá nhân của [quannh287](https://github.com/quannh287), chưa gắn giấy phép mã nguồn mở — mặc định giữ toàn quyền.
- **Dữ liệu bài tập, mô tả, ảnh**: từ [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db), phát hành theo [Unlicense](https://unlicense.org/) (public domain) — dùng tự do, kể cả thương mại.
- **Bản dịch tiếng Việt** trong `data/vi.json` là tác phẩm phái sinh từ nội dung đó.
- Font Nunito Sans, Literata, Geist Mono qua `next/font` — SIL Open Font License.
