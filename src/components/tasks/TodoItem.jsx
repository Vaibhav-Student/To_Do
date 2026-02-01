import { formatDueDate, formatLastUpdated, getTaskAgeLabel, isOverdue } from '../../utils/dateUtils';
import { getPriorityColor } from '../../constants/colors';

/**
 * TodoItem Component
 * Renders a single task item with all its metadata and actions
 */
function TodoItem({
    todo,
    index,
    isCompleted = false,
    categories,
    onToggle,
    onToggleStar,
    onEdit,
    onDelete
}) {
    // Get category by ID
    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const ageLabel = getTaskAgeLabel(todo.updatedAt, todo.createdAt);
    const category = todo.categoryId ? getCategoryById(todo.categoryId) : null;

    return (
        <li
            className={`todo-item ${isCompleted ? 'completed' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div
                className="priority-indicator"
                style={{ backgroundColor: getPriorityColor(todo.priority) }}
                title={`${todo.priority || 'medium'} priority`}
            />
            <div
                className={`checkbox ${isCompleted ? 'checked' : ''}`}
                onClick={() => onToggle(todo.id)}
            >
                {isCompleted && <span className="check-icon">✓</span>}
            </div>
            <div className="todo-content">
                <span className="todo-text">{todo.text}</span>
                {todo.notes && (
                    <p className="todo-notes">{todo.notes}</p>
                )}
                <div className="todo-meta">
                    {ageLabel && (
                        <span className={`task-age-badge ${ageLabel.className}`}>
                            {ageLabel.emoji} {ageLabel.label}
                        </span>
                    )}
                    <span
                        className="priority-badge"
                        style={{
                            color: getPriorityColor(todo.priority),
                            borderColor: getPriorityColor(todo.priority)
                        }}
                    >
                        {todo.priority || 'medium'}
                    </span>
                    {category && (
                        <span
                            className="task-category-badge"
                            style={{
                                backgroundColor: category.color + '20',
                                color: category.color,
                                borderColor: category.color
                            }}
                        >
                            {category.icon} {category.name}
                        </span>
                    )}
                    {todo.dueDate && (
                        <span className={`due-date-badge ${!isCompleted && isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
                            🕐 {formatDueDate(todo.dueDate)}
                        </span>
                    )}
                    {todo.tags && todo.tags.length > 0 && (
                        <div className="todo-tags">
                            {todo.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="todo-tag"
                                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}
                    {todo.updatedAt && (
                        <span className="last-updated-badge" title={`Last updated: ${new Date(todo.updatedAt).toLocaleString()}`}>
                            ✎ {formatLastUpdated(todo.updatedAt)}
                        </span>
                    )}
                </div>
            </div>
            <div className="todo-actions">
                <button
                    className={`star-btn ${todo.starred ? 'starred' : ''}`}
                    onClick={() => onToggleStar(todo.id)}
                    title={todo.starred ? 'Unstar task' : 'Star task'}
                >
                    {todo.starred ? '⭐' : '☆'}
                </button>
                <button
                    className="edit-btn"
                    onClick={() => onEdit(todo)}
                    title="Edit task"
                >
                    ✏️
                </button>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(todo.id)}
                    title="Delete task"
                >
                    🗑
                </button>
            </div>
        </li>
    );
}

export default TodoItem;
