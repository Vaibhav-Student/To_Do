/**
 * Todo App - Refactored Main Component
 * 
 * This is the main application component that orchestrates all features.
 * Components, hooks, and utilities are extracted into separate modules.
 */

import { useState, useEffect, useCallback } from 'react';
import { db, initializeDB, listsDB, tasksDB, categoriesDB } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import * as XLSX from 'xlsx';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';

// Components
import { NavSidebar, RightSidebar } from './components/layout';
import { TodoItem } from './components/tasks';
import { TaskModal, CategoryManager } from './components/modals';
import { Toast } from './components/common';

// Hooks
import { useToast, useProfile, useAnalytics } from './hooks';

// Utils
import {
    formatDueDate, formatDateDisplay, formatTimeDisplay,
    formatLastUpdated, getTaskAgeLabel, isOverdue
} from './utils/dateUtils';
import { getGreeting, getMotivationalMessage } from './utils/greetingUtils';

// Constants
import {
    TAG_COLORS, CATEGORY_COLORS, CHART_COLORS, getPriorityColor
} from './constants/colors';
import { CATEGORY_ICONS } from './constants/icons';

// Styles
import './index.css';

function App() {
    // ===== STATE MANAGEMENT =====

    // Navigation & UI state
    const [currentPage, setCurrentPage] = useState('home');
    const [activeListId, setActiveListId] = useState(null);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Filter & search state
    const [filter, setFilter] = useState('all');
    const [listSearchQuery, setListSearchQuery] = useState('');
    const [taskSearchQuery, setTaskSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [completedCollapsed, setCompletedCollapsed] = useState(() => {
        const saved = localStorage.getItem('completedCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    // List management state
    const [newListName, setNewListName] = useState('');
    const [showNewListInput, setShowNewListInput] = useState(false);
    const [editingListId, setEditingListId] = useState(null);
    const [editingListName, setEditingListName] = useState('');

    // Add Task Modal state
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskDueTime, setNewTaskDueTime] = useState('');
    const [newTaskTags, setNewTaskTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState(null);

    // Edit Task Modal state
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskText, setEditTaskText] = useState('');
    const [editTaskNotes, setEditTaskNotes] = useState('');
    const [editTaskPriority, setEditTaskPriority] = useState('medium');
    const [editTaskDueDate, setEditTaskDueDate] = useState('');
    const [editTaskDueTime, setEditTaskDueTime] = useState('');
    const [editTaskTags, setEditTaskTags] = useState([]);
    const [editTagInput, setEditTagInput] = useState('');
    const [editTaskCategory, setEditTaskCategory] = useState(null);

    // Category management state
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#4dabf7');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📁');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategoryColor, setEditCategoryColor] = useState('');
    const [editCategoryIcon, setEditCategoryIcon] = useState('');

    // Data management state
    const [exportFilter, setExportFilter] = useState('all');
    const [importMode, setImportMode] = useState('merge');
    const [showImportPreview, setShowImportPreview] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState(null);
    const [importFile, setImportFile] = useState(null);

    // Analytics filter state
    const [analyticsFilter, setAnalyticsFilter] = useState({
        category: 'all',
        priority: 'all',
        status: 'all',
        dateRange: 'all'
    });

    // ===== CUSTOM HOOKS =====
    const { toast, showToast } = useToast();
    const {
        userProfile,
        userName,
        setUserName,
        isEditingProfile,
        tempProfile,
        setTempProfile,
        showEmojiPicker,
        setShowEmojiPicker,
        isEditingName,
        tempUserName,
        setTempUserName,
        startEditingProfile,
        cancelEditingProfile,
        saveProfile,
        resetProfile,
        saveUserName,
        startEditingName,
        setIsEditingName
    } = useProfile(showToast);

    // ===== DATABASE QUERIES =====
    const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
    const lists = useLiveQuery(() => db.lists.toArray(), []) || [];
    const todos = useLiveQuery(
        () => activeListId ? db.tasks.where('listId').equals(activeListId).toArray() : [],
        [activeListId]
    ) || [];
    const allTasks = useLiveQuery(() => db.tasks.toArray(), []) || [];

    // Analytics hook
    const {
        statusChartData,
        categoryChartData,
        priorityChartData,
        timeChartData,
        getFilteredTasksForAnalytics
    } = useAnalytics(analyticsFilter, categories);

    // ===== COMPUTED VALUES =====
    const totalTasks = allTasks.length;
    const totalCompleted = allTasks.filter(t => t.completed).length;
    const activeTodosCount = todos.filter(todo => !todo.completed).length;
    const completedTodosCount = todos.filter(todo => todo.completed).length;
    const allCompleted = todos.length > 0 && activeTodosCount === 0;
    const activeList = lists.find(list => list.id === activeListId) || lists[0];

    // Filtered and sorted todos
    const filteredTodos = todos
        .filter(todo => {
            // Search filter
            if (taskSearchQuery) {
                const query = taskSearchQuery.toLowerCase();
                const matchesText = todo.text?.toLowerCase().includes(query) || false;
                const matchesNotes = todo.notes?.toLowerCase().includes(query) || false;
                const matchesTags = todo.tags?.some(tag => tag.name?.toLowerCase().includes(query)) || false;
                if (!matchesText && !matchesNotes && !matchesTags) return false;
            }
            // Category filter
            if (categoryFilter !== null && todo.categoryId !== categoryFilter) return false;
            // Status filter
            if (filter === 'active') return !todo.completed;
            if (filter === 'completed') return todo.completed;
            return true;
        })
        .sort((a, b) => {
            // Starred first, then by priority
            if (a.starred && !b.starred) return -1;
            if (!a.starred && b.starred) return 1;
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        });

    const activeTodos = filteredTodos.filter(todo => !todo.completed);
    const completedTodos = filteredTodos.filter(todo => todo.completed);

    // ===== EFFECTS =====

    // Initialize database
    useEffect(() => {
        const init = async () => {
            await initializeDB();
            const allLists = await db.lists.toArray();
            if (allLists.length > 0 && !activeListId) {
                setActiveListId(allLists[0].id);
            }
            setIsLoading(false);
        };
        init();
    }, []);

    // Update time for greeting
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Sync profile name
    useEffect(() => {
        if (userProfile.name && userProfile.name !== userName) {
            setUserName(userProfile.name);
            localStorage.setItem('userName', userProfile.name);
        }
    }, []);

    // Update activeListId when lists change
    useEffect(() => {
        if (lists.length > 0 && !activeListId) {
            setActiveListId(lists[0].id);
        }
    }, [lists, activeListId]);

    // ===== TASK HANDLERS =====

    const addTodo = async () => {
        if (newTaskText.trim() === '' || !activeListId) return;

        let dueDateTime = null;
        if (newTaskDueDate) {
            const timeStr = newTaskDueTime || '09:00';
            dueDateTime = new Date(`${newTaskDueDate}T${timeStr}`).toISOString();
        }

        await tasksDB.add(
            activeListId,
            newTaskText.trim(),
            newTaskPriority,
            dueDateTime,
            newTaskTags,
            newTaskNotes.trim(),
            newTaskCategory
        );

        // Reset form
        setNewTaskText('');
        setNewTaskNotes('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setNewTaskDueTime('');
        setNewTaskTags([]);
        setNewTaskCategory(null);
        setShowAddTaskModal(false);
        showToast('✅ Task added successfully!', 'success');
    };

    const toggleTodo = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await tasksDB.update(id, {
                completed: !todo.completed,
                completedAt: !todo.completed ? new Date().toISOString() : null
            });
        }
    };

    const deleteTodo = async (id) => {
        await tasksDB.delete(id);
        showToast('🗑️ Task deleted', 'info');
    };

    const toggleStar = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await tasksDB.update(id, { starred: !todo.starred });
        }
    };

    const openEditTaskModal = (todo) => {
        setEditingTaskId(todo.id);
        setEditTaskText(todo.text);
        setEditTaskNotes(todo.notes || '');
        setEditTaskPriority(todo.priority || 'medium');
        setEditTaskCategory(todo.categoryId || null);
        setEditTaskTags(todo.tags || []);

        if (todo.dueDate) {
            const date = new Date(todo.dueDate);
            setEditTaskDueDate(date.toISOString().split('T')[0]);
            setEditTaskDueTime(date.toTimeString().slice(0, 5));
        } else {
            setEditTaskDueDate('');
            setEditTaskDueTime('');
        }
        setShowEditTaskModal(true);
    };

    const saveEditedTask = async () => {
        if (!editingTaskId || !editTaskText.trim()) return;

        let dueDateTime = null;
        if (editTaskDueDate) {
            const timeStr = editTaskDueTime || '09:00';
            dueDateTime = new Date(`${editTaskDueDate}T${timeStr}`).toISOString();
        }

        await tasksDB.update(editingTaskId, {
            text: editTaskText.trim(),
            notes: editTaskNotes.trim(),
            priority: editTaskPriority,
            dueDate: dueDateTime,
            tags: editTaskTags,
            categoryId: editTaskCategory
        });

        setShowEditTaskModal(false);
        showToast('✅ Task updated!', 'success');
    };

    const clearCompleted = async () => {
        if (activeListId) {
            await tasksDB.deleteCompleted(activeListId);
            showToast('🧹 Completed tasks cleared', 'info');
        }
    };

    const markAllCompleted = async () => {
        const activeTasks = todos.filter(t => !t.completed);
        for (const task of activeTasks) {
            await tasksDB.update(task.id, {
                completed: true,
                completedAt: new Date().toISOString()
            });
        }
        showToast('✅ All tasks marked complete!', 'success');
    };

    // ===== TAG HANDLERS =====

    const addTag = () => {
        if (tagInput.trim() && !newTaskTags.some(t => t.name === tagInput.trim())) {
            const color = TAG_COLORS[newTaskTags.length % TAG_COLORS.length];
            setNewTaskTags([...newTaskTags, { name: tagInput.trim(), color }]);
            setTagInput('');
        }
    };

    const removeTag = (tagName) => {
        setNewTaskTags(newTaskTags.filter(t => t.name !== tagName));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !tagInput && newTaskTags.length > 0) {
            setNewTaskTags(newTaskTags.slice(0, -1));
        }
    };

    const addEditTag = () => {
        if (editTagInput.trim() && !editTaskTags.some(t => t.name === editTagInput.trim())) {
            const color = TAG_COLORS[editTaskTags.length % TAG_COLORS.length];
            setEditTaskTags([...editTaskTags, { name: editTagInput.trim(), color }]);
            setEditTagInput('');
        }
    };

    const removeEditTag = (tagName) => {
        setEditTaskTags(editTaskTags.filter(t => t.name !== tagName));
    };

    const handleEditTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEditTag();
        }
    };

    // ===== LIST HANDLERS =====

    const addNewList = async () => {
        if (newListName.trim()) {
            await listsDB.add(newListName.trim());
            setNewListName('');
            setShowNewListInput(false);
            showToast('📋 List created!', 'success');
        }
    };

    const deleteList = async (listId) => {
        if (lists.length <= 1) return;
        await listsDB.delete(listId);
        if (activeListId === listId) {
            setActiveListId(lists.find(l => l.id !== listId)?.id || null);
        }
        showToast('🗑️ List deleted', 'info');
    };

    const startEditingList = (list) => {
        setEditingListId(list.id);
        setEditingListName(list.name);
    };

    const saveListName = async () => {
        if (editingListId && editingListName.trim()) {
            await listsDB.update(editingListId, { name: editingListName.trim() });
            setEditingListId(null);
        }
    };

    const handleListKeyPress = (e) => {
        if (e.key === 'Enter') addNewList();
    };

    const handleEditKeyPress = (e) => {
        if (e.key === 'Enter') saveListName();
        if (e.key === 'Escape') setEditingListId(null);
    };

    const handleSelectList = (listId) => {
        setActiveListId(listId);
        setCurrentPage('tasks');
    };

    // ===== CATEGORY HANDLERS =====

    const addCategory = async () => {
        if (newCategoryName.trim()) {
            await categoriesDB.add(newCategoryName.trim(), newCategoryColor, newCategoryIcon);
            setNewCategoryName('');
            showToast('📁 Category created!', 'success');
        }
    };

    const startEditingCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditCategoryName(category.name);
        setEditCategoryColor(category.color);
        setEditCategoryIcon(category.icon);
    };

    const saveEditedCategory = async () => {
        if (editingCategoryId && editCategoryName.trim()) {
            await categoriesDB.update(editingCategoryId, {
                name: editCategoryName.trim(),
                color: editCategoryColor,
                icon: editCategoryIcon
            });
            setEditingCategoryId(null);
        }
    };

    const deleteCategory = async (categoryId) => {
        await categoriesDB.delete(categoryId);
        showToast('🗑️ Category deleted', 'info');
    };

    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    // ===== NAVIGATION HANDLERS =====

    const handleNavClick = (page) => {
        setCurrentPage(page);
        if (page === 'tasks' && !activeListId && lists.length > 0) {
            setActiveListId(lists[0].id);
        }
    };

    const toggleCompletedCollapsed = () => {
        const newState = !completedCollapsed;
        setCompletedCollapsed(newState);
        localStorage.setItem('completedCollapsed', JSON.stringify(newState));
    };

    // ===== KEY HANDLERS =====

    const handleAddTaskKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newTaskText.trim()) addTodo();
        }
    };

    const handleEditTaskKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEditedTask();
        }
    };

    // ===== EXCEL IMPORT/EXPORT =====

    const exportToExcel = async () => {
        try {
            const allTasksData = await db.tasks.toArray();
            let tasksToExport = allTasksData;

            if (exportFilter === 'active') {
                tasksToExport = allTasksData.filter(task => !task.completed);
            } else if (exportFilter === 'completed') {
                tasksToExport = allTasksData.filter(task => task.completed);
            }

            if (tasksToExport.length === 0) {
                showToast('No tasks to export! 📭', 'info');
                return;
            }

            const allLists = await db.lists.toArray();
            const allCategories = await db.categories.toArray();

            const listMap = {};
            allLists.forEach(list => { listMap[list.id] = list.name; });
            const categoryMap = {};
            allCategories.forEach(cat => { categoryMap[cat.id] = cat.name; });

            const excelData = tasksToExport.map(task => ({
                'Task Title': task.text || '',
                'Description / Notes': task.notes || '',
                'Status': task.completed ? 'Completed' : 'Active',
                'Priority': task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
                'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
                'Category': task.categoryId ? categoryMap[task.categoryId] || '' : '',
                'List Name': task.listId ? listMap[task.listId] || '' : '',
                'Tags': task.tags ? task.tags.map(t => t.name).join(', ') : '',
                'Created Date': task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `todo-backup-${exportFilter}-${timestamp}.xlsx`;
            XLSX.writeFile(workbook, filename);

            showToast(`✅ Exported ${tasksToExport.length} task(s)!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            showToast('❌ Export failed', 'error');
        }
    };

    // ===== ANALYTICS RESET =====

    const resetAnalyticsFilters = () => {
        setAnalyticsFilter({
            category: 'all',
            priority: 'all',
            status: 'all',
            dateRange: 'all'
        });
    };

    // Emoji picker data
    const emojiCategories = {
        'People': ['👤', '😊', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🧑‍🎓'],
        'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
        'Nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌲', '🌳', '🌴'],
        'Objects': ['⭐', '✨', '💫', '🔥', '💎', '🎯', '🎨', '🎭']
    };

    // ===== LOADING STATE =====
    if (isLoading) {
        return (
            <div className="app-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // ===== RENDER =====
    return (
        <div className="app-container">
            {/* Left Navigation Sidebar */}
            <NavSidebar
                currentPage={currentPage}
                onNavClick={handleNavClick}
                pendingCount={totalTasks - totalCompleted}
            />

            {/* Main Content Area */}
            <main className="main-content">
                {/* Floating toggle button for right sidebar */}
                {!rightSidebarOpen && (
                    <button
                        className="floating-sidebar-toggle"
                        onClick={() => setRightSidebarOpen(true)}
                        title="Show Lists"
                    >
                        <span className="toggle-icon">📋</span>
                        <span className="toggle-text">Lists</span>
                    </button>
                )}

                {/* Home Page */}
                {currentPage === 'home' && (
                    <section className="welcome-section home-page">
                        <div className="welcome-content">
                            {userProfile.showGreeting && (
                                <div className="greeting-container">
                                    <div className="user-avatar-greeting">{userProfile.avatar}</div>
                                    <div className="greeting-text">
                                        <h1 className="greeting-main">
                                            {getGreeting(currentTime).emoji} {getGreeting(currentTime).text}
                                            {userProfile.name || userName ? `, ${userProfile.name || userName}` : ''}!
                                        </h1>
                                        <p className="greeting-motivation">{getMotivationalMessage(currentTime)}</p>
                                        {userProfile.bio && <p className="greeting-bio">"{userProfile.bio}"</p>}
                                    </div>
                                </div>
                            )}
                            {!userProfile.showGreeting && (
                                <div className="greeting-container compact">
                                    <div className="greeting-text">
                                        <h1 className="greeting-main compact">📋 My Tasks Overview</h1>
                                    </div>
                                </div>
                            )}
                            <div className="welcome-actions">
                                {isEditingName ? (
                                    <div className="name-edit-form">
                                        <input
                                            type="text"
                                            className="name-input"
                                            placeholder="Enter your name..."
                                            value={tempUserName}
                                            onChange={(e) => setTempUserName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveUserName();
                                                if (e.key === 'Escape') setIsEditingName(false);
                                            }}
                                            autoFocus
                                            maxLength={20}
                                        />
                                        <button className="name-save-btn" onClick={saveUserName}>Save</button>
                                        <button className="name-cancel-btn" onClick={() => setIsEditingName(false)}>✕</button>
                                    </div>
                                ) : !userName ? (
                                    <button className="add-name-btn" onClick={() => setIsEditingName(true)}>
                                        <span>✨</span> Add your name
                                    </button>
                                ) : (
                                    <button className="edit-name-btn" onClick={startEditingName} title="Edit name">
                                        ✎
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📋</div>
                                <div className="stat-info">
                                    <span className="stat-value">{totalTasks}</span>
                                    <span className="stat-title">Total Tasks</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <span className="stat-value">{totalCompleted}</span>
                                    <span className="stat-title">Completed</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <span className="stat-value">{totalTasks - totalCompleted}</span>
                                    <span className="stat-title">Pending</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📁</div>
                                <div className="stat-info">
                                    <span className="stat-value">{lists.length}</span>
                                    <span className="stat-title">Lists</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Tasks Page */}
                {currentPage === 'tasks' && activeList && (
                    <section className="tasks-section">
                        <div className="tasks-header">
                            <div className="tasks-title-row">
                                <h2 className="tasks-title">{activeList.name}</h2>
                                <span className="tasks-count">{activeTodosCount} active / {todos.length} total</span>
                            </div>
                            <div className="tasks-actions">
                                <button className="add-task-btn" onClick={() => setShowAddTaskModal(true)}>
                                    <span>+</span> Add Task
                                </button>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="tasks-filters">
                            <div className="search-container">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search tasks..."
                                    value={taskSearchQuery}
                                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-tabs">
                                <button
                                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                                    onClick={() => setFilter('active')}
                                >
                                    Active
                                </button>
                                <button
                                    className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                                    onClick={() => setFilter('completed')}
                                >
                                    Completed
                                </button>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="tasks-content">
                            {filteredTodos.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3>No tasks yet</h3>
                                    <p>Add your first task to get started!</p>
                                </div>
                            ) : (
                                <>
                                    {/* Active Tasks */}
                                    {activeTodos.length > 0 && (
                                        <ul className="todo-list">
                                            {activeTodos.map((todo, index) => (
                                                <TodoItem
                                                    key={todo.id}
                                                    todo={todo}
                                                    index={index}
                                                    isCompleted={false}
                                                    categories={categories}
                                                    onToggle={toggleTodo}
                                                    onToggleStar={toggleStar}
                                                    onEdit={openEditTaskModal}
                                                    onDelete={deleteTodo}
                                                />
                                            ))}
                                        </ul>
                                    )}

                                    {/* Completed Tasks */}
                                    {completedTodos.length > 0 && filter !== 'active' && (
                                        <div className="completed-section">
                                            <button
                                                className="completed-toggle"
                                                onClick={toggleCompletedCollapsed}
                                            >
                                                <span className={`toggle-arrow ${completedCollapsed ? '' : 'expanded'}`}>▶</span>
                                                <span className="toggle-text">Completed ({completedTodos.length})</span>
                                            </button>

                                            <div className={`completed-tasks ${completedCollapsed ? 'collapsed' : ''}`}>
                                                <ul className="todo-list">
                                                    {completedTodos.map((todo, index) => (
                                                        <TodoItem
                                                            key={todo.id}
                                                            todo={todo}
                                                            index={index}
                                                            isCompleted={true}
                                                            categories={categories}
                                                            onToggle={toggleTodo}
                                                            onToggleStar={toggleStar}
                                                            onEdit={openEditTaskModal}
                                                            onDelete={deleteTodo}
                                                        />
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Task Actions Footer */}
                        {todos.length > 0 && (
                            <div className="tasks-footer">
                                {completedTodosCount > 0 && (
                                    <button className="clear-completed-btn" onClick={clearCompleted}>
                                        🧹 Clear Completed ({completedTodosCount})
                                    </button>
                                )}
                                {activeTodosCount > 0 && (
                                    <button className="mark-all-btn" onClick={markAllCompleted}>
                                        ✅ Mark All Complete
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* Analytics Page - Simplified placeholder */}
                {currentPage === 'analytics' && (
                    <section className="analytics-section">
                        <h2 className="section-title">📊 Analytics Dashboard</h2>
                        <p className="section-description">View your productivity insights</p>

                        <div className="analytics-stats">
                            <div className="analytics-stat-card">
                                <span className="analytics-stat-value">{totalTasks}</span>
                                <span className="analytics-stat-label">Total Tasks</span>
                            </div>
                            <div className="analytics-stat-card">
                                <span className="analytics-stat-value">{totalCompleted}</span>
                                <span className="analytics-stat-label">Completed</span>
                            </div>
                            <div className="analytics-stat-card">
                                <span className="analytics-stat-value">
                                    {totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0}%
                                </span>
                                <span className="analytics-stat-label">Completion Rate</span>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="analytics-charts">
                            {statusChartData && statusChartData.length > 0 && (
                                <div className="chart-container">
                                    <h3>Task Status</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={statusChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                            >
                                                {statusChartData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Settings Page - Simplified placeholder */}
                {currentPage === 'settings' && (
                    <section className="settings-section">
                        <h2 className="section-title">⚙️ Settings</h2>

                        <div className="settings-group">
                            <h3>Profile</h3>
                            <div className="profile-display">
                                <span className="profile-avatar">{userProfile.avatar}</span>
                                <span className="profile-name">{userProfile.name || 'User'}</span>
                            </div>
                            <button className="btn-edit-profile" onClick={startEditingProfile}>
                                Edit Profile
                            </button>
                        </div>

                        <div className="settings-group">
                            <h3>Data Management</h3>
                            <div className="data-actions">
                                <button className="btn-export" onClick={exportToExcel}>
                                    📤 Export to Excel
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Right Sidebar - Lists */}
            <RightSidebar
                isOpen={rightSidebarOpen}
                onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
                lists={lists}
                activeListId={activeListId}
                currentPage={currentPage}
                onSelectList={handleSelectList}
                totalTasks={totalTasks}
                totalCompleted={totalCompleted}
                showNewListInput={showNewListInput}
                setShowNewListInput={setShowNewListInput}
                newListName={newListName}
                setNewListName={setNewListName}
                onAddList={addNewList}
                onDeleteList={deleteList}
                editingListId={editingListId}
                editingListName={editingListName}
                setEditingListName={setEditingListName}
                onStartEditList={startEditingList}
                onSaveListName={saveListName}
                listSearchQuery={listSearchQuery}
                setListSearchQuery={setListSearchQuery}
                handleListKeyPress={handleListKeyPress}
                handleEditKeyPress={handleEditKeyPress}
            />

            {/* Add Task Modal */}
            <TaskModal
                mode="add"
                isOpen={showAddTaskModal}
                onClose={() => setShowAddTaskModal(false)}
                onSubmit={addTodo}
                taskText={newTaskText}
                setTaskText={setNewTaskText}
                taskNotes={newTaskNotes}
                setTaskNotes={setNewTaskNotes}
                taskPriority={newTaskPriority}
                setTaskPriority={setNewTaskPriority}
                taskDueDate={newTaskDueDate}
                setTaskDueDate={setNewTaskDueDate}
                taskDueTime={newTaskDueTime}
                setTaskDueTime={setNewTaskDueTime}
                taskTags={newTaskTags}
                setTaskTags={setNewTaskTags}
                taskCategory={newTaskCategory}
                setTaskCategory={setNewTaskCategory}
                tagInput={tagInput}
                setTagInput={setTagInput}
                onAddTag={addTag}
                onRemoveTag={removeTag}
                onTagKeyDown={handleTagKeyDown}
                categories={categories}
                onOpenCategoryManager={() => setShowCategoryManager(true)}
                onKeyDown={handleAddTaskKeyPress}
            />

            {/* Edit Task Modal */}
            <TaskModal
                mode="edit"
                isOpen={showEditTaskModal}
                onClose={() => setShowEditTaskModal(false)}
                onSubmit={saveEditedTask}
                taskText={editTaskText}
                setTaskText={setEditTaskText}
                taskNotes={editTaskNotes}
                setTaskNotes={setEditTaskNotes}
                taskPriority={editTaskPriority}
                setTaskPriority={setEditTaskPriority}
                taskDueDate={editTaskDueDate}
                setTaskDueDate={setEditTaskDueDate}
                taskDueTime={editTaskDueTime}
                setTaskDueTime={setEditTaskDueTime}
                taskTags={editTaskTags}
                setTaskTags={setEditTaskTags}
                taskCategory={editTaskCategory}
                setTaskCategory={setEditTaskCategory}
                tagInput={editTagInput}
                setTagInput={setEditTagInput}
                onAddTag={addEditTag}
                onRemoveTag={removeEditTag}
                onTagKeyDown={handleEditTagKeyDown}
                categories={categories}
                onOpenCategoryManager={() => setShowCategoryManager(true)}
                onKeyDown={handleEditTaskKeyPress}
            />

            {/* Category Manager Modal */}
            <CategoryManager
                isOpen={showCategoryManager}
                onClose={() => setShowCategoryManager(false)}
                categories={categories}
                allTasks={allTasks}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                newCategoryColor={newCategoryColor}
                setNewCategoryColor={setNewCategoryColor}
                newCategoryIcon={newCategoryIcon}
                setNewCategoryIcon={setNewCategoryIcon}
                onAddCategory={addCategory}
                editingCategoryId={editingCategoryId}
                setEditingCategoryId={setEditingCategoryId}
                editCategoryName={editCategoryName}
                setEditCategoryName={setEditCategoryName}
                editCategoryColor={editCategoryColor}
                setEditCategoryColor={setEditCategoryColor}
                editCategoryIcon={editCategoryIcon}
                setEditCategoryIcon={setEditCategoryIcon}
                onStartEditCategory={startEditingCategory}
                onSaveEditedCategory={saveEditedCategory}
                onDeleteCategory={deleteCategory}
            />

            {/* Toast Notification */}
            <Toast toast={toast} />
        </div>
    );
}

export default App;
