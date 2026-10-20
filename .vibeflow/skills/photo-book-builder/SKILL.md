---
name: photo-book-builder
description: Build the "Wish Book / Cuốn Sổ Lời Chúc" website — a digital notebook where page 1 is an envelope that opens to reveal a wish card, and pages 2–5 hold photos (2 per page, max 5 pages total), with creator/recipient accounts, client-side photo cropping, ZIP + PDF export and ZIP restore. Use whenever the user asks to build this wish book / greeting book / photo album / sổ lời chúc / sổ lưu niệm / thiệp lời chúc website, even when described loosely (envelope that opens to a message, a notebook with photo pages, a shared album with roles, gift book with photos, etc.).
---

# Photo Book Builder — "Cuốn Sổ Lời Chúc"

Build a complete, beautiful wish-book website. The design, data model, API contract and
acceptance criteria are already fully specified — follow them exactly, do not redesign.

## Đọc trước khi build (bắt buộc)

- `docs/SPEC.md` — đặc tả: vai trò, phân quyền, data model, API contract, ràng buộc, tiêu chí nghiệm thu.
- `docs/DESIGN.md` — thiết kế UI/UX: palette, typography, từng màn hình, animation, checklist chất lượng.
- `docs/PLAN.md` — các phase build kèm thời gian, thực hiện đúng thứ tự.

## Tóm tắt sản phẩm

- Sổ lời chúc dạng cuốn vở số: **Trang 1 = phong bì + thiệp lời chúc**, **Trang 2–5 = trang ảnh** (mỗi trang tối đa 2 ảnh, tổng tối đa 5 trang).
- 2 vai trò: **Creator** (tạo sổ, viết lời chúc, quản lý trang, xóa mọi ảnh, chia sẻ, tải/khôi phục) và **Recipient** (vào qua link chia sẻ, xem, upload ảnh, chỉ xóa ảnh mình upload).
- **Download**: ZIP (backup, import lại được) + PDF (xem/in). **Upload**: khôi phục từ ZIP → luôn tạo sổ mới.
- Upload ảnh có **modal cắt ảnh** (drag + zoom + chọn tỷ lệ) trước khi lưu.

## Quyết định công nghệ (GIỮ NGUYÊN, không đổi)

- **Frontend**: React 18 + Vite + Tailwind CSS + react-router-dom + react-easy-crop + axios.
- **Backend**: Express + better-sqlite3 + multer + sharp + bcryptjs + jsonwebtoken (httpOnly cookie) + cookie-parser + adm-zip + pdfkit.
- **Một server duy nhất**: Express serve API `/api` + phục vụ `client/dist` (bản build) + `/uploads` static.
- Fonts: **Dancing Script** (handwriting) + **Be Vietnam Pro** (body) — Google Fonts, subset `vietnamese`.
- Dev: Vite proxy `/api` → `http://localhost:3000`. Production: build client → server serve dist.

## Cấu trúc thư mục

```
client/   # React + Vite + Tailwind
server/   # Express (index.js, db.js, routes/, middleware/, uploads/)
```

## Phase build

Thực hiện theo `docs/PLAN.md`. Tóm tắt:

1. **Scaffold** — tạo client/server, cài deps, Tailwind palette + fonts (DESIGN §2).
2. **Backend** — DB schema (SPEC §5), auth (JWT cookie), books/wish/pages/photos CRUD với phân quyền, export ZIP/PDF, import ZIP. Test API bằng curl.
3. **Frontend core** — router (`/`, `/books`, `/books/:id`, `/b/:code`), AuthContext, danh sách sổ, khung sổ + điều hướng trang, toolbar theo vai trò.
4. **Phong bì + thiệp** — Envelope/WishCard + animation mở, modal viết lời chúc.
5. **Ảnh + cắt** — PhotoSlot polaroid, Lightbox, CropModal (react-easy-crop → canvas → upload), xóa theo quyền.
6. **Export/Import** — dropdown tải ZIP/PDF, khôi phục ZIP.
7. **Hoàn thiện** — checklist DESIGN §7, build, chạy preview, test toàn bộ luồng.

## Quy tắc phân quyền (KHÔNG được sai)

Kiểm tra **ở server** (không tin client). Với mỗi request, xác định vai trò của user với sổ:

| Hành động | Creator | Recipient |
|---|---|---|
| Xem sổ | ✅ | ✅ |
| Sửa lời chúc | ✅ | ❌ |
| Tạo/xóa trang ảnh | ✅ | ❌ |
| Upload ảnh | ✅ | ✅ |
| Xóa ảnh của mình | ✅ | ✅ |
| Xóa ảnh người khác | ✅ | ❌ |
| Xóa sổ | ✅ | ❌ |
| Tải ZIP/PDF | ✅ | ✅ |
| Import ZIP | ✅ | ❌ |

- Recipient được xác định qua bảng `book_recipients` (tự gắn khi mở `/b/:code`).
- 403 khi vi phạm; 404 khi sổ không tồn tại hoặc không có quyền xem.
- Frontend **ẩn** nút không được phép (không chỉ disable).

## Ràng buộc nghiệp vụ (bắt buộc)

1. Tối đa **5 trang/sổ**: trang 1 (thiệp) + 4 trang ảnh (`page_number` 2–5). Tạo trang khi đủ → 403.
2. Tối đa **2 ảnh/trang**. Upload khi đầy → 403.
3. `share_code`: 8 ký tự ngẫu nhiên (a–z A–Z 0–9), unique.
4. Import ZIP luôn **tạo sổ mới** (không ghi đè).
5. Xóa sổ/trang/ảnh → xóa cả file ảnh trên đĩa (`fs.unlink`, bỏ qua nếu thiếu).
6. Ảnh: whitelist `jpeg/png/webp/gif`, ≤ 10MB; server resize bằng sharp (max 1920px cạnh dài, JPEG q82); tên file `<uuid>.jpg`.

## API contract (tóm tắt — chi tiết ở SPEC §6)

```
POST   /api/auth/register        {username, password, displayName}
POST   /api/auth/login           {username, password}
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/books                {title}
GET    /api/books                                    → [{book, role}]
GET    /api/books/:id                                → {book, pages[], role}
GET    /api/books/by-code/:code                      → {book, pages[], role} (tự gắn recipient)
PUT    /api/books/:id            {title}
DELETE /api/books/:id
PUT    /api/books/:id/wish       {wishTitle, wishMessage, envelopeStyle, coverStyle}
POST   /api/books/:id/pages                          → {page} (tự tăng page_number)
DELETE /api/books/:id/pages/:pageId
POST   /api/pages/:pageId/photos  (multipart file)  → {photo}
DELETE /api/photos/:photoId
GET    /api/books/:id/export/zip                     → application/zip
GET    /api/books/:id/export/pdf                     → application/pdf
POST   /api/books/:id/import     (multipart zip)     → {book} (sổ mới)
```

`pages[]` mỗi phần tử: `{id, pageNumber, photos: [{id, url, uploadedBy, uploadedByName, canDelete}]}`.
`canDelete` = (role === 'creator' || photo.uploadedBy === user.id) — tính ở server.

## UI/UX bắt buộc (tóm tắt — chi tiết ở DESIGN.md)

- Nền giấy kem `#FAF6EE`, chữ nâu ấm `#4A3F35`; phong bì 4 màu: rose/kraft/sky/sage.
- Tiêu đề & lời chúc font **Dancing Script**; thân font **Be Vietnam Pro** (đủ dấu tiếng Việt).
- Khung sổ: nền giấy, bo góc, bóng mềm, **lò xo xoắn bên trái**.
- Desktop (≥1024px) hiển thị spread 2 trang; mobile 1 trang/lần; điều hướng ◀ ▶ + chấm tròn.
- Phong bì: bấm → nắp xoay lên (`rotateX(180deg)`, origin top, 600ms) → thiệp trượt lên (`translateY(-140px)`) → phóng to. Nút "Mở lại" để reset.
- Ảnh kiểu **polaroid**: viền trắng dày, nghiêng nhẹ (±1.5°), bóng đổ; hover → overlay 🔍 (lightbox) + 🗑️ (nếu `canDelete`).
- CropModal: react-easy-crop, slider zoom, tỷ lệ `Tự do/1:1/4:3/3:4`, nút "Cắt & Lưu".
- Toast cho mọi thành công/lỗi; modal xác nhận trước mọi xóa.
- Toàn bộ UI **tiếng Việt**.

## Kiểm thử & nghiệm thu

Sau khi build xong, chạy preview (skill `app-preview`) và kiểm thử bằng Playwright:

1. Đăng ký user A → tạo sổ → viết lời chúc → đổi màu phong bì → mở phong bì.
2. Thêm trang đến đủ 5 → nút thêm trang ẩn; thêm ảnh (cắt) đến đủ 2/trang.
3. Chia sẻ link → đăng xuất → đăng ký user B → mở link → vào sổ, upload ảnh, xóa ảnh của mình.
4. User B KHÔNG thấy nút: viết lời chúc, thêm trang, xóa trang, xóa sổ; không xóa được ảnh của A.
5. Tải ZIP → import bằng user A → sổ mới đủ dữ liệu. Tải PDF → mở xem được.
6. Xóa sổ → dữ liệu và file ảnh sạch.
7. Refresh trang → phiên đăng nhập còn; không lỗi console; responsive 375px & 1440px.

## Pitfalls

- **Quên `PRAGMA foreign_keys = ON`** → cascade xóa không chạy, để lại dữ liệu mồ côi.
- **Tin client về quyền** → phải kiểm tra role ở mọi endpoint (đặc biệt delete photo, upload).
- **Multer + sharp**: validate mimetype bằng `sharp.metadata()` (magic bytes), không chỉ `file.mimetype`.
- **react-easy-crop** cần ảnh đã load (`Image` object) trước khi render; xuất ảnh bằng canvas `toBlob`.
- **Cookie JWT**: đặt `httpOnly`, `sameSite: 'lax'`, `secure: false` ở dev; đọc qua `cookie-parser`.
- **Serve SPA**: route `/books`, `/b/:code` phải fallback về `index.html` (không để Express 404).
- **ZIP import**: dùng `adm-zip` đọc `book.json` + `photos/`; validate key bắt buộc trước khi insert; tên file trong ZIP phải là tên file đã lưu (không dùng path của user).
- **pdfkit**: gọi `doc.end()` đúng lúc, stream về response; xử lý ảnh thiếu file (skip + placeholder).
- **Font tiếng Việt**: bắt buộc subset `vietnamese` trong Google Fonts link, nếu không dấu tiếng Việt bị vỡ.
- **Spread 2 trang**: trang hiện tại + trang kế; trang cuối (5) hiển thị 1 mình, không để ô trống.
- Không over-engineer: giữ code tối giản, không thêm tính năng ngoài spec.