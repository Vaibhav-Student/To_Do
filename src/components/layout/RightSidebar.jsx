import ListTaskCount from '../lists/ListTaskCount';

/**
 * Right Sidebar Component - Lists Panel
 * Displays all lists with search, create, edit, and delete functionality
 */
function RightSidebar({
    isOpen,
    onToggle,
    lists,
    activeListId,
    currentPage,
    onSelectList,
    totalTasks,
    totalCompleted,
    // List management
    showNewListInput,
    setShowNewListInput,
    newListName,
    setNewListName,
    onAddList,
    onDeleteList,
    // Edit mode
    editingListId,
    editingListName,
    setEditingListName,
    onStartEditList,
    onSaveListName,
    // Search
    listSearchQuery,
    setListSearchQuery,
    // Key handlers
    handleListKeyPress,
    handleEditKeyPress
}) {
    return (
        <aside className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="right-sidebar-header">
                <h2 className="right-sidebar-title">My Lists</h2>
                <button className="right-sidebar-toggle" onClick={onToggle}>
                    {isOpen ? '▶' : '◀'}
                </button>
            </div>

            <div className="sidebar-stats">
                <div className="stat-item">
                    <span className="stat-number">{lists.length}</span>
                    <span className="stat-label">Lists</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{totalTasks}</span>
                    <span className="stat-label">Tasks</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{totalCompleted}</span>
                    <span className="stat-label">Done</span>
                </div>
            </div>

            <div className="lists-section">
                <div className="lists-header">
                    <span className="lists-title-small">All Lists</span>
                    <button
                        className="new-list-btn"
                        onClick={() => setShowNewListInput(!showNewListInput)}
                        title="Create new list"
                    >
                        {showNewListInput ? '✕' : '+'}
                    </button>
                </div>

                {/* Search Lists */}
                <div className="list-search-container">
                    <div className="list-search-icon">🔍</div>
                    <input
                        type="text"
                        className="list-search-input"
                        placeholder="Search lists..."
                        value={listSearchQuery}
                        onChange={(e) => setListSearchQuery(e.target.value)}
                    />
                    {listSearchQuery && (
                        <button
                            className="list-search-clear"
                            onClick={() => setListSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {showNewListInput && (
                    <div className="new-list-input-section">
                        <input
                            type="text"
                            className="new-list-input"
                            placeholder="List name..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyPress={handleListKeyPress}
                            autoFocus
                        />
                        <button className="create-list-btn" onClick={onAddList}>
                            ✓
                        </button>
                    </div>
                )}

                <nav className="lists-nav">
                    {lists
                        .filter(list => list.name.toLowerCase().includes(listSearchQuery.toLowerCase()))
                        .map(list => (
                            <div
                                key={list.id}
                                className={`list-item ${activeListId === list.id && currentPage === 'tasks' ? 'active' : ''}`}
                                onClick={() => onSelectList(list.id)}
                            >
                                {editingListId === list.id ? (
                                    <input
                                        type="text"
                                        className="edit-list-input"
                                        value={editingListName}
                                        onChange={(e) => setEditingListName(e.target.value)}
                                        onKeyDown={handleEditKeyPress}
                                        onBlur={onSaveListName}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <div className="list-icon">📋</div>
                                        <div className="list-info">
                                            <span className="list-name">{list.name}</span>
                                            <ListTaskCount listId={list.id} />
                                        </div>
                                        <div className="list-actions">
                                            <button
                                                className="list-action-btn"
                                                onClick={(e) => { e.stopPropagation(); onStartEditList(list); }}
                                                title="Edit"
                                            >
                                                ✎
                                            </button>
                                            {lists.length > 1 && (
                                                <button
                                                    className="list-action-btn delete"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); }}
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                </nav>
            </div>
        </aside>
    );
}

export default RightSidebar;
