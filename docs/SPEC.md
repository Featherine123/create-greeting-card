# Đặc tả sản phẩm — "Cuốn Sổ Lời Chúc" (Wish Book)

> Phiên bản: 1.0 · Ngày: 2026-10-19 · Trạng thái: Approved (sẵn sàng để agent build)

---

## 1. Tổng quan

**Cuốn Sổ Lời Chúc** là một trang web mô phỏng cuốn vở / cuốn sổ lưu niệm số. Người tạo
(creator) viết lời chúc vào một **tấm thiệp nằm trong phong bì** ở trang đầu, rồi cùng
người nhận (recipient) góp ảnh kỷ niệm vào các trang ảnh phía sau.

Mỗi cuốn sổ có **tối đa 5 trang**:

| Trang | Nội dung |
|-------|----------|
| Trang 1 | Phong bì + thiệp lời chúc (cố định, không xóa được) |
| Trang 2–5 | Trang ảnh, mỗi trang chứa **tối đa 2 ảnh** |

Người dùng có thể **download** cuốn sổ (ZIP để backup/khôi phục, PDF để xem/in) và
**upload** (khôi phục từ file ZIP đã tải về).

---

## 2. Người dùng & vai trò

Hệ thống có 2 vai trò, phân biệt theo **quan hệ với từng cuốn sổ** (một người có thể là
creator của sổ này và recipient của sổ khác):

### 2.1 Người tạo (Creator)
- Đăng ký / đăng nhập tài khoản.
- Tạo cuốn sổ mới, đặt tiêu đề.
- Viết / sửa lời chúc (tiêu đề thiệp + nội dung + màu phong bì).
- Tạo / xóa trang ảnh (tối đa 4 trang ảnh).
- Upload ảnh vào bất kỳ trang nào, xóa ảnh bất kỳ (kể cả ảnh người khác upload).
- Xóa cuốn sổ.
- Chia sẻ link, tải ZIP / PDF, khôi phục từ ZIP.

### 2.2 Người nhận (Recipient)
- Truy cập qua **link chia sẻ** của cuốn sổ → đăng ký / đăng nhập → được gắn làm người
  nhận của cuốn sổ đó.
- Xem toàn bộ cuốn sổ (thiệp + ảnh).
- Upload ảnh vào các trang ảnh (tối đa 2 ảnh/trang, tổng giới hạn của sổ vẫn áp dụng).
- **Xóa ảnh do chính mình upload**.
- KHÔNG được: sửa lời chúc, tạo/xóa trang, xóa ảnh của người khác, xóa sổ, khôi phục ZIP.

### 2.3 Bảng phân quyền

| Hành động | Creator | Recipient |
|---|---|---|
| Xem sổ | ✅ | ✅ |
| Sửa lời chúc | ✅ | ❌ |
| Tạo / xóa trang ảnh | ✅ | ❌ |
| Upload ảnh | ✅ | ✅ |
| Xóa ảnh của mình | ✅ | ✅ |
| Xóa ảnh của người khác | ✅ | ❌ |
| Xóa sổ | ✅ | ❌ |
| Tải ZIP / PDF | ✅ | ✅ |
| Khôi phục từ ZIP | ✅ | ❌ |

---

## 3. Luồng sử dụng chính

### 3.1 Người tạo
1. Đăng ký / đăng nhập.
2. Nhấn **"Tạo cuốn sổ mới"** → đặt tiêu đề → vào trang xem sổ.
3. Trang 1: nhấn **"Viết lời chúc"** (biểu tượng bút chì) → mở modal → nhập tiêu đề thiệp,
   nội dung, chọn màu phong bì → lưu.
4. Nhấn **"+ Thêm trang"** để tạo trang ảnh → nhấn vào ô ảnh trống → chọn ảnh → **cắt ảnh**
   → lưu.
5. Nhấn **"Chia sẻ"** → copy link → gửi cho người nhận.
6. Nhấn **"Tải xuống"** → chọn ZIP hoặc PDF.

### 3.2 Người nhận
1. Mở link chia sẻ → nếu chưa đăng nhập thì đăng nhập/đăng ký → tự động vào sổ.
2. Xem thiệp (bấm phong bì để mở).
3. Nhấn vào ô ảnh trống → upload + cắt ảnh → ảnh xuất hiện.
4. Xóa ảnh của mình nếu muốn (chỉ ảnh mình upload).

---

## 4. Tính năng chi tiết

### 4.1 Xác thực
- Đăng ký: `username`, `password` (≥ 6 ký tự), `displayName` (tên hiển thị).
- Đăng nhập bằng username + password.
- Phiên đăng nhập: JWT trong cookie httpOnly, thời hạn 7 ngày.
- Sau khi đăng nhập, người dùng được chuyển về trang danh sách sổ (hoặc về link chia sẻ
  nếu đang mở link chia sẻ).

### 4.2 Quản lý sổ
- Danh sách sổ: hiển thị cả sổ mình **tạo** và sổ mình là **người nhận** (có badge vai trò).
- Tạo sổ: nhập tiêu đề (bắt buộc, ≤ 60 ký tự).
- Xóa sổ: modal xác nhận, xóa toàn bộ dữ liệu + file ảnh.

### 4.3 Trang thiệp (Trang 1)
- Hiển thị **phong bì** ở giữa trang. Bấm vào phong bì → nắp phong bì mở ra → **thiệp trượt
  lên** hiện lời chúc (animation CSS).
- Thiệp gồm: tiêu đề (font chữ viết tay) + nội dung lời chúc.
- Nếu chưa có lời chúc: hiển thị placeholder "Viết lời chúc đầu tiên 💌" (chỉ creator thấy
  nút viết).
- Creator có thể đổi: tiêu đề, nội dung, màu phong bì (4 màu: rose, kraft, sky, sage).
- Trạng thái phong bì (đóng/mở) lưu trên client; mỗi lần vào sổ phong bì ở trạng thái đóng.

### 4.4 Trang ảnh (Trang 2–5)
- Mỗi trang hiển thị **2 ô ảnh** (dạng khung ảnh polaroid).
- Ô trống: placeholder nét đứt + nút "+ Thêm ảnh".
- Ô có ảnh: hiển thị ảnh; hover → overlay với nút **Xem lớn** (lightbox) và **Xóa** (nếu
  được phép).
- Creator: nút **"+ Thêm trang"** ở cuối sách (ẩn khi đã đủ 5 trang) và nút **xóa trang**
  (icon thùng rác trên mỗi trang ảnh, có xác nhận).

### 4.5 Upload & cắt ảnh
- Chấp nhận: `image/jpeg`, `image/png`, `image/webp`, `image/gif`; tối đa **10 MB/ảnh**.
- Quy trình: chọn file → mở **modal cắt ảnh** (drag để căn khung, zoom slider) → chọn tỷ lệ
  (Tự do / 1:1 / 4:3 / 3:4) → nhấn **"Cắt & Lưu"**.
- Cắt ở client (canvas) → gửi ảnh đã cắt lên server → server **resize** về tối đa 1920px
  cạnh dài, nén JPEG chất lượng 82.
- Khi trang đã đủ 2 ảnh, ô thêm ảnh bị ẩn.

### 4.6 Chia sẻ
- Mỗi sổ có mã chia sẻ riêng (`shareCode`, 8 ký tự ngẫu nhiên) → link dạng
  `/b/<shareCode>`.
- Modal chia sẻ: hiển thị link + nút **Sao chép**.
- Người nhận mở link: nếu chưa đăng nhập → chuyển tới trang đăng nhập kèm tham số
  `redirect` → sau khi đăng nhập quay về link. Lần đầu mở link hợp lệ → tự động gắn người
  dùng làm recipient của sổ.

### 4.7 Download / Upload (ZIP & PDF)
- **ZIP export** (`GET /api/books/:id/export/zip`):
  - Nội dung: `book.json` (toàn bộ metadata: tiêu đề, lời chúc, cấu trúc trang, danh sách
    ảnh) + thư mục `photos/` chứa toàn bộ file ảnh.
  - Tên file: `<title-slug>.zip`.
- **ZIP import / khôi phục** (`POST /api/books/:id/import`, chỉ creator):
  - Nhận file ZIP, kiểm tra cấu trúc (`book.json` + `photos/`), tạo lại trang + ảnh.
  - Cơ chế: tạo sổ mới từ dữ liệu ZIP (không ghi đè sổ hiện tại) — an toàn hơn; hoặc ghi
    đè nếu người dùng chọn. **Quyết định: luôn tạo sổ mới** để tránh mất dữ liệu.
- **PDF export** (`GET /api/books/:id/export/pdf`):
  - Trang bìa (tiêu đề sổ), trang thiệp (lời chúc), các trang ảnh (2 ảnh/trang, giữ tỉ lệ).
  - Sinh bằng `pdfkit` trên server.

---

## 5. Mô hình dữ liệu (SQLite)

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE books (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  share_code     TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  wish_title     TEXT NOT NULL DEFAULT '',
  wish_message   TEXT NOT NULL DEFAULT '',
  envelope_style TEXT NOT NULL DEFAULT 'rose',   -- rose | kraft | sky | sage
  cover_style    TEXT NOT NULL DEFAULT 'sage',   -- màu bìa sổ
  created_by     INTEGER NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,                  -- 2..5
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (book_id, page_number)
);

CREATE TABLE photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id     INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  filename    TEXT NOT NULL,                     -- tên file trong thư mục uploads/
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE book_recipients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (book_id, user_id)
);
```

Ghi chú:
- Trang 1 (thiệp) không nằm trong bảng `pages` — lời chúc nằm trên bản ghi `books`.
- Xóa sổ → cascade xóa pages, photos, book_recipients (SQLite FK + `ON DELETE CASCADE`;
  bật `PRAGMA foreign_keys = ON`).

---

## 6. API contract

Base URL: `/api`. Toàn bộ trả về JSON. Lỗi dạng `{ "error": "message" }` kèm HTTP status
(400/401/403/404/500).

### Auth
| Method | Path | Body | Quyền | Kết quả |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{username, password, displayName}` | công khai | `{user}` |
| POST | `/api/auth/login` | `{username, password}` | công khai | `{user}` |
| POST | `/api/auth/logout` | – | đã đăng nhập | `{ok:true}` |
| GET | `/api/auth/me` | – | – | `{user}` hoặc `{user:null}` |

### Sổ
| Method | Path | Body | Quyền | Kết quả |
|---|---|---|---|---|
| POST | `/api/books` | `{title}` | đăng nhập | `{book}` |
| GET | `/api/books` | – | đăng nhập | `[{book, role}]` |
| GET | `/api/books/:id` | – | creator/recipient | `{book, pages, role}` |
| GET | `/api/books/by-code/:code` | – | đăng nhập (tự gắn recipient) | `{book, pages, role}` |
| PUT | `/api/books/:id` | `{title}` | creator | `{book}` |
| DELETE | `/api/books/:id` | – | creator | `{ok:true}` |
| PUT | `/api/books/:id/wish` | `{wishTitle, wishMessage, envelopeStyle, coverStyle}` | creator | `{book}` |

### Trang & ảnh
| Method | Path | Body | Quyền | Kết quả |
|---|---|---|---|---|
| POST | `/api/books/:id/pages` | – | creator | `{page}` (tự tăng `page_number` kế tiếp) |
| DELETE | `/api/books/:id/pages/:pageId` | – | creator | `{ok:true}` |
| POST | `/api/pages/:pageId/photos` | multipart `file` | creator/recipient | `{photo}` |
| DELETE | `/api/photos/:photoId` | – | creator **hoặc uploader** | `{ok:true}` |

### Xuất / nhập
| Method | Path | Quyền | Kết quả |
|---|---|---|---|
| GET | `/api/books/:id/export/zip` | creator/recipient | `application/zip` |
| GET | `/api/books/:id/export/pdf` | creator/recipient | `application/pdf` |
| POST | `/api/books/:id/import` (multipart `zip`) | creator | `{book}` (sổ mới) |

### Shape chuẩn
```jsonc
// GET /api/books/:id → 200
{
  "book": {
    "id": 1, "shareCode": "Ab3xK9pQ", "title": "Sinh nhật 2026",
    "wishTitle": "Chúc mừng sinh nhật!", "wishMessage": "...",
    "envelopeStyle": "rose", "coverStyle": "sage",
    "createdBy": 1, "createdAt": "...", "updatedAt": "..."
  },
  "pages": [
    {
      "id": 5, "pageNumber": 2,
      "photos": [
        { "id": 9, "url": "/uploads/abc123.jpg", "uploadedBy": 1,
          "uploadedByName": "Minh", "canDelete": true }
      ]
    }
  ],
  "role": "creator" | "recipient"
}
```

---

## 7. Ràng buộc & quy tắc nghiệp vụ

1. Mỗi sổ **tối đa 5 trang**: trang 1 (thiệp) + tối đa 4 trang ảnh (`page_number` 2–5).
2. Mỗi trang ảnh **tối đa 2 ảnh**.
3. `shareCode` duy nhất toàn hệ thống, sinh ngẫu nhiên 8 ký tự (a–z, A–Z, 0–9).
4. Chỉ creator mới được sửa lời chúc / tạo-xóa trang / xóa sổ / import ZIP.
5. Xóa ảnh: creator xóa được mọi ảnh; recipient chỉ xóa ảnh do mình upload
   (`photos.uploaded_by == user.id`).
6. Recipient không thể xóa trang (kể cả trang trống).
7. Upload ảnh phải thuộc sổ mà người dùng có quyền truy cập (creator hoặc recipient).
8. Mở link `/b/<code>` với sổ không tồn tại → trang 404 thân thiện.
9. Mở link chia sẻ khi chưa đăng nhập → redirect sang đăng nhập, sau khi đăng nhập quay về
   đúng link.
10. Import ZIP luôn **tạo sổ mới**, không ghi đè.

---

## 8. Xử lý ảnh & file

- Upload dir: `server/uploads/` (tạo tự động khi khởi động).
- Tên file lưu: `<random-uuid>.jpg` (chuẩn hóa sang JPEG sau resize).
- Pipeline: client cắt (canvas) → `multer` nhận file → `sharp` resize (tối đa 1920px cạnh
  dài, `quality: 82`) → lưu.
- Validate: mimetype trong whitelist, giới hạn 10MB (`multer` limits + kiểm tra magic bytes
  bằng `sharp` metadata).
- Xóa ảnh / xóa trang / xóa sổ → xóa file tương ứng khỏi đĩa (dùng `fs.unlink`, bỏ qua nếu
  file không tồn tại).
- Phục vụ ảnh: `express.static('/uploads')` với cache header dài hạn (tên file uuid không
  đổi nội dung).

---

## 9. Yêu cầu phi chức năng

- **Bảo mật**: mật khẩu băm bằng `bcryptjs` (salt 10); JWT httpOnly cookie; không bao giờ
  trả `password_hash` ra API; validate đầu vào mọi endpoint; kiểm tra quyền ở server
  (không tin client).
- **Hiệu năng**: ảnh resize trước khi lưu; lazy-load ảnh trong sổ (`loading="lazy"`);
  SQLite index trên `books.created_by`, `pages.book_id`, `photos.page_id`,
  `book_recipients.user_id`.
- **Responsive**: hoạt động tốt trên mobile (375px) → desktop (1440px). Trên mobile, sổ
  hiển thị 1 trang/lần; desktop có thể hiển thị 2 trang đối diện (spread) — **tối thiểu
  phải 1 trang/lần đẹp trên mọi kích thước**.
- **Tiếng Việt**: toàn bộ UI tiếng Việt, font hỗ trợ đầy đủ dấu tiếng Việt.

---

## 10. Tiêu chí nghiệm thu (Acceptance Criteria)

1. [ ] Đăng ký, đăng nhập, đăng xuất hoạt động; phiên giữ nguyên khi refresh.
2. [ ] Creator tạo được sổ, viết/sửa lời chúc, đổi màu phong bì.
3. [ ] Phong bì mở ra hiện thiệp với animation mượt.
4. [ ] Creator tạo được tối đa 4 trang ảnh; nút thêm trang ẩn khi đủ 5 trang.
5. [ ] Upload ảnh có modal cắt ảnh (drag + zoom + chọn tỷ lệ); ảnh lưu đúng vị trí.
6. [ ] Mỗi trang tối đa 2 ảnh; ô thêm ảnh ẩn khi đầy.
7. [ ] Recipient mở link chia sẻ → đăng ký → vào sổ → upload được ảnh.
8. [ ] Recipient KHÔNG thấy nút sửa lời chúc / thêm trang / xóa trang / xóa sổ.
9. [ ] Recipient xóa được ảnh của mình, KHÔNG xóa được ảnh của người khác.
10. [ ] Tải ZIP thành công; import ZIP tạo sổ mới đầy đủ ảnh + lời chúc.
11. [ ] Tải PDF thành công, đủ bìa + thiệp + các trang ảnh.
12. [ ] Xóa sổ xóa sạch dữ liệu và file ảnh trên đĩa.
13. [ ] Giao diện đẹp, nhất quán, responsive, không lỗi console.