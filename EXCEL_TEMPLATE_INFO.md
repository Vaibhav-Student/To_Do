# Excel Import Template

This document describes the structure for importing tasks into the ToDo app.

## Required Column

- **Task Title** (required) - The main task description. Cannot be empty.

## Optional Columns

All other columns are optional. If not provided, default values will be used.

- **Description / Notes** - Additional details about the task
- **Status** - Either "Active" or "Completed" (default: Active)
- **Priority** - "Low", "Medium", or "High" (default: Medium)
- **Due Date** - Any valid date format (e.g., 1/31/2026, 2026-01-31)
- **Category** - Category name (must match existing category in app)
- **List Name** - List name (must match existing list in app)
- **Tags** - Comma-separated tags (e.g., "work, urgent, review")
- **Created Date** - When the task was created (informational)

## Notes

- Column headers are case-sensitive and must match exactly
- Empty rows will be skipped automatically
- If List Name doesn't exist, task will be added to default list
- If Category doesn't exist, task will have no category
- Invalid dates will be ignored
- Invalid priority values will default to "Medium"

## Sample Data

```csv
Task Title,Description / Notes,Status,Priority,Due Date,Category,List Name,Tags,Created Date
Review project proposal,Add final comments and submit,Active,High,2/15/2026,Work,Projects,"urgent, review",1/25/2026
Buy groceries,Milk eggs bread and fruits,Active,Medium,2/1/2026,Personal,Shopping,home,1/30/2026
Finish Q4 report,Complete sales analysis,Completed,High,1/30/2026,Work,Reports,completed,1/20/2026
Call dentist,Schedule annual checkup,Active,Low,2/10/2026,Health,Personal,health,1/28/2026
Update documentation,Add new features to README,Active,Medium,2/5/2026,Work,Projects,"docs, maintenance",1/29/2026
```

## Tips

1. **Use Excel formulas** to generate repetitive data
2. **Copy from existing export** to ensure correct format
3. **Test with small file** before importing large datasets
4. **Keep backup** of your data before using Replace mode
5. **Match existing data** for Categories and Lists for proper linking
