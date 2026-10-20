# Cuốn Sổ Lời Chúc (Wish Book)

Trang web mô phỏng cuốn sổ lưu niệm số: trang đầu là **phong bì chứa thiệp lời chúc**, các
trang sau là **trang ảnh** (tối đa 5 trang, mỗi trang 2 ảnh). Có tài khoản **người tạo** và
**người nhận**, cắt ảnh khi upload, tải xuống dạng **ZIP / PDF** và khôi phục từ **ZIP**.

## Tài liệu

| File | Nội dung |
|---|---|
| `docs/SPEC.md` | Đặc tả chi tiết: vai trò, phân quyền, data model, API, tiêu chí nghiệm thu |
| `docs/DESIGN.md` | Thiết kế UI/UX: palette, typography, từng màn hình, animation |
| `docs/PLAN.md` | Kế hoạch build 1–2h theo từng phase |
| `.vibeflow/skills/photo-book-builder/SKILL.md` | **Agent** — hướng dẫn AI build toàn bộ trang web |

## Cách dùng agent để build

1. Mở một phiên chat AI mới trong VibeFlow (workspace này).
2. Gõ một trong các lệnh sau:

   > "Chạy agent `photo-book-builder` để build trang web Cuốn Sổ Lời Chúc"
   >
   > "Dùng skill photo-book-builder build website sổ lời chúc theo spec"
   >
   > "Build the wish book website theo docs/SPEC.md và docs/DESIGN.md"

3. Agent sẽ tự đọc `docs/SPEC.md`, `docs/DESIGN.md`, `docs/PLAN.md` và build theo đúng
   các phase (dự kiến 1–2h), sau đó chạy preview để bạn xem thử.

## Công nghệ

React + Vite + Tailwind (frontend) · Express + SQLite + Sharp (backend) · JWT cookie (auth)
· react-easy-crop (cắt ảnh) · adm-zip + pdfkit (xuất ZIP/PDF).

## Tính năng chính

- Phong bì mở ra hiện thiệp lời chúc (animation CSS)
- Tối đa 5 trang/sổ, 2 ảnh/trang, ảnh kiểu polaroid
- Cắt ảnh trước khi upload (drag, zoom, chọn tỷ lệ)
- Phân quyền: creator sửa lời chúc/quản lý trang; recipient thêm ảnh, chỉ xóa ảnh mình upload
- Chia sẻ qua link, tải ZIP/PDF, khôi phục từ ZIP