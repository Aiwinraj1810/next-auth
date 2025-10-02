# ⏱️ Timesheet Tracker

This project is a **Timesheet Management Dashboard** built as part of an interview assignment.  
It allows users to log, view, and manage weekly work entries in a simple and intuitive UI.  

---

## 🚀 Features

- **Authentication (dummy for now)** → login with email/password, session handling.  
- **Dashboard** → view all weekly timesheets with status:
  - ✅ Completed  
  - ⚠️ Incomplete  
  - ❌ Missing  
- **Filters** → filter timesheets by:
  - Date range (calendar picker)  
  - Status (Completed, Incomplete, Missing)  
- **CRUD Tasks** → add, edit, and delete work entries for a given week.  
- **Weekly Breakdown** → detailed view of tasks for each day of a week.  
- **Responsive UI** → works seamlessly on desktop, tablet, and mobile.  
- **Reusable Components** built with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS.  

---

## 🛠️ Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/)  
- [TypeScript](https://www.typescriptlang.org/)  
- [React Query](https://tanstack.com/query/latest) (data fetching & caching)  
- [shadcn/ui](https://ui.shadcn.com/) (UI components)  
- [Tailwind CSS](https://tailwindcss.com/) (styling)  
- [Axios](https://axios-http.com/) (API requests)  
- [date-fns](https://date-fns.org/) (date handling)  

---

## 📂 Project Structure

src/app
├── (protected) # Protected routes with shared header/footer
│ ├── dashboard # Timesheet overview
│ │ ├── columns.tsx
│ │ ├── data-table.tsx
│ │ ├── lib/
│ │ │ └── timesheet-helpers.ts
│ │ └── page.tsx
│ └── week-info # Weekly breakdown
│ └── [id]/
│ └── page.tsx
│
├── api # API route handlers
│ ├── auth/
│ │ └── [...nextauth]/route.ts # NextAuth config
│ ├── timesheet-entries/
│ │ ├── [id]/route.ts # CRUD for single entry
│ │ └── route.ts # CRUD for entries collection
│ └── timesheets/
│ └── route.ts # CRUD for timesheets
│
├── components # Shared & reusable components
│ ├── AddEntryModal.tsx
│ ├── AddTaskModal.tsx
│ ├── DeleteConfirmationModal.tsx
│ ├── TaskModal.tsx
│ ├── sign-in-button.tsx
│ ├── sign-in-form.tsx
│ └── sign-out-button.tsx
│
├── globals.css # Global styles
├── layout.tsx # Root layout
└── page.tsx # Login page


---

### 🔑 Notes for Interviewer
- `api/auth/[...nextauth]/route.ts` → Handles authentication with **NextAuth**.  
- `api/timesheets/route.ts` → Timesheet collection (list, create).  
- `api/timesheet-entries/route.ts` → CRUD for multiple entries.  
- `api/timesheet-entries/[id]/route.ts` → CRUD for single entry.  




---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Aiwinraj1810/next-auth.git
cd next-auth


npm install
# or
yarn install


NEXT_PUBLIC_API_URL=http://localhost:3000/api


(For this assignment, a dummy backend is mocked using Axios.)

npm run dev
# or
yarn dev


The app will be available at http://localhost:3000

🧪 Demo Credentials

Email: username@example.com

Password: password123

(Dummy authentication for interview purposes only)


📌 Assumptions / Notes

Authentication is handled with NextAuth.js using Credentials and GitHub Provider.

Credentials login is hardcoded (test@example.com / password123) for demo purposes.

GitHub login requires a GITHUB_ID and GITHUB_SECRET in .env.local.

Database/API endpoints are mocked using Next.js API routes (/api/timesheets, /api/timesheet-entries).

In a real production scenario, these would connect to a persistent database (e.g., MongoDB).

Each "Timesheet" represents one week, and tasks can only be assigned within the given week's range (start → end).

Form validation is done using react-hook-form, with clear error messages for required fields.

UI components use shadcn/ui, with additional responsiveness for mobile and tablet breakpoints.

Hours input uses a counter style increment/decrement control instead of free-text input, to reduce errors.

Logout is implemented via NextAuth’s signOut() method, shown in the user popover.

⏳ Time Spent

Project setup (Next.js, Tailwind, NextAuth, shadcn/ui): ~1.5 hours

Authentication (Credentials + GitHub): ~1 hour

Dashboard with DataTable (filters, pagination, responsiveness): ~2 hours

Task/Entry Modals (Add/Edit/Delete with validation): ~2.5 hours

Week info page (daily breakdown, progress bar, responsive layout): ~1 hour

Styling, polish, bug fixes, README: ~1.5 hours

Total: ~9.5 hours
