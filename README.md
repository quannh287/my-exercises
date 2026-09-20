# Lịch tập

Web app cá nhân, dùng trên điện thoại: đặt lịch tập lặp theo thứ trong tuần, chọn bài từ thư viện 1500 bài có GIF hướng dẫn, đặt số set / rep / thời gian nghỉ, rồi bấm **Bắt đầu** để app dẫn qua từng set và ghi vào lịch sử.

Cài lên màn hình chính như app (PWA). Không đăng nhập, không server.

**Bản deploy:** https://my-exercises-gamma.vercel.app/

## Tech stack

| Lớp | Dùng gì |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript strict |
| UI | Tailwind CSS v4 (`@theme` trong `app/globals.css`, không có `tailwind.config`) |
| Dữ liệu | JSON tĩnh trong `public/data/` (dump lúc build) + `localStorage` cho dữ liệu người dùng |
| Offline | Service worker `public/sw.js`: cache-first cho `/data/` và GIF từ CDN |
| Nhắc lịch | Notification API + `registration.showNotification`, hẹn giờ ngay trong trang — không có push server |
| Hạ tầng | Vercel, build lại mỗi lần push `main`. Không database, không route handler |

## Chạy

```bash
pnpm install
pnpm data:fetch   # BẮT BUỘC trước lần chạy đầu — mất ~1 phút, tải 1500 bài về public/data/
pnpm dev          # http://localhost:3000
```

Lệnh khác: `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test`.

## Ghi dữ liệu ở đâu

Toàn bộ dữ liệu người dùng nằm trong **localStorage** của đúng trình duyệt đó:

| Key | Nội dung |
|---|---|
| `workout.v1` | `{ schedule, logs, reminder }` — lịch tuần, lịch sử buổi tập, thiết lập nhắc giờ |
| `workout.reminder.fired` | ngày (local) đã bắn nhắc gần nhất, để không nhắc trùng trong ngày |

Không đồng bộ, không backup tự động. Đổi máy hay xoá site data là mất sạch — backup bằng **tab Tôi → Xuất dữ liệu (JSON)**, rồi Nhập lại ở máy mới.

Dữ liệu bài tập đi đường khác: `scripts/fetch-exercises.mjs` dump từ API ExerciseDB ra `public/data/` lúc build (`prebuild`), `public/data/vi.json` giữ bản dịch tiếng Việt dạng `tiếng Anh → tiếng Việt`. GIF không mirror vào repo, tải thẳng từ CDN và được service worker cache lại.

## Bản quyền

- **Code**: dự án cá nhân của [quannh287](https://github.com/quannh287), chưa gắn giấy phép mã nguồn mở — mặc định giữ toàn quyền.
- **Dữ liệu bài tập, mô tả, GIF**: thuộc về [ExerciseDB](https://oss.exercisedb.dev/docs). Dùng cho mục đích thương mại phải theo điều khoản của họ.
- **Bản dịch tiếng Việt** trong `public/data/vi.json` là tác phẩm phái sinh từ nội dung ExerciseDB.
- Font Nunito Sans, Literata, Geist Mono qua `next/font` — SIL Open Font License.
