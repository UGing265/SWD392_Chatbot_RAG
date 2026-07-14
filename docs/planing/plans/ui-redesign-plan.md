# Kế hoạch refactor UI StudyMate

Ngày lập: 2026-07-10  
Phạm vi: toàn bộ frontend Next.js trong `frontend/src`, ưu tiên đồng bộ UI theo phong cách của nhóm trang `lecturer/documents`.

---

## 1. Tóm tắt hiện trạng

Frontend hiện tại là **Next.js App Router + React 19 + Tailwind CSS v4 + Mantine v7**. UI đang bị chia thành nhiều phong cách khác nhau:

- Nhóm **lecturer documents** là style tốt nhất, nên dùng làm reference:
  - Nền `zinc-50`, card trắng, border `zinc-200`, hover nhẹ.
  - Typography có hierarchy rõ: heading serif lớn, eyebrow mono uppercase.
  - Card/document grid dạng editorial/bento, ít màu, hành động rõ.
  - File tiêu biểu:
    - `frontend/src/components/lecturer/documents/documents-view.tsx`
    - `frontend/src/components/lecturer/documents/my-documents-view.tsx`
    - `frontend/src/components/lecturer/documents/upload-view.tsx`
    - `frontend/src/app/[role]/documents/[id]/page.tsx`
- Nhóm **admin** đã khá gần style lecturer documents nhờ `AdminPageShell`, nhưng vẫn trùng lặp nhiều component card/table/form.
- Nhóm **settings / practice / quiz** đang lệch mạnh sang dark theme đen, teal/blue gradient, không đồng bộ.
- Nhóm **chat / sessions** đang dùng style Mantine mặc định + blue/gray, chưa cùng visual language.
- `globals.css` khai báo token `:root` là black/dark (`--background: #000000`) nhưng đa số app lại dùng nền trắng/zinc thủ công. Đây là nguồn gây lệch style.
- Chưa có thư mục `components/ui` dùng chung; component pattern đang copy/paste trực tiếp trong từng page.

Mục tiêu: **chuẩn hoá toàn app thành một design system trắng–zinc–editorial giống lecturer documents**, nhóm component dùng chung, rồi refactor từng trang theo thứ tự ưu tiên.

---

## 2. Design direction thống nhất

### 2.1. Style nguồn cần giữ

Dùng phong cách từ `lecturer/documents` làm chuẩn:

- Background page: `bg-zinc-50` hoặc `bg-[#FAFAFA]`.
- Surface/card: `bg-white`, `border border-zinc-200`, `rounded-2xl` hoặc `rounded-[24px]`, `shadow-sm`.
- Hover card: `hover:border-zinc-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]`.
- Primary action: `bg-zinc-900 text-white hover:bg-zinc-800`, radius `xl/full`.
- Secondary action: `bg-zinc-100 text-zinc-700 hover:bg-zinc-200` hoặc outline gray.
- Heading: serif, large, tracking tight.
- Eyebrow: mono uppercase, tracking wide, text `zinc-500`.
- Icon block: square `w-12 h-12 rounded-xl/2xl bg-zinc-100 border border-zinc-200 text-zinc-700`, hover dark.
- Animation: `animate-in fade-in slide-in-from-* duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]` nhưng dùng có kiểm soát.

### 2.2. Palette đề xuất

Không dùng dark theme cho page thường, trừ khi có yêu cầu riêng.

```txt
page-bg        zinc-50 / #FAFAFA
surface        white
surface-soft   zinc-50
border         zinc-200
border-hover   zinc-400
text-main      zinc-900 / zinc-950
text-muted     zinc-500
text-soft      zinc-400
primary        zinc-900
primary-hover  zinc-800
success        emerald-600 / emerald-50
warning        amber-600 / amber-50
danger         red-600 / red-50
info           sky-600 / sky-50
```

### 2.3. Typography

- Page title: `font-serif text-[40px] leading-none tracking-[-0.03em] text-zinc-900`.
- Detail hero title: `font-serif text-5xl md:text-[72px] leading-[1.05] tracking-[-0.02em]`.
- Section heading: `text-[16px] font-bold uppercase tracking-tight` hoặc `font-serif text-[20px]`.
- Eyebrow/meta: `font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-500`.
- Body: `text-sm text-zinc-500 leading-relaxed`.

### 2.4. Layout spacing

- Standard page wrapper: `container mx-auto max-w-6xl p-6 py-12`.
- Admin wide wrapper: `w-full px-4 py-10 sm:px-6 md:px-8 md:py-12 xl:px-[72px]`.
- Page header margin: `mb-10` hoặc `mb-12`.
- Card grid gap: `gap-6`.
- Form/card padding: `p-5`, `p-6`, `p-xl` tuỳ density.

---

## 3. Component dùng chung cần tạo

Tạo thư mục mới:

```txt
frontend/src/components/ui/
```

### 3.1. `PageShell`

Dùng thay cho layout header lặp lại ở admin, lecturer, student.

File đề xuất: `frontend/src/components/ui/page-shell.tsx`

Props:

```ts
type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "full";
  className?: string;
};
```

Behavior:

- Render background `bg-zinc-50`.
- Render header chuẩn với eyebrow/title/description/actions.
- Cho phép icon block bên trái như `DocumentsView`.
- Dùng animation thống nhất.

Sau đó:

- `AdminPageShell` có thể giữ làm wrapper gọi `PageShell` hoặc thay bằng `PageShell` trực tiếp.
- Các trang lecturer/student/common dùng chung `PageShell`.

### 3.2. `SurfaceCard`

File: `frontend/src/components/ui/surface-card.tsx`

Dùng cho mọi card/paper thay vì copy class.

Variants:

```ts
variant: "default" | "interactive" | "dashed" | "subtle"
padding: "sm" | "md" | "lg" | "xl"
radius: "xl" | "2xl" | "3xl"
```

Class chuẩn:

- Default: `bg-white border border-zinc-200 rounded-2xl shadow-sm`.
- Interactive: thêm hover border/shadow/active.
- Dashed: border dashed, bg `zinc-50/50`.

### 3.3. `IconTile`

File: `frontend/src/components/ui/icon-tile.tsx`

Dùng cho icon đầu card/page.

Props:

```ts
size?: "sm" | "md" | "lg";
tone?: "neutral" | "success" | "warning" | "danger" | "info";
interactive?: boolean;
```

### 3.4. `StatusBadge`

File: `frontend/src/components/ui/status-badge.tsx`

Chuẩn hoá badge cho:

- document status: `completed`, `pending`, `processing`, `failed`, `rejected`, `Ready`, `Failed`.
- visibility: `private`, `school_wide`, `public`.
- user role/status.

Class style:

- `inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`.

### 3.5. `EmptyState`

File: `frontend/src/components/ui/empty-state.tsx`

Dùng thay cho các empty block tự viết.

Props:

```ts
icon: React.ReactNode;
title: string;
description?: string;
action?: React.ReactNode;
```

Style giống empty state trong `DocumentsView`:

- Card trắng, border zinc, center, icon lớn trong tile nhạt.

### 3.6. `ToolbarCard`

File: `frontend/src/components/ui/toolbar-card.tsx`

Dùng cho filter/search/sort panel.

- `bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm`.
- Support layout row/stack.

### 3.7. `DocumentCard`

File: `frontend/src/components/ui/document-card.tsx`

Dùng chung cho:

- My documents.
- Shared documents result mode.
- Student document grid.
- Lecturer subject document list.
- Admin document list nếu có card mode.

Props gợi ý:

```ts
type DocumentCardProps = {
  title: string;
  description?: string;
  subjectLabel?: string;
  status?: React.ReactNode;
  visibility?: React.ReactNode;
  metaLeft?: { label: string; value: string };
  metaRight?: { label: string; value: string };
  href?: string;
  actions?: React.ReactNode;
};
```

### 3.8. `MetricCard`

File: `frontend/src/components/ui/metric-card.tsx`

Dùng cho admin dashboard, shared documents stats, practice stats.

### 3.9. `AppTable`

File: `frontend/src/components/ui/app-table.tsx`

Không nhất thiết wrap toàn Mantine Table phức tạp, nhưng nên có helper classes/compound:

- `AppTable.Container`
- `AppTable.HeadCell`
- `AppTable.EmptyRow`

Mục tiêu: tables admin/users/moderation/dashboard/list documents cùng header mono uppercase, row hover, border nhẹ.

### 3.10. `FormSection` và input style helper

File:

```txt
frontend/src/components/ui/form-section.tsx
frontend/src/components/ui/mantine-styles.ts
```

`mantine-styles.ts` export style object dùng chung:

```ts
export const inputStyles = {
  label: { fontWeight: 500, fontSize: "13px", color: "#18181b", marginBottom: 4 },
  input: { backgroundColor: "#FAFAFA", borderColor: "#EAEAEA" }
};
```

Dùng cho `TextInput`, `Textarea`, `Select`, `PasswordInput`, `MultiSelect` để tránh inline style copy/paste.

---

## 4. Global CSS / theme cần sửa

### 4.1. Sửa token trong `globals.css`

File: `frontend/src/app/globals.css`

Hiện `:root` đang set black theme:

```css
--background: #000000;
--foreground: #ffffff;
--card: #0d0d0d;
```

Cần đổi sang light theme đúng với UI mới:

```css
:root {
  --radius: 0.75rem;
  --background: #fafafa;
  --foreground: #18181b;
  --card: #ffffff;
  --card-foreground: #18181b;
  --popover: #ffffff;
  --popover-foreground: #18181b;
  --primary: #18181b;
  --primary-foreground: #ffffff;
  --primary-soft: #f4f4f5;
  --primary-deep: #09090b;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #18181b;
  --sidebar: #fafafa;
  --sidebar-foreground: #18181b;
  --sidebar-accent: #f4f4f5;
  --sidebar-accent-foreground: #18181b;
  --sidebar-border: #e4e4e7;
}
```

### 4.2. Mantine theme trong `providers.tsx`

File: `frontend/src/app/providers.tsx`

Hiện `primaryColor: "blue"`. Đổi mặc định sang neutral/dark, giữ blue chỉ dùng info.

- `primaryColor: "dark"` hoặc custom `zinc` nếu muốn.
- `defaultRadius: "lg"`.
- Heading font có thể dùng `var(--font-serif)` cho Title nếu muốn đồng bộ, nhưng cẩn thận Mantine Title admin hiện dùng class `font-serif`.

### 4.3. Loại bỏ dark page tự phát

Các page không nên dùng:

- `bg-[#000000]`
- `bg-[#0a0a0a]`
- `text-white`
- `teal-*` làm màu chính
- `blue-*` làm màu chính quá nhiều

Chuyển sang `zinc` + semantic badge/action.

---

## 5. Cấu trúc route/page hiện tại

### 5.1. Auth routes

- `/login`
  - File: `frontend/src/app/(auth)/login/page.tsx`
  - Hiện trạng: card trắng đẹp, custom input tốt, gần style mới nhưng hơi tách riêng.
  - Việc sửa:
    - Giữ layout minimal hiện tại.
    - Đổi heading/spacing giống PageShell tone: serif title, border zinc.
    - Tách `SpotlightInput` và `ElegantExpandButton` nếu muốn tái dùng, hoặc giữ local vì auth đặc thù.

- `/forgot-password`
  - File: `frontend/src/app/(auth)/forgot-password/page.tsx`
  - Hiện trạng: dùng Mantine Paper gray style, chưa khớp login.
  - Việc sửa:
    - Đồng bộ với login card: `rounded-[16px] border #EAEAEA`, title serif 40px.
    - Dùng primary black button.
    - Success state dùng icon circle black/white giống upload success.

- Auth layout
  - File: `frontend/src/app/(auth)/layout.tsx`
  - Hiện trạng: khá ổn với background `#FBFBFA`, watermark.
  - Việc sửa: giữ, chỉ đảm bảo typography/token mới không phá.

### 5.2. Root / not found

- `/`
  - File: `frontend/src/app/page.tsx`
  - Chỉ redirect theo role.
  - Việc sửa: loading spinner dùng nền `bg-zinc-50`, border `zinc-900` thay vì token dark cũ.

- `not-found`
  - File: `frontend/src/app/not-found.tsx`
  - Hiện trạng phụ thuộc token `bg-background`, hiện đang ra black do global token.
  - Việc sửa: sau khi đổi token đã ổn, hoặc explicit `bg-zinc-50 text-zinc-900`.

### 5.3. Layout theo role

- `frontend/src/components/layout/role-shell.tsx`
  - Auth guard + chọn AdminLayout/AppLayout.
  - Việc sửa: loading background đổi sang `bg-zinc-50`, loader `dark`.

- `frontend/src/components/layout/app-layout.tsx`
  - Dùng cho student/lecturer.
  - Hiện trạng: sidebar trắng/xám khá ổn nhưng nav thiếu nhiều route và chưa có mobile.
  - Việc sửa:
    - Đồng bộ active item với `zinc-200`, hover `zinc-100`.
    - Thêm nav item còn thiếu nếu route tồn tại: `Practice`, `Quiz`, `Sessions`, `Settings` tùy role.
    - Sidebar toggle button hiện không có hành động collapse; hoặc implement collapse giống admin, hoặc bỏ icon.
    - Mobile: thêm top bar/drawer nếu cần responsive.

- `frontend/src/components/layout/admin-layout.tsx`
  - Hiện trạng tốt, có collapse.
  - Việc sửa:
    - Dùng component shared `SidebarItem`, `UserMenu` nếu tách được.
    - Add settings/change-password route nếu admin cần thấy trong sidebar/menu.
    - Header badge `Admin workspace` có thể thay bằng user role/status chuẩn.

- `frontend/src/components/layout/admin-page-shell.tsx`
  - Hiện trạng tốt nhưng chỉ cho admin.
  - Việc sửa:
    - Refactor thành wrapper của `PageShell` hoặc thay bằng `PageShell` để mọi role dùng chung.

---

## 6. Kế hoạch sửa theo nhóm trang

## Phase 1 — Design system foundation

### Mục tiêu

Tạo component dùng chung và token trước khi sửa từng page, để Agent không copy/paste thêm style.

### Công việc

1. Sửa `frontend/src/app/globals.css` token sang light/zinc.
2. Sửa `frontend/src/app/providers.tsx` Mantine theme neutral hơn.
3. Tạo `frontend/src/components/ui/` với:
   - `page-shell.tsx`
   - `surface-card.tsx`
   - `icon-tile.tsx`
   - `status-badge.tsx`
   - `empty-state.tsx`
   - `toolbar-card.tsx`
   - `metric-card.tsx`
   - `document-card.tsx`
   - `form-section.tsx`
   - `mantine-styles.ts`
4. Refactor `AdminPageShell` dùng `PageShell`.
5. Không đổi logic data/hook trong phase này.

### Acceptance criteria

- App vẫn build.
- Không còn global token mặc định black cho page background.
- Có component shared đủ dùng cho các phase sau.

---

## Phase 2 — Chuẩn hoá layout/sidebar/navigation

### Files chính

- `frontend/src/components/layout/app-layout.tsx`
- `frontend/src/components/layout/admin-layout.tsx`
- `frontend/src/components/layout/role-shell.tsx`
- `frontend/src/components/layout/admin-page-shell.tsx`

### Việc sửa

1. Tách shared component nếu hợp lý:
   - `SidebarNavItem`
   - `SidebarUserMenu`
   - `RoleBadge`
2. Đồng bộ sidebar lecturer/student/admin:
   - Background `#FAFAFA` hoặc `zinc-50`.
   - Border `zinc-200`.
   - Active `bg-zinc-200 text-zinc-900`.
3. Cập nhật nav role-based:
   - Student:
     - Chat mới / Sessions
     - Tài liệu chung
     - Practice / Quiz
     - Settings
   - Lecturer:
     - Tài liệu riêng / thư viện cấu trúc
     - Tài liệu của tôi
     - Tài liệu chung
     - Upload
     - Practice / Quiz management nếu route dùng
     - Settings
   - Admin:
     - Dashboard
     - Users
     - Assignment
     - Curriculum
     - Metadata
     - Moderation
     - Settings nếu route `/admin/settings` dùng
4. Implement collapse cho `AppLayout` hoặc bỏ icon collapse hiện đang không làm gì.
5. Loading screen dùng `bg-zinc-50`, `Loader color="dark"`.

### Acceptance criteria

- Sidebar của admin và non-admin có cùng visual language.
- Không có nav icon không hoạt động.
- User menu thống nhất.

---

## Phase 3 — Giữ và component hoá nhóm Lecturer Documents

Nhóm này đang là reference, không rewrite lớn. Chủ yếu tách component để reuse.

### Files

- `frontend/src/components/lecturer/documents/documents-view.tsx`
- `frontend/src/components/lecturer/documents/my-documents-view.tsx`
- `frontend/src/components/lecturer/documents/upload-view.tsx`
- `frontend/src/components/lecturer/documents/edit-document-view.tsx`
- `frontend/src/app/[role]/documents/[id]/page.tsx`

### Việc sửa

1. `documents-view.tsx`
   - Giữ flow term → subject → documents → chapters/viewing.
   - Dùng `PageShell` cho header.
   - Dùng `SurfaceCard`, `IconTile`, `EmptyState`, `StatusBadge`.
   - Tách card term/subject/document nếu file quá dài.

2. `my-documents-view.tsx`
   - Dùng `PageShell`.
   - Search/filter panel dùng `ToolbarCard`.
   - Document card dùng `DocumentCard`.
   - Visibility dùng `StatusBadge`.
   - Nút delete dùng action icon chuẩn.

3. `upload-view.tsx`
   - Giữ UX drag/drop hiện tại vì khá ổn.
   - Tách `FileDropzoneCard` nếu muốn.
   - Move inline Select styles sang `mantine-styles.ts`.
   - Thay `alert()` bằng notification helper trong `frontend/src/lib/notifications.tsx` nếu sẵn có.

4. `edit-document-view.tsx`
   - Đang gần style mới nhưng Paper dùng `shadow-xl` hơi nặng.
   - Đổi sang `SurfaceCard`/`FormSection`.
   - Form input style dùng shared.

5. `documents/[id]/page.tsx`
   - Đây là detail đẹp, nên giữ editorial hero.
   - Cần tách các section lớn nếu file đang dài:
     - `DocumentHero`
     - `ChapterGrid`
     - `ChunkGrid`
     - `DocumentMetaAside`
     - `ReportModal`
     - `DeleteModal`
   - Thay `alert()` bằng notification.

### Acceptance criteria

- UI không xấu đi so với hiện tại.
- Các component shared đã chứng minh dùng được.
- File detail giảm độ dài/đỡ khó maintain nếu refactor.

---

## Phase 4 — Sửa Common Documents / Student Documents

### Files

- `frontend/src/components/common/documents/shared-documents-view.tsx`
- `frontend/src/components/common/documents/compare-view.tsx`
- `frontend/src/components/student/documents/student-documents-view.tsx`
- `frontend/src/app/[role]/documents/page.tsx`
- `frontend/src/app/[role]/documents/shared/page.tsx`
- `frontend/src/app/[role]/documents/compare/page.tsx`

### 4.1. Shared documents

Hiện khá gần style reference.

Việc sửa:

- Dùng `PageShell` cho header `Khám Phá.`.
- Dùng `MetricCard` cho tổng môn học/tổng lượt xem.
- Subject cards dùng `SurfaceCard + IconTile`.
- Search/filter mode dùng `ToolbarCard` giống my documents.
- Result documents dùng `DocumentCard`.
- Giữ bento span pattern nếu muốn, vì khá đẹp.

### 4.2. Student documents

Hiện cũng khá gần nhưng đang là mock/static style.

Việc sửa:

- Dùng `PageShell`.
- View switch grid/list tạo component `ViewModeToggle`.
- Filter subject chips dùng shared `FilterChip` nếu tạo.
- Grid cards đổi sang `DocumentCard`.
- List table đổi sang `AppTable`.
- Modal detail dùng style modal chuẩn white/zinc.

### 4.3. Compare documents

Hiện lệch: heading `text-3xl font-extrabold`, icon black block, form/table Mantine mặc định.

Việc sửa:

- Dùng `PageShell` với eyebrow `PHÂN TÍCH TÀI LIỆU`, title `So Sánh.`.
- Form chọn tài liệu + câu hỏi đặt trong `ToolbarCard` hoặc `SurfaceCard`.
- Error dùng `Alert` trong `SurfaceCard` style.
- Result comparison dùng:
  - Summary card.
  - Similarities/differences cards.
  - Table hoặc bento sections cùng header mono.
- Button primary black.

### Acceptance criteria

- Documents shared/my/student/detail nhìn cùng một hệ.
- Compare không còn cảm giác page Mantine default.

---

## Phase 5 — Sửa Chat và Sessions

### Files

- `frontend/src/components/common/chat/chat-view.tsx`
- `frontend/src/components/common/chat/sessions-view.tsx`
- `frontend/src/app/[role]/chat/page.tsx`
- `frontend/src/app/[role]/sessions/page.tsx`

### 5.1. ChatView

Hiện trạng:

- Nền `zinc-50` ổn.
- Header/landing đang `font-extrabold gray/blue`, chưa theo editorial style.
- Input box dùng Mantine Paper khá default.
- Document selector dùng blue highlight.

Việc sửa:

1. Landing no session:
   - Dùng `PageShell` hoặc centered hero custom:
     - Eyebrow `STUDYMATE AI`
     - Title serif `Hỏi Đáp Tài Liệu.`
     - Description ngắn.
   - Subject cards dùng `SurfaceCard interactive` + `IconTile`.
   - Hover không dùng blue, chuyển `group-hover:bg-zinc-900 group-hover:text-white`.

2. Empty active session:
   - Title serif `session.title`.
   - Input panel width `max-w-[800px]`, card `rounded-2xl border-zinc-200 bg-white shadow-sm`.

3. RichInputBox:
   - Tách file riêng nếu cần: `components/common/chat/rich-input-box.tsx`.
   - Remove blue states, dùng dark/zinc.
   - Send button `color="dark"`, radius full.

4. DocumentSelector:
   - Dùng `SurfaceCard` cho từng document.
   - Selected state: `border-zinc-900 bg-zinc-50 text-zinc-900`, icon black.
   - Badge neutral.

5. Messages:
   - User bubble: dark background hoặc white card align right.
   - Bot bubble: white card border.
   - Citations: chips/cards zinc, not blue.
   - Actions copy/thumb: subtle zinc icon buttons.

6. Error handling:
   - Replace `alert()` with notification.

### 5.2. SessionsView

Việc sửa:

- Dùng `PageShell` title `Phiên Chat.`.
- Search/filter/new session toolbar dùng `ToolbarCard`.
- Session cards/list dùng `SurfaceCard`.
- Modal create session dùng form style shared.
- Delete confirm nếu có: dùng Mantine Modal style shared.

### Acceptance criteria

- Chat không còn blue/gray default.
- Chat vẫn đủ usable, input nổi bật và sạch.
- Sessions thống nhất với document library.

---

## Phase 6 — Sửa Settings / Change Password

### Files

- `frontend/src/components/common/settings/settings-view.tsx`
- `frontend/src/components/admin/settings/admin-settings-view.tsx`
- `frontend/src/app/[role]/settings/page.tsx`
- `frontend/src/app/[role]/change-password/page.tsx`

### 6.1. Common SettingsView

Hiện trạng rất lệch: `bg-[#000000]`, card `#0d0d0d`, teal.

Việc sửa bắt buộc:

- Đổi toàn page sang `PageShell`:
  - Eyebrow `TÀI KHOẢN`
  - Title `Cài Đặt.`
  - Description `Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.`
- Profile section dùng `SurfaceCard` white.
- Password section dùng `SurfaceCard` white.
- Icon tiles neutral.
- PasswordInput styles shared, không dùng dark input.
- Submit button `color="dark"`, radius `xl`.
- Không còn `text-white`, `teal-*`, `bg-black`.

### 6.2. AdminSettingsView

Hiện khá ổn do dùng AdminPageShell.

Việc sửa:

- `SectionCard` đổi sang dùng `SurfaceCard`, `IconTile`.
- Các input dùng shared style.
- Button save/reset black/secondary consistent.

### Acceptance criteria

- `/student/settings`, `/lecturer/settings`, `/admin/change-password` không còn dark theme.
- Admin settings và user settings nhìn cùng hệ.

---

## Phase 7 — Sửa Practice / Quiz

Đây là nhóm lệch mạnh nhất sau Settings.

### Files

- `frontend/src/components/student/practice/student-practice-view.tsx`
- `frontend/src/components/lecturer/practice/practice-view.tsx`
- `frontend/src/components/student/quiz/take-quiz-view.tsx`
- `frontend/src/components/lecturer/quiz/create-quiz-view.tsx`
- `frontend/src/app/[role]/practice/page.tsx`
- `frontend/src/app/[role]/practice/quiz/page.tsx`

### 7.1. StudentPracticeView

Hiện trạng:

- Full dark `bg-[#000000]`.
- Blue/cyan cards, dashboard lab style.
- Không khớp StudyMate documents.

Việc sửa:

- Dùng `PageShell`:
  - Eyebrow `ÔN LUYỆN AI`
  - Title `Luyện Tập.`
  - Description rõ.
- Metric/active modules dùng `MetricCard`/`SurfaceCard`.
- Chart container white card.
- Progress dùng neutral/dark hoặc semantic success.
- Form generate quiz trong `SurfaceCard`.
- Không dùng dark background.

### 7.2. TeacherPracticeView

Hiện trạng:

- Light nhưng vẫn Mantine/default, title sans, tabs basic.

Việc sửa:

- Dùng `PageShell`:
  - Eyebrow `QUIZ INTELLIGENCE`
  - Title `Quản Lý Quiz.`
- Tabs style neutral; nếu Mantine Tabs thì classNames để selected dark/white.
- Stats dùng `MetricCard`.
- Student results table dùng `AppTable`.
- Generate modal dùng shared form style.

### 7.3. TakeQuizView

Hiện trạng:

- Dark `bg-[#0a0a0a]`, teal icon/title/button.
- Quiz list/quiz taking không đồng bộ.

Việc sửa:

- List mode dùng `PageShell` title `Bài Kiểm Tra.`.
- Term/subject selection dùng cards giống lecturer DocumentsView term/subject cards.
- Search input/toolbar dùng `ToolbarCard`.
- Quiz cards dùng `SurfaceCard`, status/difficulty dùng `StatusBadge`.
- Quiz taking view:
  - White page, centered `max-w-4xl`.
  - Header card: progress, question count, timer nếu có.
  - Question card: `SurfaceCard`.
  - Options: white/zinc cards; selected = border `zinc-900`, bg `zinc-50`.
  - Submitted state: correct `emerald`, wrong `red` but restrained.
- Result/history dùng `MetricCard` + `AppTable`.

### 7.4. CreateQuizView

Hiện gần light nhưng style chưa đủ giống reference.

Việc sửa:

- Dùng `PageShell` title `Tạo Quiz.`.
- Main metadata form dùng `SurfaceCard`.
- Each question dùng `SurfaceCard` with header mono `CÂU HỎI 01`.
- Options dùng consistent action icons.
- Success state giống upload success.

### Acceptance criteria

- Không còn dark/teal practice/quiz pages.
- Quiz/practice dùng cùng cards, typography, buttons với documents.

---

## Phase 8 — Admin pages polish

Admin đã khá ổn, phase này chủ yếu giảm duplicate và làm sạch.

### Files

- `frontend/src/components/admin/dashboard/admin-dashboard-view.tsx`
- `frontend/src/components/admin/users/admin-users-view.tsx`
- `frontend/src/components/admin/users/user-table.tsx`
- `frontend/src/components/admin/users/user-modals.tsx`
- `frontend/src/components/admin/assignment/admin-assignments-view.tsx`
- `frontend/src/components/admin/curriculum/admin-curriculum-view.tsx`
- `frontend/src/components/admin/documents/admin-documents-view.tsx`
- `frontend/src/components/admin/metadata/admin-metadata-view.tsx`
- `frontend/src/components/admin/moderation/admin-moderation-view.tsx`
- `frontend/src/components/admin/settings/admin-settings-view.tsx`

### Việc sửa chung

1. Tất cả dùng `PageShell`/`AdminPageShell` thống nhất.
2. Metric cards dùng `MetricCard`.
3. Paper/card đổi sang `SurfaceCard` hoặc class shared.
4. Tables dùng `AppTable` style.
5. Modal forms dùng shared input styles.
6. Button action:
   - Primary: dark.
   - Danger: red subtle/filled chỉ khi xoá.
   - Secondary: gray/zinc.
7. Không dùng random `blue`, `teal` cho primary.

### Trang cụ thể

- Dashboard:
  - Metric cards hiện đẹp, chỉ chuyển sang `MetricCard`.
  - Recent docs table dùng `AppTable`.
- Users:
  - Search card dùng `ToolbarCard`.
  - UserTable style header/rows consistent.
  - Modals match radius 2xl, title serif/section labels.
- Assignment:
  - Lecturer select + subject grid giữ nhưng dùng `SurfaceCard`.
- Curriculum:
  - Subject cards giữ bento nếu có, use shared card/icon.
- Metadata:
  - Tabs neutral; forms cards consistent.
- Moderation:
  - Alert/card/table consistent; danger action rõ.
- Admin documents:
  - Cần đồng bộ với MyDocuments/SharedDocuments, reuse `DocumentCard` hoặc `AppTable`.

### Acceptance criteria

- Admin nhìn cùng style với lecturer documents.
- Code ít copy class hơn.

---

## Phase 9 — Auth polish và finishing

### Files

- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/forgot-password/page.tsx`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/not-found.tsx`

### Việc sửa

- Login giữ custom elegant UI, chỉnh token/typography nhẹ.
- Forgot password match login.
- Loading/root/not-found explicit light.
- Kiểm tra metadata title/description nếu cần.

---

## 7. Thứ tự ưu tiên giao cho Agent

Nếu giao cho Agent làm, nên chia task như sau để ít conflict:

### Task A — Foundation

> Tạo design system UI components trong `frontend/src/components/ui`, sửa global light tokens và Mantine theme. Không refactor page logic.

Files:

- `frontend/src/app/globals.css`
- `frontend/src/app/providers.tsx`
- `frontend/src/components/ui/*`
- `frontend/src/components/layout/admin-page-shell.tsx`

### Task B — Layout + Lecturer documents

> Chuẩn hoá `AppLayout/AdminLayout`, refactor lecturer document pages dùng shared components nhưng giữ visual hiện tại.

Files:

- `frontend/src/components/layout/*`
- `frontend/src/components/lecturer/documents/*`
- `frontend/src/app/[role]/documents/[id]/page.tsx`

### Task C — Documents shared/student/compare

> Đồng bộ toàn bộ document browsing/search/compare pages theo style lecturer documents.

Files:

- `frontend/src/components/common/documents/*`
- `frontend/src/components/student/documents/*`
- route wrappers under `frontend/src/app/[role]/documents/*`

### Task D — Settings

> Xoá dark settings UI, chuyển settings/change-password sang PageShell + SurfaceCard.

Files:

- `frontend/src/components/common/settings/settings-view.tsx`
- `frontend/src/components/admin/settings/admin-settings-view.tsx`

### Task E — Chat + Sessions

> Redesign chat landing/input/messages/document selector và sessions page theo neutral editorial style.

Files:

- `frontend/src/components/common/chat/chat-view.tsx`
- `frontend/src/components/common/chat/sessions-view.tsx`

### Task F — Practice + Quiz

> Xoá dark/teal/blue lab style, redesign practice/quiz student/lecturer pages theo shared components.

Files:

- `frontend/src/components/student/practice/student-practice-view.tsx`
- `frontend/src/components/lecturer/practice/practice-view.tsx`
- `frontend/src/components/student/quiz/take-quiz-view.tsx`
- `frontend/src/components/lecturer/quiz/create-quiz-view.tsx`

### Task G — Admin polish

> Refactor admin dashboard/users/curriculum/assignment/metadata/moderation/documents để dùng shared cards/tables/forms.

Files:

- `frontend/src/components/admin/**/*`

### Task H — Auth/root/not-found polish

> Đồng bộ login/forgot-password/root/not-found với light token và auth card style.

Files:

- `frontend/src/app/(auth)/**/*`
- `frontend/src/app/page.tsx`
- `frontend/src/app/not-found.tsx`

---

## 8. Checklist chi tiết theo page

### `/admin`

Component: `AdminDashboardView`

- [ ] Dùng `PageShell` hoặc `AdminPageShell` wrapper.
- [ ] Metric cards dùng `MetricCard`.
- [ ] Recent docs table dùng `AppTable` style.
- [ ] Refresh button dark primary.

### `/admin/users`

Component: `AdminUsersView`, `UserTable`, `user-modals`

- [ ] Search/filter card dùng `ToolbarCard`.
- [ ] Table header mono uppercase.
- [ ] Role/status badges dùng `StatusBadge`.
- [ ] Modals radius 2xl, input style shared.

### `/admin/assignment`

Component: `AdminAssignmentsView`

- [ ] Main paper thành `SurfaceCard`.
- [ ] Lecturer select/input style shared.
- [ ] Subject cards/checkbox rows consistent.

### `/admin/curriculum`

Component: `AdminCurriculumView`

- [ ] Subject cards dùng `SurfaceCard`/`IconTile`.
- [ ] Add/edit inline forms consistent.
- [ ] Segmented control neutral.

### `/admin/metadata`

Component: `AdminMetadataView`

- [ ] Tabs neutral.
- [ ] Types/languages/sources cards consistent.
- [ ] Modal/form style shared.

### `/admin/moderation`

Component: `AdminModerationView`

- [ ] Alert style not orange-heavy; use restrained warning.
- [ ] Table consistent.
- [ ] Resolve/delete buttons clear semantic.

### `/admin/documents`

Component: `AdminDocumentsView`

- [ ] Align with MyDocuments/SharedDocuments.
- [ ] Reuse `DocumentCard` or `AppTable`.
- [ ] Status/visibility badges shared.

### `/admin/settings`

Component: `AdminSettingsView`

- [ ] SectionCard uses shared components.
- [ ] Forms input styles shared.

### `/lecturer` and `/lecturer/documents`

Component: `DocumentsView`

- [ ] Keep current visual.
- [ ] Refactor cards/empty states to shared components.
- [ ] No logic changes.

### `/lecturer/documents/my`

Component: `MyDocumentsView`

- [ ] Header via `PageShell`.
- [ ] Filter via `ToolbarCard`.
- [ ] Cards via `DocumentCard`.

### `/lecturer/upload`

Component: `UploadView`

- [ ] Keep drag/drop UX.
- [ ] Move repeated Mantine styles to shared helper.
- [ ] Replace `alert()` with notification.

### `/lecturer/documents/edit/[slug]`

Component: `EditDocumentView`

- [ ] Form in `SurfaceCard`.
- [ ] Inputs shared style.
- [ ] Back button secondary consistent.

### `/student/documents` or `/:role/documents`

Component: `StudentDocumentsView`

- [ ] Use `PageShell`.
- [ ] Cards/list table shared.
- [ ] Subject chips neutral.

### `/:role/documents/shared`

Component: `SharedDocumentsView`

- [ ] Use `PageShell`.
- [ ] Keep bento but use shared cards.
- [ ] Search result cards shared.

### `/:role/documents/[id]`

Component: document detail page

- [ ] Keep editorial detail style.
- [ ] Extract subcomponents to reduce 675-line file.
- [ ] Replace alerts.

### `/:role/documents/compare`

Component: `CompareView`

- [ ] Full redesign to PageShell + SurfaceCard.
- [ ] Result display as cards/table with neutral palette.

### `/:role/chat`

Component: `ChatView`

- [ ] Landing hero editorial.
- [ ] Subject cards neutral.
- [ ] Input card polished.
- [ ] Message bubbles/cards neutral.
- [ ] Document selector neutral selected state.

### `/:role/sessions`

Component: `SessionsView`

- [ ] PageShell.
- [ ] Toolbar card.
- [ ] Session list/card neutral.
- [ ] Create modal shared form.

### `/:role/settings` and `/:role/change-password`

Component: `SettingsView`

- [ ] Remove black/teal UI.
- [ ] PageShell + SurfaceCard.
- [ ] Password inputs light.

### `/:role/practice`

Components: `StudentPracticeView`, `TeacherPracticeView`

- [ ] Remove dark student practice.
- [ ] Use MetricCard/SurfaceCard/chart card.
- [ ] Teacher tabs/cards neutral.

### `/:role/practice/quiz`

Components/pages: `TakeQuizView`, `QuizGamificationPage` in route file if still used

- [ ] Remove dark/teal quiz list.
- [ ] Term/subject selection like document hierarchy.
- [ ] Quiz taking UI card-based light.

### Lecturer create quiz

Component: `CreateQuizView`

- [ ] PageShell title `Tạo Quiz.`.
- [ ] Question cards shared.
- [ ] Success state match upload success.

### `/login`

Component: `LoginPage`

- [ ] Keep current elegant card.
- [ ] Minor token/font consistency.

### `/forgot-password`

Component: `ForgotPasswordPage`

- [ ] Make it visually match login.

### `not-found`

- [ ] Light neutral explicit.

---

## 9. Những chỗ cần tránh

- Không rewrite business hooks trong `frontend/src/hooks/**` nếu chỉ sửa UI.
- Không đổi API calls trong `frontend/src/api/**` nếu không cần.
- Không thêm màu primary mới kiểu teal/blue làm theme chính.
- Không copy/paste thêm inline Mantine styles dài; đưa vào helper.
- Không dùng `alert()` cho UX mới; dùng notification/toast.
- Không làm dark mode nửa vời. Nếu muốn dark mode thì làm sau, có token riêng.
- Không đổi flow điều hướng/permission role khi chỉ refactor UI.

---

## 10. Verification sau mỗi task

Sau mỗi nhóm task, chạy:

```bash
cd frontend
pnpm lint
pnpm build
```

Manual check tối thiểu:

1. Login / forgot password.
2. Redirect `/` theo role.
3. Admin dashboard + users + một modal.
4. Lecturer documents hierarchy + my documents + upload + document detail.
5. Student shared documents + document detail.
6. Chat landing + chat session + document selector.
7. Settings/change password.
8. Practice + quiz list/take quiz.

Nếu chưa có data backend, kiểm tra empty/loading states bằng mock hoặc trạng thái rỗng hiện tại.

---

## 11. Definition of Done

UI refactor được coi là xong khi:

- Toàn app dùng nền light/zinc thống nhất.
- Không còn page chính nào dùng black/dark/teal/blue style lạc hệ, trừ semantic badge hoặc info state.
- Header/page title cùng pattern eyebrow + serif title + description.
- Cards/tables/forms/modals dùng component shared hoặc cùng class pattern.
- Lecturer documents vẫn giữ được chất lượng hiện tại.
- Settings/practice/quiz/chat nhìn cùng một sản phẩm với documents.
- Build/lint pass.
- Không thay đổi logic nghiệp vụ ngoài UI/UX cần thiết.
