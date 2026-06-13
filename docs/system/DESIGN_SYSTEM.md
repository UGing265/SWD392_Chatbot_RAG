# StudyMate RAG Chatbot - Frontend Design System

This document defines the visual guidelines, typography, colors, layout rules, and interaction patterns for the StudyMate Frontend. All UI code must conform strictly to these design tokens, decoupled architectural rules, and Mantine v7+ configurations.

---

## 1. Visual Direction & Style Match
*   **Design Personality:** **AI-Native + Academic Scholarly**. Focuses on highly readable educational content, ambient gradients, card layouts, and responsive panels.
*   **Aesthetic Principle:** Clean white surface panels on a minimalist light gray/white background, accented by a high-contrast monochrome design system (using black primary buttons for a premium editorial feel).

---

## 2. Design Tokens

### 2.1. Color Palette (HSL & Hex Mapping)
We prioritize high-contrast, professional shades suited for long academic reading sessions.

| Role | Variable / Property | Hex Code / Value | Purpose |
|:---|:---|:---|:---|
| **Primary Action** | `color="dark"` | Solid Black / Slate-900 | Primary buttons (Add, Save, Submit, Next) for a premium minimalist aesthetic |
| **Accent / Branding** | `color="blue"` / `--primary` | `#0EA5E9` (Sky-500) | Active tabs, brand headers, processing badges, loader indicators |
| **Secondary Action** | `color="gray"` / `variant="subtle"` | Gray | Cancel buttons, reset actions, secondary navigation |
| **Destructive Action** | `color="red"` | Red | Delete user, block account, reject document, delete data |
| **Background** | `var(--mantine-color-body)` | `#FFFFFF` (White) | App workspace background |
| **Card Surface** | -- | `#FFFFFF` | Form fields, data cards, chat box, tables |
| **Text Primary** | `var(--mantine-color-text)` | `#0F172A` (Slate-900) | Title, body text, readable content |
| **Text Muted** | `var(--mantine-color-dimmed)` | `#475569` (Slate-600) | Secondary descriptions, file metadata |

### 2.2. Typography (Google Fonts Integration)
*   **Headings & Body UI Text:** `Plus Jakarta Sans` (A modern, clean, geometric sans-serif font for maximum legibility and UI visual quality. Loaded in `layout.tsx` and mapped to Mantine via `var(--font-sans)`).
*   **Secondary/Research Text:** `Newsreader` (A premium serif font for academic/research papers, used via the `.font-serif` utility class).
*   **Monospace/Code:** `JetBrains Mono` (For JSON data views, configurations, and logs).
*   **Line-Height:** 1.6 - 1.75 for reading lists, 1.5 for UI buttons and menus.

### 2.3. Borders & Shadows
*   **Border Radius:** 
    *   `lg` (12px) for buttons, input fields, table container paper, and small cards (for a soft, modern, premium aesthetic).
    *   `2xl` (16px) for modals and main sidebar panels.
*   **Shadows:** Soft ambient shadows (`--shadow-soft` in globals.css) to raise surface cards off the background.

---

## 3. Component Guidelines (Mantine v7+)

### 3.1. Tables (Mantine `Table`)
*   All data list views (Users, Curriculum, Documents) must use Mantine `Table`.
*   Striped and highlight-on-hover properties should be active.
*   Tables must be wrapped inside a `Table.ScrollContainer` to ensure responsiveness on mobile devices.

### 3.2. Forms & Inputs (Mantine `TextInput`, `PasswordInput`, `Select`)
*   Forms must use `@mantine/form` or `react-hook-form` validation.
*   Required inputs must display the asterisks (`withAsterisk`).
*   Disable submit buttons and show a loading spinner (e.g., Mantine `Loader`) during async submissions.
*   **Strict rule:** Always use `radius="lg"` for all form inputs and action buttons.

### 3.3. Dialogs & Modals (Mantine `Modal`)
*   All dialog operations (creating user, editing subject, document upload) must use Mantine `<Modal centered radius="2xl">`.
*   A backdrop blur (`overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}`) must be applied to focus visual attention on the modal contents.

### 3.4. Icons (Tabler Icons or Lucide React)
*   **Strict rule:** Do NOT use raw emoji characters as icons (e.g., 🎨, 🚀, ⚙️).
*   Use `@tabler/icons-react` consistently (e.g. `IconSearch`, `IconLock`, `IconPlus`).
*   Icon sizes: Standard size is `16` or `18` pixels (`size={18}`).

---

## 4. RAG Chat Interface UX Spec

To deliver a premium conversational interface:
1.  **Typing Indicator:** When Gemini is generating an answer, display an animated 3-dot pulse loading state.
2.  **Streaming Text Reveal:** Render responses dynamically. Respect `prefers-reduced-motion` settings.
3.  **Citations & Sources:** 
    *   Citations must be clickable badge chips (e.g., `[1]`, `[2]`).
    *   Clicking a citation must slide in a drawer or open a modal containing the exact text chunk extracted from the document source.
4.  **Auto Scroll:** The chat container must automatically scroll to the bottom when new message tokens arrive, but allow the user to pause auto-scroll if they scroll up manually.

---

## 5. Frontend Architecture & Folder Conventions
To ensure strict architectural separation of concerns and maintainability:
1.  **Routing (`app/`)**: Handles page routing and layouts. Must not contain direct API fetches or business logic.
2.  **Presentation (`components/`)**: Pure UI/UX component rendering. Standardized to use Mantine and custom Tailwind classes. Decoupled from state management.
3.  **Logic Hook (`hooks/`)**: Contains page states, form submissions, queries/mutations, and state synchronization. Calls API services.
4.  **API Services (`api/`)**: Declares types and executes network requests (using `axios` or standard fetch, attaching authorization tokens). No UI rendering.

*Note: Component files must be kept clean and focused. Prefer small files (ideally under 200 lines).*

---

## 6. UI/UX Pre-Delivery Checklist
All UI code changes must be verified against this checklist before code review:
- [ ] No emojis are used as system icons.
- [ ] Every clickable card/button has `cursor-pointer`.
- [ ] Active transitions take between `150ms` and `300ms`.
- [ ] Font size for body text is at least `16px` on mobile layouts.
- [ ] Light-mode text contrast is a minimum of 4.5:1 (Slate-600 to Slate-900).
- [ ] Element boundaries are responsive down to 375px without horizontal browser scroll.
- [ ] Focus rings are visible for users navigating using keyboard Tab.

---

## 7. AI & Agent Guardrail Rules (Mandatory)
*   **Mandatory Reading:** Every AI assistant modifying or creating UI components in this repository MUST read and strictly adhere to this Design System.
*   **Guardrails against custom styling:** If the user requests styling that deviates from this design system (e.g., custom accent colors, non-standard layout patterns, or changing primary button colors to anything other than `dark`/Slate-900), the AI **MUST** halt and warn the user, asking for confirmation:
    > "Hệ thống đang yêu cầu màu sắc/kiểu dáng theo quy chuẩn của DESIGN_SYSTEM.md, bạn có chắc chắn muốn thay đổi không? Nếu muốn đổi, vui lòng mở Zalo lên hỏi Cota (Designer/Leader) và chụp màn hình gửi cho Cota duyệt trước nhé!"