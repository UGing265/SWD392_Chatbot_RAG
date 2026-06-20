# Implementation Plan: Administrative Interface Aesthetic Refinement

This plan details the visual refactoring of the StudyMate administrative interfaces to transition from standard SaaS-style components to a premium **Minimalist Scholarly** design system.

---

## 1. Aesthetic Enhancements & Visual Direction

| Current SaaS Design | Refactored Minimalist Scholarly Design |
| :--- | :--- |
| Colorful icon containers / badges | Neutral tone indicators, elegant status dots, thin borders |
| Heavy dropshadows | Flat surfaces with crisp 1px borders and minimal ambient depth |
| Generic sans-serif headers | Academic `Newsreader` (Crimson Pro) serif headers |
| Inconsistent layout structures | Grid lines, white surface panels, streamlined headers |

---

## 2. Detailed Component Actions

### Phase 1: Layout & Navigation (`AdminLayout`)
* **Sidebar Styling:**
  * Transition sidebar background to a pure white/black canvas (`bg-white dark:bg-[#0c0c0e]`) with a crisp `border-r border-border`.
  * Clean up user profile button: replace colorful background initials container with a high-contrast minimalist shape or text label.
* **Header Optimization:**
  * Move the Notification Bell to the right side of the main header, next to the "Admin workspace" indicator.
  * Streamline the "Admin workspace" pill to use thin borders, clean typography, and a subtle pulsating dot.

### Phase 2: Main Dashboard View (`AdminDashboardView`)
* **Typography:** Style headers with `font-serif italic font-normal`.
* **Metrics Bento Grid:**
  * Simplify cards to a pure white surface with 1px border.
  * Remove colorful container background from icons; use clean monochrome icons with subtle status borders.
* **Recent Documents Table:**
  * Replace the status badge (e.g., `completed`, `pending`) with a pulsing/solid dot indicator and small metadata label.

### Phase 3: User Management Table (`UserTable` & `AdminUsersView`)
* **Typography & Spacing:** Style titles with Crimson Pro.
* **Status Indicators:** Replace the status `Badge` (green/red background) with a clean dot indicator (pulsing green for active, red for blocked).
* **Borders:** Set table container paper to use thin 1px borders.

### Phase 4: Curriculum & Moderation (`AdminCurriculumView` & `AdminModerationView`)
* **Academic Term Cards:** Replace the dashed/colored panels with clean white panels using thin borders.
* **Moderation Table:**
  * Replace badge elements for "Lý do" (reason) and "Môn học" (subject) with simple text or thin-outline markers.
  * Convert headers to Crimson Pro.

### Phase 5: Global Font Mappings (`globals.css`)
* Map `@theme inline` typography keys (`--font-sans` and `--font-serif`) to read Next.js injected font variables (`var(--font-sans)` and `var(--font-serif)`) so that Tailwind classes like `font-sans` and `font-serif` utilize the correct fonts.

---

## 3. Verification & Testing

* Log in as admin (`admin@studymate.edu.vn` / `123456789`).
* Navigate through the pages (`/admin`, `/admin/users`, `/admin/assignment`, `/admin/curriculum`, `/admin/moderation`).
* Run the browser subagent to capture screenshots and confirm that contrast, borders, and typography render beautifully.
