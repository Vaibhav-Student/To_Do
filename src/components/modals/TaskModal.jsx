import { formatDateDisplay, formatTimeDisplay } from '../../utils/dateUtils';
import { TAG_COLORS, PRIORITY_COLORS } from '../../constants/colors';

/**
 * TaskModal Component
 * Reusable modal for adding and editing tasks
 * Mode determined by 'mode' prop: 'add' or 'edit'
 */
function TaskModal({
    mode = 'add', // 'add' or 'edit'
    isOpen,
    onClose,
    onSubmit,
    // Task data
    taskText,
    setTaskText,
    taskNotes,
    setTaskNotes,
    taskPriority,
    setTaskPriority,
    taskDueDate,
    setTaskDueDate,
    taskDueTime,
    setTaskDueTime,
    taskTags,
    setTaskTags,
    taskCategory,
    setTaskCategory,
    // Tag input
    tagInput,
    setTagInput,
    onAddTag,
    onRemoveTag,
    onTagKeyDown,
    // Categories
    categories,
    onOpenCategoryManager,
    // Key handler
    onKeyDown
}) {
    if (!isOpen) return null;

    const isAddMode = mode === 'add';
    const title = isAddMode ? 'Add New Task' : 'Edit Task';
    const submitText = isAddMode ? 'Add Task' : 'Save Changes';

    // Tag suggestions
    const tagSuggestions = ['Work', 'Personal', 'Urgent', 'Meeting', 'Ideas'].filter(s =>
        !taskTags.some(t => t.name === s)
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    {/* Task Description */}
                    <div className="form-group">
                        <label className="form-label">Task Description</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="What do you need to do?"
                            value={taskText}
                            onChange={(e) => setTaskText(e.target.value.slice(0, 150))}
                            onKeyDown={onKeyDown}
                            maxLength={150}
                            autoFocus
                        />
                        <div className={`char-counter ${taskText.length >= 140 ? 'warning' : ''} ${taskText.length >= 150 ? 'limit' : ''}`}>
                            {taskText.length}/150
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                            className="form-input form-textarea"
                            placeholder="Add additional details or context..."
                            value={taskNotes}
                            onChange={(e) => setTaskNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Due Date & Time */}
                    <div className="form-group">
                        <label className="form-label">Due Date & Time (Optional)</label>
                        <div className="datetime-inputs">
                            <div className={`datetime-field ${taskDueDate ? 'has-value' : ''}`}>
                                <div className="datetime-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <input
                                    type="date"
                                    className="datetime-input"
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <span className="datetime-placeholder">{formatDateDisplay(taskDueDate)}</span>
                            </div>
                            <div className={`datetime-field ${taskDueTime ? 'has-value' : ''}`}>
                                <div className="datetime-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <input
                                    type="time"
                                    className="datetime-input"
                                    value={taskDueTime}
                                    onChange={(e) => setTaskDueTime(e.target.value)}
                                />
                                <span className="datetime-placeholder">{formatTimeDisplay(taskDueTime)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <div className="priority-options">
                            <button
                                className={`priority-option ${taskPriority === 'low' ? 'active' : ''}`}
                                onClick={() => setTaskPriority('low')}
                                style={{ '--priority-color': PRIORITY_COLORS.low }}
                            >
                                <span className="priority-dot" style={{ backgroundColor: PRIORITY_COLORS.low }} />
                                Low
                            </button>
                            <button
                                className={`priority-option ${taskPriority === 'medium' ? 'active' : ''}`}
                                onClick={() => setTaskPriority('medium')}
                                style={{ '--priority-color': PRIORITY_COLORS.medium }}
                            >
                                <span className="priority-dot" style={{ backgroundColor: PRIORITY_COLORS.medium }} />
                                Medium
                            </button>
                            <button
                                className={`priority-option ${taskPriority === 'high' ? 'active' : ''}`}
                                onClick={() => setTaskPriority('high')}
                                style={{ '--priority-color': PRIORITY_COLORS.high }}
                            >
                                <span className="priority-dot" style={{ backgroundColor: PRIORITY_COLORS.high }} />
                                High
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <div className="category-selector">
                            <button
                                className={`category-option ${taskCategory === null ? 'active' : ''}`}
                                onClick={() => setTaskCategory(null)}
                            >
                                <span className="category-option-icon">📋</span>
                                <span>None</span>
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-option ${taskCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setTaskCategory(cat.id)}
                                    style={{ '--cat-color': cat.color }}
                                >
                                    <span className="category-option-icon">{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                            <button
                                className="category-option add-category-btn"
                                onClick={onOpenCategoryManager}
                                title="Manage Categories"
                            >
                                <span className="category-option-icon">⚙️</span>
                                <span>Manage</span>
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="form-group">
                        <label className="form-label">Tags (Optional)</label>
                        <div className="tags-input-container">
                            {taskTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="tag-chip"
                                    style={{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }}
                                >
                                    {tag.name}
                                    <button
                                        className="tag-remove"
                                        onClick={() => onRemoveTag(tag.name)}
                                        style={{ color: tag.color }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                className="tag-input"
                                placeholder={taskTags.length === 0 ? 'Type and press Enter...' : ''}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={onTagKeyDown}
                                onBlur={onAddTag}
                            />
                        </div>
                        <div className="tag-suggestions">
                            {tagSuggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    className="tag-suggestion"
                                    onClick={() => {
                                        const color = TAG_COLORS[(taskTags.length + i) % TAG_COLORS.length];
                                        setTaskTags([...taskTags, { name: suggestion, color }]);
                                    }}
                                >
                                    + {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-add"
                        onClick={onSubmit}
                        disabled={!taskText.trim()}
                    >
                        {submitText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskModal;
