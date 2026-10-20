# Thiết kế UI/UX — "Cuốn Sổ Lời Chúc"

> Tài liệu này là chuẩn thiết kế. Agent build PHẢI tuân theo để giao diện đẹp, nhất quán.
> Cảm hứng: cuốn sổ lưu niệm giấy, ấm áp, hoài niệm — không hiện đại "techy".

---

## 1. Concept

Trang web mô phỏng **một cuốn sổ tay thật**: giấy kem, bìa vải, lò xo xoắn, phong bì giấy
kraft, ảnh dán kiểu polaroid. Toàn bộ cảm giác phải **ấm áp, gần gũi, có hồn** — như món
quà thủ công, không phải sản phẩm SaaS.

Ba nguyên tắc:
1. **Giấy thật** — nền kem, vân giấy nhẹ, bóng đổ mềm.
2. **Chữ viết tay** — tiêu đề, lời chúc dùng font handwriting; phần còn lại chữ tròn dễ đọc.
3. **Chuyển động nhẹ nhàng** — phong bì mở, lật trang, ảnh xuất hiện đều có animation dịu.

---

## 2. Design system

### 2.1 Màu sắc (palette)

| Token | Hex | Dùng cho |
|---|---|---|
| `paper` | `#FAF6EE` | Nền giấy, nền trang web |
| `paper-dark` | `#F1E9DA` | Giấy đậm, viền, mặt trong phong bì |
| `ink` | `#4A3F35` | Chữ chính (nâu đậm ấm) |
| `ink-soft` | `#8A7A6A` | Chữ phụ, placeholder |
| `accent-rose` | `#D96C6C` | Phong bì rose, nút chính |
| `accent-kraft` | `#C9A87C` | Phong bì kraft |
| `accent-sky` | `#A9C6D9` | Phong bì sky |
| `accent-sage` | `#8FA98A` | Phong bì sage, bìa sổ |
| `gold` | `#D4A94E` | Điểm nhấn, badge, icon nhỏ |
| `danger` | `#C0392B` | Xóa, cảnh báo |
| `white` | `#FFFFFF` | Khung polaroid, thiệp |

Phong bì có 4 biến thể màu (rose / kraft / sky / sage) — người tạo chọn khi viết lời chúc.

### 2.2 Typography

- **Font chữ viết tay** (tiêu đề, lời chúc, tên sổ): **Dancing Script** — Google Fonts,
  có subset `vietnamese` (bắt buộc chọn subset này để hiện đúng dấu).
- **Font thân** (nội dung, nút, form): **Be Vietnam Pro** — Google Fonts, subset
  `vietnamese`. Fallback: `Nunito, system-ui, sans-serif`.
- Kích thước: heading sổ 2.5–3rem (handwriting), tiêu đề thiệp 2–2.5rem, body 1rem,
  caption 0.875rem.

### 2.3 Hình dạng & bóng

| Thuộc tính | Giá trị |
|---|---|
| Bo góc | 12px (card), 999px (pill button), 4px (input) |
| Bóng | `0 4px 24px rgba(74,63,53,0.12)` (mềm, ấm) |
| Border | 1px `rgba(74,63,53,0.08)` |

### 2.4 Khoảng cách

Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. Container tối đa 960px.

---

## 3. Các màn hình

### 3.1 Màn hình đăng nhập / đăng ký (`/`)
- Nền giấy kem, ở giữa là **bìa cuốn sổ** (card bo góc, màu sage) với tiêu đề
  "Cuốn Sổ Lời Chúc" font handwriting.
- Bên dưới bìa: 2 tab **Đăng nhập / Đăng ký** (pill switch).
- Form tối giản, label rõ ràng, nút chính màu rose.
- Mobile: bìa thu nhỏ, form full-width.

### 3.2 Trang chủ — danh sách sổ (`/books`)
- Header: logo "Cuốn Sổ Lời Chúc" (handwriting) + avatar/tên người dùng + nút đăng xuất.
- Grid sổ (responsive: 1/2/3 cột). Mỗi sổ là **mini bìa sổ**: nền màu `cover_style`, bo
  góc, tiêu đề font handwriting, badge vai trò (**"Của tôi"** / **"Người nhận"**), ngày tạo.
- Nút **"+ Tạo cuốn sổ mới"** (primary, rose) và nút **"Khôi phục từ ZIP"** (secondary).
- Trạng thái rỗng: minh họa + hướng dẫn tạo sổ đầu tiên.

### 3.3 Trang xem sổ — CUỐN SỔ (`/books/:id`, `/b/:code`)
Đây là màn hình chính, cấu trúc:

```
┌─────────────────────────────────────────────┐
│ Toolbar: ← Về | [Tên sổ] | ✏️ 👥 ⬇️ ⋮       │
├─────────────────────────────────────────────┤
│                                             │
│        ┌──────────┐   ┌──────────┐          │
│        │  Trang 1  │   │  Trang 2 │          │
│        │ [phong bì]│   │ [2 ảnh]  │          │
│        └──────────┘   └──────────┘          │
│                                             │
│   ◀  ● ● ● ● ●  ▶   (chấm điều hướng)      │
└─────────────────────────────────────────────┘
```

- **Khung sổ**: nền `paper`, bo góc lớn, bóng đổ, bên trái có **lò xo xoắn** (dãy vòng
  tròn nhỏ) mô phỏng sổ lò xo.
- **Desktop (≥ 768px)**: hiển thị 2 trang đối diện (spread) — trang hiện tại + trang kế;
  **Mobile**: 1 trang/lần.
- **Điều hướng**: mũi tên ◀ ▶ + dãy chấm tròn (● = trang hiện tại). Animation lật trang:
  slide ngang + fade 250ms.
- **Toolbar** (theo vai trò):
  - Creator: ✏️ Viết lời chúc · 👥 Chia sẻ · ⬇️ Tải xuống (dropdown: ZIP / PDF) ·
    🗑️ Xóa sổ · ➕ Thêm trang.
  - Recipient: 👥 Chia sẻ (xem) · ⬇️ Tải xuống.
  - Nút không được phép → **KHÔNG hiển thị** (không chỉ disable).

### 3.4 Trang 1 — Phong bì & thiệp
- **Phong bì** (kích thước ~ 320×220px, bo góc 8px, màu theo `envelope_style`):
  - Mặt trước: 2 đường chéo tạo nắp (CSS `clip-path` hoặc tam giác), tem nhỏ góc phải
    (hình vuông gold, viền răng cưa).
  - **Animation mở**: bấm → nắp xoay lên (`rotateX(180deg)`, `transform-origin: top`,
    `transition 600ms ease`) → thiệp trượt lên khỏi phong bì (`translateY(-140px)`,
    500ms delay) → thiệp phóng to về giữa trang.
  - Sau khi mở: nút **"Mở lại"** (reset animation) + nút **✏️ Sửa lời chúc** (creator).
- **Thiệp**: card trắng bo góc 12px, viền `ink-soft` mỏng, bên trong:
  - Tiêu đề: font handwriting, cỡ lớn, màu rose.
  - Nội dung: font thân, màu ink, căn giữa, `white-space: pre-wrap`.
  - Trang trí: 1–2 icon nhỏ (💌 🌸) hoặc đường kẻ trang trí.
- Chưa có lời chúc: phong bì hiển thị + dòng "Viết lời chúc đầu tiên 💌" (creator) /
  "Lời chúc đang được viết…" (recipient).

### 3.5 Trang ảnh (2–5)
- Mỗi trang: 2 **ô ảnh polaroid**: ảnh + viền trắng dày (padding 10px) + bóng đổ; 2 ô
  nghiêng nhẹ đối xứng (`rotate(-1.5deg)` / `rotate(1.5deg)`) cho cảm giác dán tay.
- **Ô trống**: nền `paper-dark` nét đứt, icon 📷 + "Thêm ảnh" (button, hover đổi màu).
- **Hover ảnh**: overlay tối nhẹ + 2 nút tròn: 🔍 (xem lớn) · 🗑️ (xóa, nếu `canDelete`).
- **Lightbox**: bấm 🔍 → ảnh phóng to giữa màn hình, nền đen mờ, bấm ngoài/ESC để đóng.
- **Nút xóa trang** (creator): icon thùng rác nhỏ góc trên phải trang, bấm → modal xác nhận
  ("Xóa trang này? Ảnh trong trang sẽ bị xóa.").

### 3.6 Modal cắt ảnh
- Mở khi người dùng chọn file. Bố cục: ảnh gốc ở giữa (có thể kéo để di chuyển khung cắt),
  slider **zoom**, hàng nút chọn **tỷ lệ**: `Tự do / 1:1 / 4:3 / 3:4`.
- Nút: **Hủy** (ghost) · **Cắt & Lưu** (primary).
- Dùng thư viện `react-easy-crop`; xuất ảnh cắt qua canvas (`getCroppedImg`).
- Loading state khi upload; lỗi (file quá lớn / sai định dạng) hiển thị toast đỏ.

### 3.7 Modal khác
- **Viết lời chúc**: form (tiêu đề, nội dung textarea, chọn màu phong bì — 4 swatch tròn).
- **Chia sẻ**: link readonly + nút Sao chép (toast "Đã sao chép!").
- **Tạo sổ**: input tiêu đề.
- **Xác nhận xóa** (sổ/trang/ảnh): tiêu đề + mô tả hậu quả + nút đỏ.
- **Khôi phục ZIP**: chọn file → thông báo kết quả (thành công → mở sổ mới).

---

## 4. Component library (Tailwind)

Dùng Tailwind CSS. Các component tái sử dụng:

| Component | Mô tả |
|---|---|
| `Button` | variants: primary (rose), secondary (paper-dark), ghost, danger |
| `Modal` | card trắng, backdrop `bg-black/40 backdrop-blur-sm`, đóng bằng ESC/click ngoài |
| `Toast` | góc dưới phải, auto-dismiss 3s, success/danger |
| `Envelope` | phong bì + animation mở (props: `style`, `opened`, `onOpen`) |
| `WishCard` | thiệp lời chúc |
| `PhotoSlot` | ô ảnh polaroid / placeholder thêm ảnh |
| `Lightbox` | xem ảnh lớn |
| `CropModal` | cắt ảnh (react-easy-crop) |
| `BookCover` | bìa sổ thu nhỏ (danh sách) |
| `EmptyState` | trạng thái rỗng |

---

## 5. Animation & micro-interaction

| Tình huống | Animation |
|---|---|
| Mở phong bì | Nắp xoay lên → thiệp trượt ra → phóng to (tổng ~1.2s) |
| Lật trang | Slide ngang + fade 250ms `ease-in-out` |
| Ảnh xuất hiện | Fade + scale nhẹ (`scale 0.95 → 1`) 300ms |
| Hover ảnh | `scale(1.03)` + overlay mờ dần |
| Nút | `active:scale-95`, hover đổi nền |
| Toast | Slide lên từ dưới + fade |
| Modal | Fade backdrop + scale 0.96→1 |

Tôn chỉ: **dịu, ngắn (150–600ms)**, không lòe loẹt.

---

## 6. Responsive

| Breakpoint | Bố cục sổ |
|---|---|
| < 640px | 1 trang/lần, phong bì thu nhỏ (280px), toolbar gom thành icon |
| 640–1024px | 1 trang/lần, phong bì đầy đủ |
| ≥ 1024px | Spread 2 trang (trang hiện tại + trang kế) |

Danh sách sổ: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

---

## 7. Checklist chất lượng UI

- [ ] Nền giấy kem, không nền trắng tinh toàn màn hình.
- [ ] Font Dancing Script + Be Vietnam Pro (subset vietnamese) load đúng.
- [ ] Phong bì mở mượt, thiệp hiện rõ chữ tiếng Việt có dấu.
- [ ] Polaroid đúng chất: viền trắng, nghiêng nhẹ, bóng đổ.
- [ ] Mọi nút theo vai trò: recipient không thấy nút của creator.
- [ ] Không lỗi console, không ảnh vỡ, không text tràn.
- [ ] Test trên mobile (375px) và desktop (1440px).