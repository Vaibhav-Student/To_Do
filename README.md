# ToDo List App

A minimalist black and white themed ToDo list application built with React and Vite.

## Features

- ✅ Add new tasks with rich details
- ✅ Mark tasks as complete/incomplete
- ✅ Delete tasks
- ✅ Filter tasks (All, Active, Completed)
- ✅ Priority levels (Low, Medium, High)
- ✅ Categories and tags
- ✅ Due dates with calendar picker
- ✅ Task notes and descriptions
- ✅ Multiple lists management
- ✅ User profile and settings
- ✅ **📦 Data Management - Import/Export to Excel (.xlsx)**
- ✅ Persistent storage (IndexedDB)
- ✅ Responsive design
- ✅ Clean black & white theme

## 🆕 Data Management Feature

**Import and Export your tasks in Excel format!**

### Export
- Download tasks as Excel (.xlsx) files
- Choose to export: All tasks, Active only, or Completed only
- Includes all task data: titles, notes, priorities, due dates, categories, tags, and more
- Automatic timestamped filenames

### Import
- Upload Excel (.xlsx) files to import tasks
- Two modes: **Merge** (add to existing) or **Replace** (replace all)
- Preview before importing
- Automatic validation and error handling

📖 **Full Documentation:**
- [Data Management User Guide](./DATA_MANAGEMENT_GUIDE.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Excel Template Info](./EXCEL_TEMPLATE_INFO.md)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technology Stack

- React 18
- Vite 5
- Dexie.js (IndexedDB wrapper)
- xlsx (SheetJS) - Excel file operations
- CSS3 (Custom styling)
- IndexedDB for data persistence
