# Quick Reference - Data Management

## 🎯 Where to Find It
**Settings Page** → **📦 Data Management Section**

## 📤 Export Quick Guide

### Steps:
1. Click Settings (⚙️) in left sidebar
2. Scroll to "📦 Data Management"
3. Choose filter:
   - 📋 All Tasks
   - ⭕ Active Only  
   - ✅ Completed Only
4. Click "⬇️ Download Excel File"
5. Done! File downloads as `todo-backup-YYYY-MM-DD.xlsx`

### What's Exported:
- Task Title
- Description/Notes
- Status (Active/Completed)
- Priority (Low/Medium/High)
- Due Date
- Category
- List Name
- Tags
- Created Date

## 📥 Import Quick Guide

### Steps:
1. Click Settings (⚙️)
2. Go to "📦 Data Management"
3. Choose mode:
   - 🔗 **Merge** (adds to existing - SAFE)
   - 🔄 **Replace** (deletes all first - CAREFUL!)
4. Click "⬆️ Choose Excel File (.xlsx)"
5. Select your .xlsx file
6. Review preview:
   - Shows task count
   - Shows sample tasks
   - Shows mode
7. Click "✅ Confirm Import"
8. Done! Tasks imported successfully

### Excel Requirements:
- **Must have**: "Task Title" column
- **Format**: .xlsx only
- **Optional columns**: Description, Status, Priority, Due Date, Category, List Name, Tags

## ⚠️ Important Notes

### Before Replace Mode:
- **BACKUP FIRST** - Export your current tasks!
- Confirms before deleting
- Cannot be undone

### Import Tips:
- Use Merge mode by default (safer)
- Check preview before confirming
- Empty rows are skipped
- Invalid data uses defaults

## 🆘 Troubleshooting

### "Invalid file format"
→ Use .xlsx format only (not .xls or .csv)

### "Missing required column"
→ Excel must have "Task Title" column (case-sensitive)

### "No valid tasks found"
→ Make sure "Task Title" has at least one row with text

### Categories/Lists not matching
→ Names must exactly match existing ones in app

## 💡 Common Use Cases

### Weekly Backup
1. Export "All Tasks"
2. Save to your backup folder
3. Done!

### Share Tasks
1. Export specific tasks
2. Share Excel file
3. Recipient imports

### Bulk Edit
1. Export to Excel
2. Edit in Excel
3. Import back with Replace mode

### Clean Start
1. Export current tasks (backup!)
2. Import with Replace mode
3. Fresh database with imported tasks

---

**Need more help?** See `DATA_MANAGEMENT_GUIDE.md` for detailed documentation.
