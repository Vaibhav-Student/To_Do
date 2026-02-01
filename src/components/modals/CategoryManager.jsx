import { CATEGORY_COLORS } from '../../constants/colors';
import { CATEGORY_ICONS } from '../../constants/icons';

/**
 * CategoryManager Modal Component
 * Allows users to add, edit, and delete categories
 */
function CategoryManager({
    isOpen,
    onClose,
    categories,
    allTasks,
    // Add new category
    newCategoryName,
    setNewCategoryName,
    newCategoryColor,
    setNewCategoryColor,
    newCategoryIcon,
    setNewCategoryIcon,
    onAddCategory,
    // Edit category
    editingCategoryId,
    setEditingCategoryId,
    editCategoryName,
    setEditCategoryName,
    editCategoryColor,
    setEditCategoryColor,
    editCategoryIcon,
    setEditCategoryIcon,
    onStartEditCategory,
    onSaveEditedCategory,
    onDeleteCategory
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal category-manager-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">📂 Manage Categories</h3>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    {/* Add New Category */}
                    <div className="category-add-section">
                        <h4 className="category-section-title">Add New Category</h4>
                        <div className="category-add-form">
                            <div className="category-add-row">
                                <div className="category-icon-picker">
                                    <span className="picker-label">Icon</span>
                                    <div className="icon-options">
                                        {CATEGORY_ICONS.map((icon, i) => (
                                            <button
                                                key={i}
                                                className={`icon-option ${newCategoryIcon === icon ? 'active' : ''}`}
                                                onClick={() => setNewCategoryIcon(icon)}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="category-add-row">
                                <div className="category-color-picker">
                                    <span className="picker-label">Color</span>
                                    <div className="color-options">
                                        {CATEGORY_COLORS.map((color, i) => (
                                            <button
                                                key={i}
                                                className={`color-option ${newCategoryColor === color ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setNewCategoryColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="category-add-row name-row">
                                <input
                                    type="text"
                                    className="category-name-input"
                                    placeholder="Category name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onAddCategory()}
                                />
                                <button
                                    className="btn-add-category"
                                    onClick={onAddCategory}
                                    disabled={!newCategoryName.trim()}
                                >
                                    Add
                                </button>
                            </div>
                            {/* Preview */}
                            {newCategoryName.trim() && (
                                <div className="category-preview">
                                    <span className="preview-label">Preview:</span>
                                    <span
                                        className="category-preview-chip"
                                        style={{ backgroundColor: newCategoryColor + '20', color: newCategoryColor, borderColor: newCategoryColor }}
                                    >
                                        {newCategoryIcon} {newCategoryName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Existing Categories */}
                    <div className="category-list-section">
                        <h4 className="category-section-title">Your Categories ({categories.length})</h4>
                        {categories.length === 0 ? (
                            <div className="category-empty">
                                <span>No categories yet. Create one above!</span>
                            </div>
                        ) : (
                            <div className="category-list">
                                {categories.map(cat => (
                                    <div key={cat.id} className="category-list-item">
                                        {editingCategoryId === cat.id ? (
                                            <div className="category-edit-form">
                                                <div className="category-edit-icons">
                                                    {CATEGORY_ICONS.map((icon, i) => (
                                                        <button
                                                            key={i}
                                                            className={`icon-option small ${editCategoryIcon === icon ? 'active' : ''}`}
                                                            onClick={() => setEditCategoryIcon(icon)}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="category-edit-colors">
                                                    {CATEGORY_COLORS.map((color, i) => (
                                                        <button
                                                            key={i}
                                                            className={`color-option small ${editCategoryColor === color ? 'active' : ''}`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setEditCategoryColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="category-edit-name-row">
                                                    <input
                                                        type="text"
                                                        className="category-edit-input"
                                                        value={editCategoryName}
                                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && onSaveEditedCategory()}
                                                        autoFocus
                                                    />
                                                    <button className="btn-save-category" onClick={onSaveEditedCategory}>
                                                        ✓
                                                    </button>
                                                    <button className="btn-cancel-category" onClick={() => setEditingCategoryId(null)}>
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className="category-item-display"
                                                    style={{ '--cat-color': cat.color }}
                                                >
                                                    <span className="category-item-icon">{cat.icon}</span>
                                                    <span className="category-item-name">{cat.name}</span>
                                                    <span className="category-item-count">
                                                        {allTasks.filter(t => t.categoryId === cat.id).length} tasks
                                                    </span>
                                                </div>
                                                <div className="category-item-actions">
                                                    <button
                                                        className="category-action-btn edit"
                                                        onClick={() => onStartEditCategory(cat)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="category-action-btn delete"
                                                        onClick={() => onDeleteCategory(cat.id)}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryManager;
