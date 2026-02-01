# 📦 Data Management Feature - User Guide

## Overview
The Data Management feature allows you to **import and export** your tasks in Excel format (.xlsx), making it easy to backup your data, migrate between devices, or edit tasks in bulk using Excel.

## 🎯 Features

### 📤 Export to Excel
Export your tasks to a professionally formatted Excel file with comprehensive task information.

#### Export Options:
1. **📋 All Tasks** - Export every task in your database
2. **⭕ Active Only** - Export only incomplete tasks
3. **✅ Completed Only** - Export only completed tasks

#### Excel File Structure:
Each exported Excel file includes the following columns:
- **Task Title** - The main task description
- **Description / Notes** - Additional notes and details
- **Status** - Active or Completed
- **Priority** - Low, Medium, or High
- **Due Date** - Task deadline (if set)
- **Category** - Category assignment (Work, Personal, etc.)
- **List Name** - Which list the task belongs to
- **Tags** - Comma-separated tags
- **Created Date** - When the task was created

#### File Naming:
- Format: `todo-backup-[filter]-YYYY-MM-DD.xlsx`
- Examples:
  - `todo-backup-2026-01-31.xlsx` (all tasks)
  - `todo-backup-active-2026-01-31.xlsx` (active only)
  - `todo-backup-completed-2026-01-31.xlsx` (completed only)

### 📥 Import from Excel

Import tasks from an Excel file with validation and preview capabilities.

#### Import Modes:

1. **🔗 Merge Mode** (Recommended)
   - Adds imported tasks to existing tasks
   - Safe - keeps all current data
   - Best for importing additional tasks

2. **🔄 Replace Mode** (Use with caution)
   - Deletes ALL existing tasks
   - Replaces with imported tasks
   - Shows warning confirmation before proceeding
   - Best for fresh start or complete restore

#### Import Process:

1. **File Selection**
   - Click "Choose Excel File (.xlsx)"
   - Select your .xlsx file
   - Only .xlsx format is accepted

2. **Validation**
   - Checks for required "Task Title" column
   - Ignores empty rows
   - Shows error if format is invalid

3. **Preview**
   - Shows total number of tasks found
   - Displays first 5 sample task titles
   - Shows selected import mode
   - Warning if Replace mode selected

4. **Confirmation**
   - Review the preview
   - Click "Confirm Import" to proceed
   - Or "Cancel" to abort

#### Excel File Requirements:

**Required Column:**
- `Task Title` - Must be present and contain text

**Optional Columns:**
- `Description / Notes` - Task details
- `Status` - "Active" or "Completed"
- `Priority` - "Low", "Medium", or "High"
- `Due Date` - Any valid date format
- `Category` - Category name (must match existing categories)
- `List Name` - List name (must match existing lists)
- `Tags` - Comma-separated tags
- `Created Date` - Date information (optional)

**Notes:**
- Column names are case-sensitive
- Missing optional columns will use default values
- Unknown categories/lists will use defaults
- Empty rows are automatically skipped

## 📝 Usage Examples

### Example 1: Backup All Tasks
1. Go to Settings page (⚙️ icon in sidebar)
2. Scroll to "📦 Data Management" section
3. Keep "All Tasks" selected
4. Click "⬇️ Download Excel File"
5. File automatically downloads to your Downloads folder

### Example 2: Export Active Tasks for Planning
1. Navigate to Data Management in Settings
2. Click "⭕ Active Only" filter button
3. Click "⬇️ Download Excel File"
4. Open in Excel to plan and prioritize tasks

### Example 3: Import Tasks from Excel
1. Prepare an Excel file with "Task Title" column
2. Go to Data Management section
3. Choose "🔗 Merge" mode (to keep existing tasks)
4. Click "⬆️ Choose Excel File (.xlsx)"
5. Select your file
6. Review the preview showing task count
7. Click "✅ Confirm Import"
8. Success! Tasks are now in your app

### Example 4: Complete Data Restore
1. Go to Data Management
2. Select "🔄 Replace" mode
3. Click "⬆️ Choose Excel File (.xlsx)"
4. Select your backup file
5. Review preview
6. Confirm the warning about deleting existing tasks
7. Click "✅ Confirm Import"
8. All old tasks replaced with backup data

## 🔒 Data Safety

### Best Practices:
- **Regular Backups**: Export your tasks weekly
- **Test First**: Try importing with a small test file first
- **Use Merge Mode**: Safer than Replace mode
- **Verify Preview**: Always check the preview before confirming
- **Keep Backups**: Store exported files in a safe location

### What Happens During Import:
- **Merge Mode**: Imported tasks are ADDED to existing tasks
- **Replace Mode**: ALL existing tasks are DELETED first, then imported tasks are added
- Invalid rows are skipped (logged to console)
- Success message shows how many tasks were imported

## 🎨 UI Features

### Visual Feedback:
- ✅ Success toast notifications
- ❌ Error messages for invalid files
- ⚠️ Warning for destructive operations
- 📊 Preview statistics before import

### Responsive Design:
- Works on desktop and mobile
- Touch-friendly buttons
- Adaptive layouts for small screens

### Accessibility:
- Clear icons and labels
- Color-coded status indicators
- Descriptive button text
- Confirmation dialogs

## 🛠️ Troubleshooting

### "Invalid file format" error
**Solution**: Make sure the file is .xlsx format (not .xls or .csv)

### "Missing required column" error
**Solution**: Your Excel file must have a column named "Task Title" (case-sensitive)

### "No valid tasks found" error
**Solution**: Ensure your "Task Title" column has at least one row with text

### Import doesn't include categories/lists
**Solution**: Category and List names must exactly match existing ones in your app

### Dates not importing correctly
**Solution**: Use standard date formats in Excel (MM/DD/YYYY or YYYY-MM-DD)

### Tags not showing up
**Solution**: Make sure tags are comma-separated in the Excel file

## 💡 Pro Tips

1. **Bulk Editing**: Export tasks to Excel, edit multiple tasks at once, then import back
2. **Sharing**: Export tasks and share the Excel file with team members
3. **Templates**: Create Excel templates with your common task structures
4. **Archiving**: Keep monthly exports as historical archives
5. **Migration**: Easy way to move tasks between different installations
6. **Data Analysis**: Use Excel's features to analyze your task patterns
7. **Filtering**: Export specific task types, work on them in Excel, then merge back

## 📊 Technical Details

### Dependencies:
- **xlsx** library (SheetJS) - For Excel file operations
- React 18+ - Component framework
- Dexie.js - IndexedDB wrapper for storage

### Data Storage:
- Tasks stored in IndexedDB via Dexie
- No server required - all data is local
- Import/export happens entirely in the browser

### Browser Support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with IndexedDB support

### File Size Limits:
- Export: No practical limit (tested with 10,000+ tasks)
- Import: Browser memory dependent (typically 1,000+ tasks no problem)

## 🎓 Example Excel Template

Here's a sample structure you can use:

```
Task Title              | Description        | Status    | Priority | Due Date   | Category | List Name | Tags
------------------------|--------------------|-----------|---------|-----------|---------|-----------|---------
Review project proposal | Add final comments | Active    | High    | 2/15/2026 | Work    | Projects  | urgent,review
Buy groceries          | Milk, eggs, bread  | Active    | Medium  | 2/1/2026  | Personal| Shopping  | home
Finish report          | Q4 sales analysis  | Completed | High    | 1/30/2026 | Work    | Reports   | completed
```

## 🆘 Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify your Excel file structure matches requirements
3. Try with a smaller test file first
4. Make sure columns are spelled correctly (case-sensitive)

---

**Happy Task Managing! 🚀**
