# DESIGN.md — Frontend Design System

> **Bản quy tắc thiết kế chính thức** cho dự án SWD392 Chatbot RAG.
> Tất cả các trang mới **bắt buộc** phải tuân thủ tài liệu này để đảm bảo UI/UX đồng nhất và chuẩn xác.

---

## 1. Nguyên tắc cốt lõi

| # | Nguyên tắc | Mô tả |
|---|---|---|
| 1 | **100% Tailwind Utility Classes** | Tuyệt đối **KHÔNG dùng inline styles** (`style={{...}}`) trừ trường hợp bất khả kháng. Luôn ưu tiên dùng hệ thống class chuẩn của Tailwind (như `text-xs`, `h-8`, `max-w-sm`). |
| 2 | **Mantine CSS Override Rule** | Khi style đè lên các component của Mantine (Select, UnstyledButton...), class mặc định của Mantine thường đè mất Tailwind. **BẮT BUỘC dùng cờ `!` (important)** (ví dụ: `!text-[12px]`, `!px-4`, `!h-8`) để ép Tailwind thắng CSS của Mantine. |
| 3 | **Ưu tiên dùng lại component** | Luôn kiểm tra `components/ui/` và `components/common/` (đặc biệt là các filters, headers) trước khi tạo mới. |
| 4 | **Consistent font stack** | Luôn để font cascade qua CSS variable `--font-sans` (Inter), `--font-serif` (Newsreader), `--font-mono` (JetBrains Mono). Không import font ngoài. |
| 5 | **Pascal Case cho UI Labels** | Tất cả các nhãn (labels) trên thanh điều hướng (Sidebar, Menu), tiêu đề cột, và nút bấm (Buttons) **bắt buộc phải viết hoa chữ cái đầu của mỗi từ** (Ví dụ: "Tài Liệu Mới" thay vì "Tài liệu mới", "Khám Phá" thay vì "Khám phá"). |

---

## 2. Typography Scale

Tất cả giá trị font size dùng **Tailwind classes**. Nếu gắn lên element của Mantine, thêm `!`.

### 2.1 Heading hierarchy

| Token | Class | Size (px) | Weight | Font | Sử dụng |
|---|---|---|---|---|---|
| `page-title` | `text-2xl` / `text-[24px]` | **24** | 700 (bold) | Sans | Tiêu đề trang chính (h1) |
| `section-title` | `text-lg` / `text-[18px]` | **18** | 700 | Sans | Tiêu đề section (h2/h3/h4) |
| `card-title` | `text-lg` | **18** | 700 | Sans | Tiêu đề trong card |
| `empty-state` | `text-[15px]` | **15** | 500 (medium) | Sans | Thông báo trạng thái rỗng |

### 2.2 Body text

| Token | Class | Size (px) | Weight | Sử dụng |
|---|---|---|---|---|
| `body` | `text-sm` | **14** | 400–500 | Mô tả, paragraph, description |
| `body-sm` | `text-[13px]` | **13** | 500 | Nav items, input text, secondary text |
| `caption` | `text-xs` | **12** | 500–600 | Metadata values, button text nhỏ |
| `micro` | `text-[11px]` | **11** | 500–600 | Eyebrow labels, filter tags, profile subtitle |
| `nano` | `text-[10px]` | **10** | 500–700 | Stat labels, badges nhỏ nhất |

---

## 3. Color Palette

### 3.1 Neutrals (Primary scale)

| Token | Hex | Tailwind | Sử dụng |
|---|---|---|---|
| `text-primary` | `#111827` | `text-zinc-900` / `gray-900` | Headings, active nav, tên profile |
| `text-secondary` | `#374151` | `text-zinc-700` | Body text, button text |
| `text-tertiary` | `#4B5563` | `text-zinc-600` | Nav items, text phụ |
| `text-muted` | `#6B7280` | `text-zinc-500` | Table data, profile subtitle |
| `text-faint` | `#9CA3AF` | `text-zinc-400` | Placeholders, eyebrow text, table headers |
| `bg-page` | `#FFFFFF` | `bg-white` | Page background mặc định |
| `bg-surface` | `#FAFAFA` | `bg-zinc-50` | Table headers, secondary blocks |
| `border-default` | `#E5E7EB` | `border-zinc-200` | Card borders, dividers, inputs |
| `border-light` | `#F3F4F6` | `border-zinc-100` | Table row borders |

### 3.2 Status Badges (Pills)

Trạng thái trạng thái **bắt buộc** phải là dạng ô bo góc (pill) có nền nhạt tiệp màu với icon dấu chấm. Không dùng text trơn.

| Status | Classes (Container) | Classes (Dot) |
|---|---|---|
| **Pending** | `bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md whitespace-nowrap` | `bg-zinc-500 w-1.5 h-1.5 rounded-full` |
| **Active** | `bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md whitespace-nowrap` | `bg-emerald-500 w-1.5 h-1.5 rounded-full` |
| **Ended** | `bg-red-50 text-red-600 px-2.5 py-1 rounded-md whitespace-nowrap` | `bg-red-500 w-1.5 h-1.5 rounded-full` |

---

## 4. Bảng & Danh sách (Table Design)

Khi thiết kế hiển thị dữ liệu bảng:
1. **Chống rớt dòng (No wrap)**: TẤT CẢ các thẻ `<Table.Th>` và `<Table.Td>` đều phải có class `whitespace-nowrap` để bảng có thể cuộn ngang mượt mà, không bị bể layout, rớt chữ khi dữ liệu dài.
2. **Table Header gọn gàng**: Dùng `bg-zinc-50/80 border-b border-zinc-100 py-3 text-xs whitespace-nowrap` để header vừa tách biệt nhẹ nhàng với nền trắng, vừa không chiếm quá nhiều khoảng không theo chiều dọc.
3. **Table Width**: Cố định bảng với `style={{ minWidth: 1000 }}` bên trong một container `overflow-x-auto` để scroll ngang tự nhiên.

---

## 5. Xử lý Lỗi tràn viền (Overflow Clipping)

Khi dùng các container có cuộn ngang như `overflow-x-auto` (ví dụ: thanh chứa tags, bộ lọc):
- **Bắt buộc thêm Vertical Padding (`py-1` hoặc `py-2`)** vào container đó. 
- Nguyên nhân: `overflow-x-auto` tự động kích hoạt format context ẩn đi mọi thành phần vượt ngoài biên dọc. Nếu các nút bên trong có `shadow-sm` hay viền (`border`), chúng sẽ bị cắt lẹm trông rất xấu (lỗi tràn dưới). `py-1` nới lỏng chiều cao giúp bóng đổ và viền hiển thị đủ.

---

## 6. Button & Form Styles

### 6.1 Primary button
```html
className="bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-lg px-4 h-8 text-xs transition-colors shadow-sm"
```

### 6.2 Secondary / Outline button
```html
className="border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold rounded-lg px-4 h-8 text-xs transition-colors shadow-sm"
```

### 6.3 Custom Mantine Select & Inputs
Để style các field của Mantine mà không bị lệch, dùng prop `classNames` với modifier `!`:
```tsx
<Select
  classNames={{
    input: "!h-8 !min-h-[32px] !text-[12px] !font-semibold !pl-7 !bg-transparent",
  }}
  className="!w-44" // Nới rộng w-44 để chữ "Most recent" không bị cắt
/>
```

### 6.4 Custom UnstyledButton
```tsx
<UnstyledButton
  className="flex items-center gap-1.5 !h-8 !text-[12px] !px-4 !py-0 !rounded-lg !font-semibold !text-zinc-600 hover:!bg-zinc-100 hover:!text-zinc-900 transition-colors !border !border-zinc-200/60 !shadow-sm"
>
```

---

## 7. Component Inventory & Patterns

### 7.1 `<Sidebar>` — `components/layout/sidebar.tsx`
- Width: **220px** cố định. Background trắng.

### 7.2 `<DocumentFilters>` — `components/common/documents/document-filters.tsx`
- Form search: `max-w-sm sm:max-w-xs`, dùng input native, icon position absolute left.
- Filters: Nút `UnstyledButton` với strict tailwind overrides.
- Tags container: Cuộn ngang `overflow-x-auto` với đệm `py-1` chống cắt viền.

### 7.3 Card Patterns
```html
<div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
```

### 7.4 Data Table Page Layout (Mẫu thiết kế trang danh sách chuẩn)
Quy định bắt buộc đối với tất cả các trang hiển thị dữ liệu dạng bảng:
1. **Sticky Header**: Tiêu đề trang ở bên trái, các nút thao tác nằm bên phải. Cần sử dụng nền kính mờ (`bg-white/90 backdrop-blur-md`) và `sticky top-0 z-20` để ghim khi cuộn.
2. **Nút Thao Tác (Header Actions)**: Bắt buộc dùng component `<Button>` của Mantine (tuyệt đối không dùng thẻ `<button>` HTML thuần để tránh mất hiệu ứng focus/click của Mantine). Kết hợp với class override có cờ `!`: `!h-8`, `!text-[12px]`, `!px-4`, `!font-semibold`, `!rounded-lg`. (Secondary buttons nên có `hover:!bg-zinc-50 !border-zinc-200`).
3. **Double Bezel Table Container**: Bảng phải được bọc trong một khối bo góc: `bg-white border border-zinc-200/60 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]`.
4. **Column Width Distribution**: Các cột trong bảng `<Table.Th>` PHẢI được gán `w-[xx%]` cụ thể, để không bị giãn tùy tiện khi trang đổi kích thước (ví dụ: `w-[22%]`, `w-[12%]`).
5. **Action Column (Cột cấu hình cuối bảng)**:
   - Cột cuối chứa nút Settings phải thiết lập `w-[1%] text-left` để thu hẹp tối đa và bao trọn lấy nút bấm.
   - Nút ActionIcon bên trong phải ép dính bên trái bằng `!pl-0` và `justify-start` (Vd: `<Table.Td className="!pl-0"><div className="flex justify-start">...</div></Table.Td>`) để tránh khoảng trống vô lý do Mantine padding.

---

## 8. Anti-patterns (KHÔNG được làm)

| ❌ Tránh | ✅ Thay bằng |
|---|---|
| Viết CSS inline `style={{ fontSize: 13, height: 32 }}` | Dùng class `text-[13px] h-8` hoặc `!text-[12px] !h-8` (nếu là Mantine element) |
| Để chữ rớt dòng trong ô Bảng (Table cells) | Dùng `whitespace-nowrap` ở Table.Th và Table.Td |
| Table Header quá dày và cao | Set `py-3 text-xs bg-zinc-50/80` cho Table.Th |
| Chấm trạng thái (Status) chỉ có mỗi icon | Dùng Badge/Pill bo góc (px-2.5 py-1 rounded-md có nền) |
| Khung cuộn ngang `overflow-x-auto` chật hẹp | Gắn thêm `py-1` để bóng đổ (shadow) của nội dung không bị gọt lẹm |
| Gắn class bình thường cho Mantine Select / Button | Dùng `!class` (ví dụ `!w-44`, `!px-4`) để ép Tailwind thắng |
