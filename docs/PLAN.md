# Kế hoạch triển khai — "Cuốn Sổ Lời Chúc" (build trong 1–2 giờ)

> Mục tiêu: agent build xong toàn bộ trong **≤ 2 giờ**. Tổng ước lượng ~110 phút làm việc
> + buffer. Thực hiện theo đúng thứ tự phase; mỗi phase xong phải chạy thử trước khi sang
> phase kế.

---

## Chiến lược

- **Một server duy nhất** (Express) vừa phục vụ API vừa serve bản build tĩnh của frontend →
  đơn giản, dễ deploy, dễ preview.
- **SQLite** (better-sqlite3) — không cần cài database riêng.
- **JWT httpOnly cookie** — không cần session store.
- **Cắt ảnh ở client** (react-easy-crop), **resize ở server** (sharp).
- **ZIP** bằng `adm-zip`, **PDF** bằng `pdfkit`.
- Tất cả quyết định kỹ thuật đã chốt trong `docs/SPEC.md` — không đổi giữa chừng.

---

## Phase 0 — Scaffold (10 phút)

1. Tạo cấu trúc:
   ```
   /workspace
   ├── client/          # React + Vite + Tailwind
   └── server/          # Express
   ```
2. `client`: `npm create vite@latest client -- --template react` → cài `tailwindcss`,
   `react-router-dom`, `react-easy-crop`, `axios`.
3. `server`: `npm init -y` → cài `express`, `better-sqlite3`, `multer`, `sharp`,
   `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `adm-zip`, `pdfkit`, `cors`.
4. Tailwind config: thêm palette + fonts trong `docs/DESIGN.md` §2.
5. Google Fonts: `Dancing Script` + `Be Vietnam Pro` (subset `vietnamese`) vào `index.html`.
6. Vite dev proxy `/api` → `http://localhost:3000`; `server` serve `client/dist` khi tồn tại.

## Phase 1 — Backend (30 phút)

1. Khởi tạo DB (schema trong `docs/SPEC.md` §5), bật `PRAGMA foreign_keys = ON`.
2. Middleware: `requireAuth` (verify JWT), `attachUser`, error handler, `express.json`.
3. Auth: register / login / logout / me (bcryptjs + jwt, cookie 7 ngày).
4. Books: create / list (kèm role) / get / get-by-code (tự gắn recipient) / update /
   delete (xóa file ảnh).
5. Wish: `PUT /api/books/:id/wish`.
6. Pages: create (tự tìm `page_number` trống 2–5, 403 nếu đủ 4 trang) / delete (cascade
   file ảnh).
7. Photos: upload (multer + sharp resize, kiểm tra quyền + giới hạn 2 ảnh/trang) / delete
   (creator hoặc uploader).
8. Export: ZIP (book.json + photos/) · PDF (pdfkit: bìa + thiệp + trang ảnh).
9. Import: nhận ZIP, validate cấu trúc, tạo sổ mới.
10. Serve `/uploads` static. Test toàn bộ API bằng curl script trước khi sang Phase 2.

## Phase 2 — Frontend core (30 phút)

1. Router: `/` (auth) · `/books` · `/books/:id` · `/b/:code`.
2. AuthContext (user, login, register, logout, me) + ProtectedRoute.
3. Trang `/books`: grid sổ + tạo sổ + khôi phục ZIP + logout.
4. Trang xem sổ: khung sổ (lò xo, giấy kem), điều hướng trang (◀ ▶ + chấm), toolbar theo
   vai trò, spread 2 trang trên desktop.
5. Gọi API bằng axios, xử lý 401 → redirect login.

## Phase 3 — Phong bì + lời chúc (20 phút)

1. Component `Envelope` + `WishCard` (animation mở theo `docs/DESIGN.md` §3.4).
2. Modal "Viết lời chúc" (creator): tiêu đề, nội dung, chọn màu phong bì.
3. Placeholder khi chưa có lời chúc.
4. Test: mở phong bì, sửa lời chúc, đổi màu.

## Phase 4 — Ảnh + cắt (20 phút)

1. `PhotoSlot` (polaroid / placeholder) + `Lightbox`.
2. `CropModal` (react-easy-crop: drag, zoom, tỷ lệ Tự do/1:1/4:3/3:4) → canvas → upload.
3. Xóa ảnh (kiểm tra `canDelete`), toast lỗi/thành công.
4. Test: upload + cắt, đủ 2 ảnh ẩn nút, xóa ảnh theo quyền.

## Phase 5 — Export / Import (20 phút)

1. Dropdown "Tải xuống": ZIP + PDF (download qua `window.location` hoặc blob).
2. Modal "Khôi phục từ ZIP" (chỉ creator, ở trang `/books`).
3. Test: tải ZIP → import → sổ mới đầy đủ; tải PDF mở xem được.

## Phase 6 — Hoàn thiện + preview (15 phút)

1. Rà soát `docs/DESIGN.md` §7 (checklist chất lượng UI).
2. Build production: `npm run build` (client) → server serve dist.
3. Chạy preview theo skill `app-preview`, kiểm thử toàn bộ luồng bằng Playwright
   (đăng ký → tạo sổ → viết lời chúc → thêm trang → upload ảnh → mở link với tài khoản
   thứ 2 → kiểm tra phân quyền → tải ZIP/PDF).

---

## Checklist nghiệm thu (chạy cuối cùng)

- [ ] Đăng ký / đăng nhập / đăng xuất OK, phiên giữ khi refresh.
- [ ] Creator: tạo sổ, viết/sửa lời chúc, đổi màu phong bì, thêm/xóa trang (max 5),
      upload/cắt/xóa ảnh, chia sẻ, tải ZIP/PDF, import ZIP, xóa sổ.
- [ ] Recipient: mở link → đăng ký → xem, upload ảnh, xóa ảnh của mình; KHÔNG thấy nút
      sửa lời chúc / thêm trang / xóa trang / xóa sổ; không xóa được ảnh người khác.
- [ ] Giới hạn: 5 trang/sổ, 2 ảnh/trang.
- [ ] ZIP export ↔ import round-trip đúng dữ liệu.
- [ ] PDF đủ bìa + thiệp + ảnh.
- [ ] UI đúng `docs/DESIGN.md`, responsive, không lỗi console.

---

## Ước lượng thời gian

| Phase | Thời gian | Cộng dồn |
|---|---|---|
| 0. Scaffold | 10' | 10' |
| 1. Backend | 30' | 40' |
| 2. Frontend core | 30' | 70' |
| 3. Phong bì + lời chúc | 20' | 90' |
| 4. Ảnh + cắt | 20' | 110' |
| 5. Export / Import | 20' | 130' |
| 6. Hoàn thiện + preview | 15' | 145' |

Buffer 15' → tổng ~2h40' nếu mọi thứ suôn sẻ; mục tiêu nén về ≤ 2h bằng cách ghép
Phase 3+4 và giữ code tối giản (không over-engineer).