/**
 * Left Navigation Sidebar Component
 * Contains main navigation items and pending task count
 */
function NavSidebar({ currentPage, onNavClick, pendingCount }) {
    return (
        <aside className="nav-sidebar">
            <div className="nav-sidebar-header">
                <div className="nav-logo">
                    <span className="nav-logo-icon">✓</span>
                    <span className="nav-logo-text">ToDo</span>
                </div>
            </div>

            <nav className="nav-menu">
                <button
                    className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
                    onClick={() => onNavClick('home')}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`}
                    onClick={() => onNavClick('tasks')}
                >
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">My Tasks</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
                    onClick={() => onNavClick('analytics')}
                >
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Analytics</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavClick('settings')}
                >
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </nav>

            <div className="nav-footer">
                <div className="nav-stats">
                    <div className="nav-stat">
                        <span className="nav-stat-number">{pendingCount}</span>
                        <span className="nav-stat-label">Pending</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default NavSidebar;
