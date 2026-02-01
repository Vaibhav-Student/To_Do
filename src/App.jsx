import { useState, useEffect, useCallback, useMemo } from 'react'
import { db, initializeDB, listsDB, tasksDB, categoriesDB } from './db'
import { useLiveQuery } from 'dexie-react-hooks'
import * as XLSX from 'xlsx'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts'
import {
  // Navigation
  Home,
  ListTodo,
  BarChart3,
  Settings,
  ListOrdered,
  // Time of day
  Sunrise,
  Sun,
  Sunset,
  Moon,
  // Task actions
  Plus,
  Trash2,
  Edit3,
  Star,
  Clock,
  Pin,
  Flame,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  // Categories
  Folder,
  FolderOpen,
  Briefcase,
  House,
  ShoppingCart,
  Heart,
  BookOpen,
  Wallet,
  Target,
  Gamepad2,
  Plane,
  UtensilsCrossed,
  Dumbbell,
  Palette,
  Music,
  Mail,
  Wrench,
  Sprout,
  Gift,
  Smartphone,
  // Profile
  User,
  UserCircle,
  // Status
  CircleDot,
  AlertCircle,
  Calendar,
  PartyPopper,
  CheckCircle2,
} from 'lucide-react'

// Component to show task count for each list
function ListTaskCount({ listId }) {
  const tasks = useLiveQuery(
    () => db.tasks.where('listId').equals(listId).toArray(),
    [listId]
  ) || []
  const activeCount = tasks.filter(t => !t.completed).length
  return <span className="list-count">{activeCount} active</span>
}

function App() {
  const [activeListId, setActiveListId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [newListName, setNewListName] = useState('')
  const [filter, setFilter] = useState('all')
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [editingListId, setEditingListId] = useState(null)
  const [editingListName, setEditingListName] = useState('')
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'home'
  })
  const [listSearchQuery, setListSearchQuery] = useState('')
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [completedCollapsed, setCompletedCollapsed] = useState(() => {
    const saved = localStorage.getItem('completedCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // User name state for greeting
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || ''
  })
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempUserName, setTempUserName] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Profile state - Load from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile')
    return savedProfile ? JSON.parse(savedProfile) : {
      name: '',
      email: '',
      bio: '',
      avatar: '👤',
      theme: 'dark',
      showGreeting: true
    }
  })

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [tempProfile, setTempProfile] = useState(userProfile)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  // Add Task Modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskNotes, setNewTaskNotes] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskDueTime, setNewTaskDueTime] = useState('')
  const [newTaskTags, setNewTaskTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // Edit Task Modal state
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTaskText, setEditTaskText] = useState('')
  const [editTaskNotes, setEditTaskNotes] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState('medium')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskDueTime, setEditTaskDueTime] = useState('')
  const [editTaskTags, setEditTaskTags] = useState([])
  const [editTagInput, setEditTagInput] = useState('')

  // Category state
  const [newTaskCategory, setNewTaskCategory] = useState(null)
  const [editTaskCategory, setEditTaskCategory] = useState(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#4dabf7')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📁')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryColor, setEditCategoryColor] = useState('')
  const [editCategoryIcon, setEditCategoryIcon] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null) // null means all categories

  // Data Management (Excel Import/Export) state
  const [exportFilter, setExportFilter] = useState('all') // 'all', 'active', 'completed'
  const [importMode, setImportMode] = useState('merge') // 'merge' or 'replace'
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [importPreviewData, setImportPreviewData] = useState(null)
  const [importFile, setImportFile] = useState(null)

  // Analytics Dashboard state
  const [analyticsFilter, setAnalyticsFilter] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'all' // 'all', 'week', 'month', 'quarter'
  })

  // Predefined tag colors
  const tagColors = [
    '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7',
    '#9775fa', '#f783ac', '#20c997', '#a9e34b', '#748ffc'
  ]

  // Predefined category colors
  const categoryColors = [
    '#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa',
    '#f783ac', '#20c997', '#ffd43b', '#748ffc', '#a9e34b'
  ]

  // Predefined category icons
  const categoryIcons = [
    '📁', '💼', '🏠', '🛒', '❤️', '📚', '💰', '🎯', '🎮', '✈️',
    '🍽️', '🏋️', '🎨', '🎵', '📧', '🔧', '🌱', '⭐', '🎁', '📱'
  ]

  // Live query for categories
  const categories = useLiveQuery(() => db.categories.toArray(), []) || []

  // Live query for lists from IndexedDB
  const lists = useLiveQuery(() => db.lists.toArray(), []) || []

  // Live query for tasks of active list
  const todos = useLiveQuery(
    () => activeListId ? db.tasks.where('listId').equals(activeListId).toArray() : [],
    [activeListId]
  ) || []

  // Initialize database on first load
  useEffect(() => {
    const init = async () => {
      await initializeDB()
      const allLists = await db.lists.toArray()
      if (allLists.length > 0 && !activeListId) {
        setActiveListId(allLists[0].id)
      }
      setIsLoading(false)
    }
    init()
  }, [])

  // Update current time every minute for greeting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) {
      return { text: 'Good Morning', icon: Sunrise, iconColor: '#ffa94d', period: 'morning' }
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good Afternoon', icon: Sun, iconColor: '#ffd43b', period: 'afternoon' }
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Good Evening', icon: Sunset, iconColor: '#ff8c42', period: 'evening' }
    } else {
      return { text: 'Good Night', icon: Moon, iconColor: '#748ffc', period: 'night' }
    }
  }

  // Motivational messages based on task stats
  const getMotivationalMessage = () => {
    const messages = {
      morning: [
        "Let's make today productive! 💪",
        "A fresh start awaits you! ✨",
        "Ready to conquer your tasks? 🚀"
      ],
      afternoon: [
        "Keep up the great momentum! 🔥",
        "You're doing amazing! ⭐",
        "Stay focused, you got this! 💫"
      ],
      evening: [
        "Let's wrap up those tasks! 🎯",
        "Finish strong today! 💪",
        "Every task completed counts! ✅"
      ],
      night: [
        "Planning for tomorrow? 📝",
        "Rest well, achieve more! 🌟",
        "Great things await tomorrow! ✨"
      ]
    }
    const period = getGreeting().period
    const periodMessages = messages[period]
    // Use the day of the month to pick a consistent message for the day
    const index = currentTime.getDate() % periodMessages.length
    return periodMessages[index]
  }

  // Save user name
  const saveUserName = () => {
    const trimmedName = tempUserName.trim()
    if (trimmedName) {
      setUserName(trimmedName)
      localStorage.setItem('userName', trimmedName)
    }
    setIsEditingName(false)
  }

  // Start editing name
  const startEditingName = () => {
    setTempUserName(userName)
    setIsEditingName(true)
  }

  /**
   * ===== PROFILE MANAGEMENT SYSTEM =====
   * 
   * This system manages user profile data including avatar, name, email, bio, and preferences.
   * 
   * Data Structure (localStorage key: 'userProfile'):
   * {
   *   name: string,           // User's display name (shown in greetings)
   *   email: string,          // User's email address
   *   bio: string,            // Short bio/status (max 60 chars)
   *   avatar: string,         // Emoji avatar (chosen from picker)
   *   theme: string,          // 'dark', 'light', or 'system'
   *   showGreeting: boolean   // Toggle greeting display on Home page
   * }
   * 
   * How it works:
   * 1. Profile data is loaded from localStorage on app start
   * 2. Edit mode creates a temporary copy (tempProfile) for changes
   * 3. Save button commits changes to both state and localStorage
   * 4. Reset button restores default values
   * 5. Profile updates instantly reflect on Home page greeting
   * 6. Toast notifications provide user feedback
   * 
   * Components:
   * - Profile Overview Card: Displays current profile with avatar
   * - Edit Form: Allows editing all profile fields
   * - Emoji Picker: Modal with categorized emoji selection
   * - Preferences: Theme and greeting toggle switches
   * - Toast: Success/info notifications
   */

  // Profile management functions
  const startEditingProfile = () => {
    setTempProfile({ ...userProfile })
    setIsEditingProfile(true)
  }

  const cancelEditingProfile = () => {
    setTempProfile({ ...userProfile })
    setIsEditingProfile(false)
    setShowEmojiPicker(false)
  }

  const saveProfile = () => {
    // Save to state
    setUserProfile(tempProfile)
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(tempProfile))
    // Update userName for backward compatibility
    setUserName(tempProfile.name)
    localStorage.setItem('userName', tempProfile.name)
    // Close editing mode
    setIsEditingProfile(false)
    setShowEmojiPicker(false)
    // Show success toast
    showToast('Profile updated successfully! ✅', 'success')
  }

  const resetProfile = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to reset your profile?\n\n' +
      'This will reset:\n' +
      '• Your name to "User"\n' +
      '• Your avatar to default\n' +
      '• Your bio/status to empty\n\n' +
      'Your tasks, lists, and preferences will NOT be affected.\n\n' +
      'This action cannot be undone.'
    )

    if (!confirmed) {
      return // User cancelled
    }

    // Create default profile preserving email, theme, and showGreeting
    const defaultProfile = {
      name: 'User',
      email: userProfile.email, // Preserve email
      bio: '',
      avatar: '👤',
      theme: userProfile.theme, // Preserve theme preference
      showGreeting: userProfile.showGreeting // Preserve greeting preference
    }

    // Update temp profile if in edit mode
    setTempProfile(defaultProfile)
    // Update actual profile
    setUserProfile(defaultProfile)
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
    // Update userName for backward compatibility
    setUserName('User')
    localStorage.setItem('userName', 'User')
    // Close editing mode
    setIsEditingProfile(false)
    // Show success toast
    showToast('✔ Profile reset successfully', 'success')
  }

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  /**
   * ===== DATA MANAGEMENT - EXCEL IMPORT/EXPORT =====
   * 
   * Export to Excel:
   * - Export all tasks or filter by active/completed
   * - Includes: Task Title, Notes, Status, Priority, Due Date, Category, Created Date, List Name
   * - Generates meaningful filename with timestamp
   * 
   * Import from Excel:
   * - Validates file format and required columns
   * - Shows preview before import
   * - Supports merge or replace mode
   * - Ignores empty rows
   */

  // Export tasks to Excel
  const exportToExcel = async () => {
    try {
      // Get all tasks from all lists
      const allTasks = await db.tasks.toArray()

      // Filter tasks based on export filter
      let tasksToExport = allTasks
      if (exportFilter === 'active') {
        tasksToExport = allTasks.filter(task => !task.completed)
      } else if (exportFilter === 'completed') {
        tasksToExport = allTasks.filter(task => task.completed)
      }

      if (tasksToExport.length === 0) {
        showToast('No tasks to export! 📭', 'info')
        return
      }

      // Get lists and categories for mapping
      const allLists = await db.lists.toArray()
      const allCategories = await db.categories.toArray()

      // Create list and category lookup maps
      const listMap = {}
      allLists.forEach(list => {
        listMap[list.id] = list.name
      })

      const categoryMap = {}
      allCategories.forEach(cat => {
        categoryMap[cat.id] = cat.name
      })

      // Transform tasks into Excel format
      const excelData = tasksToExport.map(task => ({
        'Task Title': task.text || '',
        'Description / Notes': task.notes || '',
        'Status': task.completed ? 'Completed' : 'Active',
        'Priority': task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium',
        'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
        'Category': task.categoryId ? categoryMap[task.categoryId] || '' : '',
        'List Name': task.listId ? listMap[task.listId] || '' : '',
        'Tags': task.tags ? task.tags.join(', ') : '',
        'Created Date': task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
      }))

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks')

      // Auto-size columns
      const maxWidth = 50
      const colWidths = [
        { wch: 30 }, // Task Title
        { wch: 40 }, // Description
        { wch: 12 }, // Status
        { wch: 12 }, // Priority
        { wch: 15 }, // Due Date
        { wch: 15 }, // Category
        { wch: 15 }, // List Name
        { wch: 25 }, // Tags
        { wch: 15 }  // Created Date
      ]
      worksheet['!cols'] = colWidths

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filterSuffix = exportFilter === 'all' ? '' : `-${exportFilter}`
      const filename = `todo-backup${filterSuffix}-${timestamp}.xlsx`

      // Download the file
      XLSX.writeFile(workbook, filename)

      showToast(`✅ Exported ${tasksToExport.length} task${tasksToExport.length !== 1 ? 's' : ''} successfully!`, 'success')
    } catch (error) {
      console.error('Export error:', error)
      showToast('❌ Export failed. Please try again.', 'error')
    }
  }

  // Handle file selection for import
  const handleImportFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx')) {
      showToast('❌ Please select a valid .xlsx file', 'error')
      e.target.value = ''
      return
    }

    setImportFile(file)

    // Read and preview the file
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          showToast('❌ The Excel file is empty', 'error')
          e.target.value = ''
          return
        }

        // Validate required columns
        const requiredColumns = ['Task Title']
        const firstRow = jsonData[0]
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))

        if (missingColumns.length > 0) {
          showToast(`❌ Missing required column: ${missingColumns.join(', ')}`, 'error')
          e.target.value = ''
          return
        }

        // Filter out empty rows (rows without Task Title)
        const validRows = jsonData.filter(row => row['Task Title'] && row['Task Title'].toString().trim())

        if (validRows.length === 0) {
          showToast('❌ No valid tasks found in the file', 'error')
          e.target.value = ''
          return
        }

        // Set preview data
        setImportPreviewData({
          totalTasks: validRows.length,
          sampleTasks: validRows.slice(0, 5).map(row => row['Task Title']),
          allRows: validRows
        })
        setShowImportPreview(true)

      } catch (error) {
        console.error('Import preview error:', error)
        showToast('❌ Failed to read Excel file. Please check the format.', 'error')
        e.target.value = ''
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // Cancel import
  const cancelImport = () => {
    setShowImportPreview(false)
    setImportPreviewData(null)
    setImportFile(null)
    // Reset file input
    const fileInput = document.getElementById('excel-import-input')
    if (fileInput) fileInput.value = ''
  }

  // Confirm and execute import
  const confirmImport = async () => {
    if (!importPreviewData) return

    try {
      // Get current lists and categories for matching
      const allLists = await db.lists.toArray()
      const allCategories = await db.categories.toArray()

      // Create lookup maps
      const listMap = {}
      allLists.forEach(list => {
        listMap[list.name.toLowerCase()] = list.id
      })

      const categoryMap = {}
      allCategories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id
      })

      // If replace mode, delete all existing tasks
      if (importMode === 'replace') {
        const confirmReplace = window.confirm(
          '⚠️ This will delete ALL existing tasks and replace them with imported tasks. Continue?'
        )
        if (!confirmReplace) {
          cancelImport()
          return
        }
        await db.tasks.clear()
      }

      // Get or create default list for tasks without a list
      let defaultListId = allLists[0]?.id
      if (!defaultListId) {
        defaultListId = await db.lists.add({
          name: 'Imported Tasks',
          createdAt: new Date().toISOString()
        })
      }

      // Import tasks
      let importedCount = 0
      for (const row of importPreviewData.allRows) {
        try {
          // Find or use default list
          let listId = defaultListId
          if (row['List Name']) {
            const listName = row['List Name'].toString().trim().toLowerCase()
            if (listMap[listName]) {
              listId = listMap[listName]
            }
          }

          // Find category if exists
          let categoryId = null
          if (row['Category']) {
            const categoryName = row['Category'].toString().trim().toLowerCase()
            if (categoryMap[categoryName]) {
              categoryId = categoryMap[categoryName]
            }
          }

          // Parse priority
          let priority = 'medium'
          if (row['Priority']) {
            const priorityStr = row['Priority'].toString().toLowerCase()
            if (['low', 'medium', 'high'].includes(priorityStr)) {
              priority = priorityStr
            }
          }

          // Parse status
          const completed = row['Status'] && row['Status'].toString().toLowerCase() === 'completed'

          // Parse tags
          let tags = []
          if (row['Tags']) {
            tags = row['Tags'].toString().split(',').map(t => t.trim()).filter(t => t)
          }

          // Parse due date
          let dueDate = null
          if (row['Due Date']) {
            try {
              const parsedDate = new Date(row['Due Date'])
              if (!isNaN(parsedDate.getTime())) {
                dueDate = parsedDate.toISOString()
              }
            } catch (e) {
              // Invalid date, skip
            }
          }

          // Add task to database
          await db.tasks.add({
            listId: listId,
            text: row['Task Title'].toString().trim(),
            notes: row['Description / Notes'] ? row['Description / Notes'].toString().trim() : '',
            completed: completed,
            priority: priority,
            dueDate: dueDate,
            tags: tags,
            categoryId: categoryId,
            starred: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: completed ? new Date().toISOString() : null
          })

          importedCount++
        } catch (error) {
          console.error('Error importing task:', row, error)
          // Continue with next task
        }
      }

      // Success!
      showToast(`✅ Imported ${importedCount} task${importedCount !== 1 ? 's' : ''} successfully!`, 'success')
      cancelImport()

      // Switch to tasks page to see imported tasks
      if (importedCount > 0) {
        setCurrentPage('tasks')
        localStorage.setItem('currentPage', 'tasks')
      }

    } catch (error) {
      console.error('Import error:', error)
      showToast('❌ Import failed. Please try again.', 'error')
    }
  }

  /**
   * ===== ANALYTICS DASHBOARD =====
   * 
   * Computes and visualizes task data for productivity insights:
   * - Task status (completed vs pending)
   * - Category distribution
   * - Priority breakdown
   * - Time-based productivity
   */

  // Get all tasks for analytics (from all lists)
  const allTasksForAnalytics = useLiveQuery(() => db.tasks.toArray(), []) || []

  // Analytics chart colors
  const CHART_COLORS = {
    completed: '#69db7c',
    pending: '#ffa94d',
    high: '#ff6b6b',
    medium: '#ffd43b',
    low: '#4dabf7',
    categories: ['#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa', '#f783ac', '#20c997', '#ffd43b', '#748ffc', '#a9e34b']
  }

  // Filter tasks based on analytics filters
  const getFilteredTasksForAnalytics = useMemo(() => {
    let filtered = [...allTasksForAnalytics]

    // Filter by category
    if (analyticsFilter.category !== 'all') {
      filtered = filtered.filter(t => t.categoryId === parseInt(analyticsFilter.category))
    }

    // Filter by priority
    if (analyticsFilter.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === analyticsFilter.priority)
    }

    // Filter by status
    if (analyticsFilter.status !== 'all') {
      filtered = filtered.filter(t =>
        analyticsFilter.status === 'completed' ? t.completed : !t.completed
      )
    }

    // Filter by date range
    if (analyticsFilter.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (analyticsFilter.dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(t => {
        const taskDate = new Date(t.createdAt)
        return taskDate >= startDate
      })
    }

    return filtered
  }, [allTasksForAnalytics, analyticsFilter])

  // Compute status data for pie chart
  const statusChartData = useMemo(() => {
    const completed = getFilteredTasksForAnalytics.filter(t => t.completed).length
    const pending = getFilteredTasksForAnalytics.filter(t => !t.completed).length
    return [
      { name: 'Completed', value: completed, color: CHART_COLORS.completed },
      { name: 'Pending', value: pending, color: CHART_COLORS.pending }
    ]
  }, [getFilteredTasksForAnalytics])

  // Compute category data for bar chart
  const categoryChartData = useMemo(() => {
    const categoryCount = {}
    getFilteredTasksForAnalytics.forEach(task => {
      const catId = task.categoryId || 'uncategorized'
      categoryCount[catId] = (categoryCount[catId] || 0) + 1
    })

    return Object.entries(categoryCount).map(([catId, count], index) => {
      const category = categories.find(c => c.id === parseInt(catId))
      return {
        name: category?.name || 'Uncategorized',
        tasks: count,
        color: category?.color || CHART_COLORS.categories[index % CHART_COLORS.categories.length]
      }
    }).sort((a, b) => b.tasks - a.tasks)
  }, [getFilteredTasksForAnalytics, categories])

  // Compute priority data for bar chart
  const priorityChartData = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 }
    const completedByPriority = { high: 0, medium: 0, low: 0 }

    getFilteredTasksForAnalytics.forEach(task => {
      const priority = task.priority || 'medium'
      priorities[priority] = (priorities[priority] || 0) + 1
      if (task.completed) {
        completedByPriority[priority] = (completedByPriority[priority] || 0) + 1
      }
    })

    return [
      {
        name: 'High',
        tasks: priorities.high,
        completed: completedByPriority.high,
        color: CHART_COLORS.high
      },
      {
        name: 'Medium',
        tasks: priorities.medium,
        completed: completedByPriority.medium,
        color: CHART_COLORS.medium
      },
      {
        name: 'Low',
        tasks: priorities.low,
        completed: completedByPriority.low,
        color: CHART_COLORS.low
      }
    ]
  }, [getFilteredTasksForAnalytics])

  // Compute time-based data for line chart (last 7 days)
  const timeChartData = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const created = getFilteredTasksForAnalytics.filter(t => {
        const taskDate = new Date(t.createdAt).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length

      const completed = getFilteredTasksForAnalytics.filter(t => {
        if (!t.completedAt) return false
        const taskDate = new Date(t.completedAt).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        shortDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created,
        completed
      })
    }

    return days
  }, [getFilteredTasksForAnalytics])

  // Compute insights
  const analyticsInsights = useMemo(() => {
    const tasks = getFilteredTasksForAnalytics
    const total = tasks.length
    const completed = tasks.filter(t => t.completed).length
    const pending = total - completed
    const productivityRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Find most used category
    const categoryCount = {}
    tasks.forEach(t => {
      const catId = t.categoryId || 'uncategorized'
      categoryCount[catId] = (categoryCount[catId] || 0) + 1
    })
    const mostUsedCatId = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0]
    const mostUsedCategory = categories.find(c => c.id === parseInt(mostUsedCatId))?.name || 'Uncategorized'

    // Count high priority tasks
    const highPriorityPending = tasks.filter(t => t.priority === 'high' && !t.completed).length

    // Generate insight messages
    const insights = []
    if (productivityRate >= 70) {
      insights.push("🎉 Great job! You're highly productive!")
    } else if (productivityRate >= 40) {
      insights.push("💪 Good progress! Keep going!")
    } else if (total > 0) {
      insights.push("📈 Time to boost your productivity!")
    }

    if (highPriorityPending > 0) {
      insights.push(`⚠️ You have ${highPriorityPending} high-priority task${highPriorityPending > 1 ? 's' : ''} pending`)
    }

    if (mostUsedCatId && mostUsedCatId !== 'uncategorized') {
      insights.push(`📁 Most active category: ${mostUsedCategory}`)
    }

    return {
      total,
      completed,
      pending,
      productivityRate,
      mostUsedCategory,
      highPriorityPending,
      insights
    }
  }, [getFilteredTasksForAnalytics, categories])

  // Reset analytics filters
  const resetAnalyticsFilters = () => {
    setAnalyticsFilter({
      category: 'all',
      priority: 'all',
      status: 'all',
      dateRange: 'all'
    })
  }

  // Emoji picker data
  const emojiCategories = {
    'People': ['👤', '😊', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🔬', '👩‍🔬', '🧑‍🎨', '👨‍🚀', '👩‍🚀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'],
    'Nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌲', '🌳', '🌴', '🌵', '🍀', '🍁', '🍂', '🌾', '🌿', '☘️', '🌱'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🌽'],
    'Objects': ['⭐', '✨', '💫', '🔥', '💎', '🎯', '🎨', '🎭', '🎪', '🎬', '🎮', '🎲', '🎸', '🎹', '🎺', '🎻'],
    'Symbols': ['❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️']
  }

  // Sync profile name with userName on load
  useEffect(() => {
    if (userProfile.name && userProfile.name !== userName) {
      setUserName(userProfile.name)
      localStorage.setItem('userName', userProfile.name)
    }
  }, [])

  // Update activeListId when lists change
  useEffect(() => {
    if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id)
    }
  }, [lists, activeListId])

  const activeList = lists.find(list => list.id === activeListId) || lists[0]

  const addTodo = async () => {
    if (newTaskText.trim() === '' || !activeListId) return

    // Combine date and time into a single datetime
    let dueDate = null
    if (newTaskDueDate) {
      dueDate = newTaskDueTime
        ? `${newTaskDueDate}T${newTaskDueTime}`
        : `${newTaskDueDate}T23:59`
    }

    await tasksDB.add(activeListId, newTaskText.trim(), newTaskPriority, dueDate, newTaskTags, newTaskNotes.trim(), newTaskCategory)
    setNewTaskText('')
    setNewTaskNotes('')
    setNewTaskPriority('medium')
    setNewTaskDueDate('')
    setNewTaskDueTime('')
    setNewTaskTags([])
    setTagInput('')
    setNewTaskCategory(null)
    setShowAddTaskModal(false)
  }

  const openAddTaskModal = () => {
    setNewTaskText('')
    setNewTaskNotes('')
    setNewTaskPriority('medium')
    setNewTaskDueDate('')
    setNewTaskDueTime('')
    setNewTaskTags([])
    setTagInput('')
    setNewTaskCategory(null)
    setShowAddTaskModal(true)
  }

  // Add tag handler
  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !newTaskTags.some(t => t.name === tag)) {
      const color = tagColors[newTaskTags.length % tagColors.length]
      setNewTaskTags([...newTaskTags, { name: tag, color }])
      setTagInput('')
    }
  }

  // Remove tag handler
  const removeTag = (tagName) => {
    setNewTaskTags(newTaskTags.filter(t => t.name !== tagName))
  }

  // Handle tag input keydown
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && tagInput === '' && newTaskTags.length > 0) {
      removeTag(newTaskTags[newTaskTags.length - 1].name)
    }
  }

  // Open edit task modal
  const openEditTaskModal = (todo) => {
    setEditingTaskId(todo.id)
    setEditTaskText(todo.text)
    setEditTaskNotes(todo.notes || '')
    setEditTaskPriority(todo.priority || 'medium')

    // Parse existing due date
    if (todo.dueDate) {
      const date = new Date(todo.dueDate)
      setEditTaskDueDate(date.toISOString().split('T')[0])
      setEditTaskDueTime(date.toTimeString().slice(0, 5))
    } else {
      setEditTaskDueDate('')
      setEditTaskDueTime('')
    }

    setEditTaskTags(todo.tags || [])
    setEditTagInput('')
    setEditTaskCategory(todo.categoryId || null)
    setShowEditTaskModal(true)
  }

  // Save edited task
  const saveEditedTask = async () => {
    if (editTaskText.trim() === '' || !editingTaskId) return

    let dueDate = null
    if (editTaskDueDate) {
      dueDate = editTaskDueTime
        ? `${editTaskDueDate}T${editTaskDueTime}`
        : `${editTaskDueDate}T23:59`
    }

    await tasksDB.update(editingTaskId, {
      text: editTaskText.trim(),
      notes: editTaskNotes.trim(),
      priority: editTaskPriority,
      dueDate,
      tags: editTaskTags,
      categoryId: editTaskCategory
    })

    setShowEditTaskModal(false)
    setEditingTaskId(null)
  }

  // Edit tag handlers
  const addEditTag = () => {
    const tag = editTagInput.trim()
    if (tag && !editTaskTags.some(t => t.name === tag)) {
      const color = tagColors[editTaskTags.length % tagColors.length]
      setEditTaskTags([...editTaskTags, { name: tag, color }])
      setEditTagInput('')
    }
  }

  const removeEditTag = (tagName) => {
    setEditTaskTags(editTaskTags.filter(t => t.name !== tagName))
  }

  const handleEditTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEditTag()
    } else if (e.key === 'Backspace' && editTagInput === '' && editTaskTags.length > 0) {
      removeEditTag(editTaskTags[editTaskTags.length - 1].name)
    }
  }

  const handleEditTaskKeyPress = (e) => {
    if (e.key === 'Enter' && editTaskText.trim()) {
      saveEditedTask()
    }
  }

  // Category management functions
  const addCategory = async () => {
    if (newCategoryName.trim() === '') return
    await categoriesDB.add(newCategoryName.trim(), newCategoryColor, newCategoryIcon)
    setNewCategoryName('')
    setNewCategoryColor('#4dabf7')
    setNewCategoryIcon('📁')
  }

  const startEditingCategory = (category) => {
    setEditingCategoryId(category.id)
    setEditCategoryName(category.name)
    setEditCategoryColor(category.color)
    setEditCategoryIcon(category.icon)
  }

  const saveEditedCategory = async () => {
    if (editCategoryName.trim() === '' || !editingCategoryId) return
    await categoriesDB.update(editingCategoryId, {
      name: editCategoryName.trim(),
      color: editCategoryColor,
      icon: editCategoryIcon
    })
    setEditingCategoryId(null)
  }

  const deleteCategory = async (categoryId) => {
    await categoriesDB.delete(categoryId)
    if (categoryFilter === categoryId) {
      setCategoryFilter(null)
    }
  }

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return categories.find(c => c.id === categoryId) || null
  }

  const addNewList = async () => {
    if (newListName.trim() === '') return

    const newId = await listsDB.add(newListName.trim())
    setActiveListId(newId)
    setNewListName('')
    setShowNewListInput(false)
  }

  const deleteList = async (listId) => {
    if (lists.length <= 1) return

    await listsDB.delete(listId)

    if (activeListId === listId) {
      const remainingLists = lists.filter(list => list.id !== listId)
      if (remainingLists.length > 0) {
        setActiveListId(remainingLists[0].id)
      }
    }
  }

  const startEditingList = (list) => {
    setEditingListId(list.id)
    setEditingListName(list.name)
  }

  const saveListName = async () => {
    if (editingListName.trim() === '') return

    await listsDB.update(editingListId, { name: editingListName.trim() })
    setEditingListId(null)
    setEditingListName('')
  }

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await tasksDB.update(id, {
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : null
      })
    }
  }

  const deleteTodo = async (id) => {
    await tasksDB.delete(id)
  }

  const clearCompleted = async () => {
    await tasksDB.deleteCompleted(activeListId)
  }

  // Toggle star/pin for a task
  const toggleStar = async (id) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      await tasksDB.update(id, { starred: !todo.starred })
    }
  }

  // Mark all tasks as completed
  const markAllCompleted = async () => {
    const incompleteTasks = todos.filter(t => !t.completed)
    const now = new Date().toISOString()
    for (const task of incompleteTasks) {
      await tasksDB.update(task.id, { completed: true, completedAt: now })
    }
  }

  // Unmark all tasks (set all to incomplete)
  const unmarkAllCompleted = async () => {
    const completedTasks = todos.filter(t => t.completed)
    for (const task of completedTasks) {
      await tasksDB.update(task.id, { completed: false, completedAt: null })
    }
  }

  // Toggle all tasks completion
  const toggleAllCompleted = async () => {
    if (allCompleted) {
      await unmarkAllCompleted()
    } else {
      await markAllCompleted()
    }
  }

  const handleAddTaskKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addTodo()
    } else if (e.key === 'Escape') {
      setShowAddTaskModal(false)
    }
  }

  const handleListKeyPress = (e) => {
    if (e.key === 'Enter') {
      addNewList()
    }
  }

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveListName()
    } else if (e.key === 'Escape') {
      setEditingListId(null)
    }
  }

  // Format due date for display
  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    if (dueDay.getTime() === today.getTime()) {
      return `Today, ${time}`
    } else if (dueDay.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${time}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }) + `, ${time}`
    }
  }

  // Format date for display in input
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // Format time for display in input
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return 'Select Time'
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Check if task is overdue
  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false
    return new Date(dueDate) < new Date()
  }

  // Format last updated time for display
  const formatLastUpdated = (updatedAt) => {
    if (!updatedAt) return null
    const date = new Date(updatedAt)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Just now (less than 1 minute)
    if (diffMins < 1) {
      return 'Just now'
    }
    // Minutes ago (less than 1 hour)
    if (diffMins < 60) {
      return `${diffMins}m ago`
    }
    // Hours ago (less than 24 hours)
    if (diffHours < 24) {
      return `${diffHours}h ago`
    }
    // Yesterday
    if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
    // Within last 7 days
    if (diffDays < 7) {
      return `${diffDays}d ago`
    }
    // Older - show full date
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Get task age label (Today, Yesterday, Older)
  const getTaskAgeLabel = (updatedAt, createdAt) => {
    const dateStr = updatedAt || createdAt
    if (!dateStr) return null

    const date = new Date(dateStr)
    const now = new Date()

    // Get start of today (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // Get start of yesterday
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)

    if (date >= todayStart) {
      return { label: 'Today', icon: CircleDot, iconColor: '#69db7c', className: 'age-today' }
    } else if (date >= yesterdayStart) {
      return { label: 'Yesterday', icon: CircleDot, iconColor: '#ffd43b', className: 'age-yesterday' }
    } else {
      return { label: 'Older', icon: CircleDot, iconColor: '#4dabf7', className: 'age-older' }
    }
  }

  const filteredTodos = todos
    .filter(todo => {
      // First apply search filter
      if (taskSearchQuery) {
        const query = taskSearchQuery.toLowerCase()
        const matchesText = todo.text?.toLowerCase().includes(query) || false
        const matchesNotes = todo.notes?.toLowerCase().includes(query) || false
        const matchesTags = todo.tags?.some(tag => tag.name?.toLowerCase().includes(query)) || false
        if (!matchesText && !matchesNotes && !matchesTags) return false
      }
      // Apply category filter
      if (categoryFilter !== null) {
        if (todo.categoryId !== categoryFilter) return false
      }
      // Then apply status filter
      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true
    })
    .sort((a, b) => {
      // First sort by starred (starred items first)
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      // Then sort by priority: high > medium > low
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
    })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4d4d'
      case 'medium': return '#ffa500'
      case 'low': return '#4dabf7'
      default: return '#ffa500'
    }
  }

  const activeTodosCount = todos.filter(todo => !todo.completed).length
  const completedTodosCount = todos.filter(todo => todo.completed).length
  const allCompleted = todos.length > 0 && activeTodosCount === 0

  // Toggle collapsed state for completed tasks
  const toggleCompletedCollapsed = () => {
    const newState = !completedCollapsed
    setCompletedCollapsed(newState)
    localStorage.setItem('completedCollapsed', JSON.stringify(newState))
  }

  // Separate active and completed todos for display
  const activeTodos = filteredTodos.filter(todo => !todo.completed)
  const completedTodos = filteredTodos.filter(todo => todo.completed)

  // Get all tasks count from IndexedDB
  const allTasks = useLiveQuery(() => db.tasks.toArray(), []) || []
  const totalTasks = allTasks.length
  const totalCompleted = allTasks.filter(t => t.completed).length

  // Today's Overview calculations
  const getTodaysTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return allTasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  }

  const todaysTasks = getTodaysTasks()
  const todaysTasksCount = todaysTasks.length
  const urgentTasksToday = todaysTasks.filter(t => t.priority === 'high').length
  const todaysCompletedCount = allTasks.filter(task => {
    if (!task.dueDate || !task.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dueDate = new Date(task.dueDate)
    return dueDate >= today && dueDate < tomorrow
  }).length

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    )
  }

  // Handle navigation
  const handleNavClick = (page) => {
    setCurrentPage(page)
    localStorage.setItem('currentPage', page)
    if (page === 'tasks' && !activeListId && lists.length > 0) {
      setActiveListId(lists[0].id)
    }
  }

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
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
            onClick={() => handleNavClick('home')}
          >
            <span className="nav-icon"><Home size={20} /></span>
            <span className="nav-label">Home</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`}
            onClick={() => handleNavClick('tasks')}
          >
            <span className="nav-icon"><ListTodo size={20} /></span>
            <span className="nav-label">My Tasks</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavClick('analytics')}
          >
            <span className="nav-icon"><BarChart3 size={20} /></span>
            <span className="nav-label">Analytics</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <span className="nav-icon"><Settings size={20} /></span>
            <span className="nav-label">Settings</span>
          </button>
        </nav>

        <div className="nav-footer">
          <div className="nav-stats">
            <div className="nav-stat">
              <span className="nav-stat-number">{totalTasks - totalCompleted}</span>
              <span className="nav-stat-label">Pending</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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

        {/* Welcome Section - Always visible on Home */}
        {currentPage === 'home' && (
          <section className="welcome-section home-page modern-dashboard">
            {/* Hero Greeting Section */}
            <div className="dashboard-hero">
              {userProfile.showGreeting && (
                <div className="hero-greeting-card">
                  <div className="hero-avatar-wrapper">
                    <div className="hero-avatar">
                      {userProfile.avatar || <User size={32} color="#fff" />}
                    </div>
                    <div className="hero-avatar-glow"></div>
                  </div>
                  <div className="hero-greeting-content">
                    <div className="hero-greeting-top">
                      <span className="hero-greeting-text">
                        {(() => { const IconComp = getGreeting().icon; return <IconComp size={24} color={getGreeting().iconColor} />; })()}
                        <span className="greeting-words">{getGreeting().text}</span>
                      </span>
                      {(userProfile.name || userName) && (
                        <h1 className="hero-user-name">{userProfile.name || userName}!</h1>
                      )}
                    </div>
                    <p className="hero-motivation">{getMotivationalMessage()}</p>
                    {userProfile.bio && <p className="hero-bio">"{userProfile.bio}"</p>}
                  </div>
                  <div className="hero-date-badge">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )}

              {!userProfile.showGreeting && (
                <div className="hero-greeting-card compact">
                  <h1 className="hero-compact-title">
                    <ListTodo size={28} /> Dashboard Overview
                  </h1>
                  <div className="hero-date-badge">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid - Modern Cards */}
            <div className="dashboard-stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-card-icon">
                  <ListTodo size={24} />
                </div>
                <div className="stat-card-content">
                  <span className="stat-card-value">{totalTasks}</span>
                  <span className="stat-card-label">Total Tasks</span>
                </div>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-card-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-card-content">
                  <span className="stat-card-value">{totalTasks - totalCompleted}</span>
                  <span className="stat-card-label">Remaining</span>
                </div>
              </div>

              <div className="stat-card stat-completed">
                <div className="stat-card-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="stat-card-content">
                  <span className="stat-card-value">{totalCompleted}</span>
                  <span className="stat-card-label">Completed</span>
                </div>
              </div>

              <div className="stat-card stat-progress">
                <div className="stat-card-icon progress-ring-wrapper">
                  <svg className="progress-ring" viewBox="0 0 36 36">
                    <path
                      className="progress-ring-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="progress-ring-fill"
                      strokeDasharray={`${totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <div className="stat-card-content">
                  <span className="stat-card-value">{totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0}%</span>
                  <span className="stat-card-label">Progress</span>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="dashboard-main-grid">
              {/* Today's Focus Card */}
              <div className="dashboard-card today-focus-card">
                <div className="dashboard-card-header">
                  <div className="card-header-left">
                    <Pin size={18} className="card-header-icon" />
                    <h3>Today's Focus</h3>
                  </div>
                  <span className="card-header-date">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="dashboard-card-body">
                  {todaysTasksCount === 0 && todaysCompletedCount === 0 ? (
                    <div className="today-empty-state">
                      <Sparkles size={40} className="empty-icon" />
                      <p>No tasks scheduled for today</p>
                      <button
                        className="today-add-task-btn"
                        onClick={() => { handleNavClick('tasks'); setTimeout(() => openAddTaskModal(), 100); }}
                      >
                        <Plus size={16} /> Add a task
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="today-stats-row">
                        <div className="today-stat-item main">
                          <span className="today-stat-num">{todaysTasksCount}</span>
                          <span className="today-stat-text">remaining</span>
                        </div>
                        {urgentTasksToday > 0 && (
                          <div className="today-stat-item urgent">
                            <Flame size={14} className="urgent-icon" />
                            <span className="today-stat-num">{urgentTasksToday}</span>
                            <span className="today-stat-text">urgent</span>
                          </div>
                        )}
                        <div className="today-stat-item done">
                          <Check size={14} className="done-icon" />
                          <span className="today-stat-num">{todaysCompletedCount}</span>
                          <span className="today-stat-text">done</span>
                        </div>
                      </div>

                      <div className="today-tasks-list-modern">
                        {todaysTasks
                          .sort((a, b) => {
                            const priorityOrder = { high: 0, medium: 1, low: 2 }
                            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1)
                          })
                          .slice(0, 4)
                          .map(task => (
                            <div
                              key={task.id}
                              className={`today-task-modern ${task.priority}`}
                              onClick={() => { setActiveListId(task.listId); handleNavClick('tasks'); }}
                            >
                              <div className="task-priority-dot" />
                              <span className="task-text-modern">{task.text}</span>
                              {task.priority === 'high' && <Flame size={14} className="flame-badge" />}
                              <span className="task-time-modern">
                                {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          ))}
                        {todaysTasks.length > 4 && (
                          <button className="view-more-tasks" onClick={() => handleNavClick('tasks')}>
                            +{todaysTasks.length - 4} more tasks
                          </button>
                        )}
                      </div>

                      {todaysTasksCount === 0 && todaysCompletedCount > 0 && (
                        <div className="today-all-done-banner">
                          <PartyPopper size={20} color="#ffd43b" />
                          <span>All done for today!</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="dashboard-card quick-actions-card">
                <div className="dashboard-card-header">
                  <div className="card-header-left">
                    <Sparkles size={18} className="card-header-icon" />
                    <h3>Quick Actions</h3>
                  </div>
                </div>

                <div className="dashboard-card-body">
                  <div className="quick-actions-modern">
                    <button className="action-btn-modern primary" onClick={() => { handleNavClick('tasks'); setTimeout(() => openAddTaskModal(), 100); }}>
                      <Plus size={20} />
                      <span>New Task</span>
                    </button>
                    <button className="action-btn-modern" onClick={() => handleNavClick('tasks')}>
                      <ListTodo size={20} />
                      <span>View Tasks</span>
                    </button>
                    <button className="action-btn-modern" onClick={() => { handleNavClick('tasks'); setRightSidebarOpen(true); setShowNewListInput(true); }}>
                      <FolderOpen size={20} />
                      <span>New List</span>
                    </button>
                    <button className="action-btn-modern" onClick={() => handleNavClick('analytics')}>
                      <BarChart3 size={20} />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Lists Section */}
            {lists.length > 0 && (
              <div className="dashboard-card lists-overview-card">
                <div className="dashboard-card-header">
                  <div className="card-header-left">
                    <Folder size={18} className="card-header-icon" />
                    <h3>Your Lists</h3>
                  </div>
                  <span className="lists-count-badge">{lists.length}</span>
                </div>

                <div className="dashboard-card-body">
                  <div className="lists-grid-modern">
                    {lists.map(list => {
                      const listTasks = allTasks.filter(t => t.listId === list.id)
                      const activeTasks = listTasks.filter(t => !t.completed).length
                      const completedTasks = listTasks.filter(t => t.completed).length
                      const urgentTasks = listTasks.filter(t => !t.completed && t.priority === 'high').length
                      const progressPercent = listTasks.length ? Math.round((completedTasks / listTasks.length) * 100) : 0

                      const emojiMatch = list.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u)
                      const listIcon = emojiMatch ? emojiMatch[0] : null
                      const listNameClean = emojiMatch ? list.name.slice(emojiMatch[0].length).trim() : list.name

                      return (
                        <div
                          key={list.id}
                          className={`list-card-modern ${activeListId === list.id ? 'active' : ''} ${urgentTasks > 0 ? 'has-urgent' : ''}`}
                          onClick={() => { setActiveListId(list.id); handleNavClick('tasks'); }}
                        >
                          <div className="list-card-top">
                            <div className="list-icon-wrapper">
                              {listIcon || <Folder size={20} />}
                            </div>
                            <div className="list-info">
                              <span className="list-name-modern">{listNameClean || list.name}</span>
                              <span className="list-task-count">{activeTasks} active</span>
                            </div>
                            {urgentTasks > 0 && (
                              <div className="list-urgent-indicator">
                                <Flame size={14} />
                              </div>
                            )}
                          </div>
                          <div className="list-card-bottom">
                            <div className="list-progress-modern">
                              <div className="list-progress-bar">
                                <div className="list-progress-fill" style={{ width: `${progressPercent}%` }} />
                              </div>
                              <span className="list-progress-percent">{progressPercent}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    <button className="add-list-card-modern" onClick={() => { setRightSidebarOpen(true); setShowNewListInput(true); }}>
                      <Plus size={24} />
                      <span>Add List</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tasks View */}
        {currentPage === 'tasks' && (
          <div className="tasks-page-modern">

            {activeList && (
              <>
                <header className="tasks-header-modern">
                  <div className="tasks-header-left">
                    <button
                      className={`mobile-menu-btn ${!rightSidebarOpen ? 'visible' : ''}`}
                      onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    >
                      <ListTodo size={20} />
                    </button>
                    <div className="tasks-title-group">
                      <h2 className="tasks-page-title">{activeList.name}</h2>
                      <span className="tasks-count-badge">{todos.length} tasks</span>
                    </div>
                  </div>
                  <div className="tasks-header-right">
                    <div className="tasks-progress-wrapper">
                      <div className="tasks-progress-bar">
                        <div
                          className="tasks-progress-fill"
                          style={{ width: `${todos.length ? (completedTodosCount / todos.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="tasks-progress-text">
                        {todos.length ? Math.round((completedTodosCount / todos.length) * 100) : 0}% complete
                      </span>
                    </div>
                    <button
                      className="toggle-sidebar-btn"
                      onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                      title={rightSidebarOpen ? 'Hide Lists' : 'Show Lists'}
                    >
                      {rightSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                  </div>
                </header>

                <div className="tasks-body-modern">
                  <div className="tasks-toolbar">
                    <button className="add-task-btn-modern" onClick={openAddTaskModal}>
                      <Plus size={20} />
                      <span>Add New Task</span>
                    </button>

                    {/* Task Search */}
                    <div className="task-search-modern">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        className="task-search-input-modern"
                        placeholder="Search tasks by name, notes, or tags..."
                        value={taskSearchQuery}
                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                      />
                      {taskSearchQuery && (
                        <button
                          className="search-clear-btn"
                          onClick={() => setTaskSearchQuery('')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="filter-section">
                    {todos.length > 0 && (
                      <div
                        className={`mark-all-container ${allCompleted ? 'all-done' : ''}`}
                        onClick={toggleAllCompleted}
                        title={allCompleted ? 'Unmark all tasks' : 'Mark all as completed'}
                      >
                        <div className={`mark-all-checkbox ${allCompleted ? 'checked' : ''}`}>
                          {allCompleted && <span className="check-icon">✓</span>}
                        </div>
                        <span className="mark-all-label">
                          {allCompleted ? 'All Done!' : 'Mark All'}
                        </span>
                      </div>
                    )}
                    <div className="filter-divider" />
                    <button
                      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All <span className="filter-count">{todos.length}</span>
                    </button>
                    <button
                      className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                      onClick={() => setFilter('active')}
                    >
                      Active <span className="filter-count">{activeTodosCount}</span>
                    </button>
                    <button
                      className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                      onClick={() => setFilter('completed')}
                    >
                      Completed <span className="filter-count">{completedTodosCount}</span>
                    </button>
                  </div>

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="category-filter-section">
                      <div className="category-filter-header">
                        <span className="category-filter-label">Filter by Category:</span>
                        <button
                          className="manage-categories-btn"
                          onClick={() => setShowCategoryManager(true)}
                          title="Manage Categories"
                        >
                          ⚙️
                        </button>
                      </div>
                      <div className="category-filter-chips">
                        <button
                          className={`category-filter-chip ${categoryFilter === null ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(null)}
                        >
                          <span className="category-chip-icon">📋</span>
                          <span>All</span>
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            className={`category-filter-chip ${categoryFilter === cat.id ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(cat.id)}
                            style={{ '--cat-color': cat.color }}
                          >
                            <span className="category-chip-icon">{cat.icon}</span>
                            <span>{cat.name}</span>
                            <span className="category-chip-count">
                              {todos.filter(t => t.categoryId === cat.id).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="tasks-container">
                    {filteredTodos.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          {filter === 'all' ? '📝' : filter === 'active' ? '🎯' : '🎉'}
                        </div>
                        <p className="empty-text">
                          {filter === 'all'
                            ? 'No tasks yet. Start by adding one!'
                            : filter === 'active'
                              ? 'All caught up! No active tasks.'
                              : 'No completed tasks yet.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Active Tasks */}
                        {activeTodos.length > 0 && (
                          <ul className="todo-list">
                            {activeTodos.map((todo, index) => (
                              <li
                                key={todo.id}
                                className="todo-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                              >
                                <div
                                  className="priority-indicator"
                                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                                  title={`${todo.priority || 'medium'} priority`}
                                />
                                <div
                                  className="checkbox"
                                  onClick={() => toggleTodo(todo.id)}
                                ></div>
                                <div className="todo-content">
                                  <span className="todo-text">{todo.text}</span>
                                  {todo.notes && (
                                    <p className="todo-notes">{todo.notes}</p>
                                  )}
                                  <div className="todo-meta">
                                    {getTaskAgeLabel(todo.updatedAt, todo.createdAt) && (
                                      <span className={`task-age-badge ${getTaskAgeLabel(todo.updatedAt, todo.createdAt).className}`}>
                                        {(() => { const AgeIcon = getTaskAgeLabel(todo.updatedAt, todo.createdAt).icon; return <AgeIcon size={12} color={getTaskAgeLabel(todo.updatedAt, todo.createdAt).iconColor} />; })()} {getTaskAgeLabel(todo.updatedAt, todo.createdAt).label}
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
                                    {todo.categoryId && getCategoryById(todo.categoryId) && (
                                      <span
                                        className="task-category-badge"
                                        style={{
                                          backgroundColor: getCategoryById(todo.categoryId).color + '20',
                                          color: getCategoryById(todo.categoryId).color,
                                          borderColor: getCategoryById(todo.categoryId).color
                                        }}
                                      >
                                        {getCategoryById(todo.categoryId).icon} {getCategoryById(todo.categoryId).name}
                                      </span>
                                    )}
                                    {todo.dueDate && (
                                      <span className={`due-date-badge ${isOverdue(todo.dueDate, todo.completed) ? 'overdue' : ''}`}>
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
                                    onClick={() => toggleStar(todo.id)}
                                    title={todo.starred ? 'Unstar task' : 'Star task'}
                                  >
                                    <Star size={18} fill={todo.starred ? '#ffd43b' : 'none'} color={todo.starred ? '#ffd43b' : '#6c757d'} />
                                  </button>
                                  <button
                                    className="edit-btn"
                                    onClick={() => openEditTaskModal(todo)}
                                    title="Edit task"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() => deleteTodo(todo.id)}
                                    title="Delete task"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Completed Tasks Section */}
                        {completedTodos.length > 0 && filter !== 'active' && (
                          <div className="completed-section">
                            <button
                              className="completed-toggle"
                              onClick={toggleCompletedCollapsed}
                            >
                              <span className={`toggle-arrow ${completedCollapsed ? '' : 'expanded'}`}>▶</span>
                              <span className="toggle-text">
                                Completed ({completedTodos.length})
                              </span>
                            </button>

                            <div className={`completed-tasks ${completedCollapsed ? 'collapsed' : ''}`}>
                              <ul className="todo-list">
                                {completedTodos.map((todo, index) => (
                                  <li
                                    key={todo.id}
                                    className="todo-item completed"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                  >
                                    <div
                                      className="priority-indicator"
                                      style={{ backgroundColor: getPriorityColor(todo.priority) }}
                                      title={`${todo.priority || 'medium'} priority`}
                                    />
                                    <div
                                      className="checkbox checked"
                                      onClick={() => toggleTodo(todo.id)}
                                    ></div>
                                    <div className="todo-content">
                                      <span className="todo-text">{todo.text}</span>
                                      {todo.notes && (
                                        <p className="todo-notes">{todo.notes}</p>
                                      )}
                                      <div className="todo-meta">
                                        {getTaskAgeLabel(todo.updatedAt, todo.createdAt) && (
                                          <span className={`task-age-badge ${getTaskAgeLabel(todo.updatedAt, todo.createdAt).className}`}>
                                            {getTaskAgeLabel(todo.updatedAt, todo.createdAt).emoji} {getTaskAgeLabel(todo.updatedAt, todo.createdAt).label}
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
                                        {todo.categoryId && getCategoryById(todo.categoryId) && (
                                          <span
                                            className="task-category-badge"
                                            style={{
                                              backgroundColor: getCategoryById(todo.categoryId).color + '20',
                                              color: getCategoryById(todo.categoryId).color,
                                              borderColor: getCategoryById(todo.categoryId).color
                                            }}
                                          >
                                            {getCategoryById(todo.categoryId).icon} {getCategoryById(todo.categoryId).name}
                                          </span>
                                        )}
                                        {todo.dueDate && (
                                          <span className="due-date-badge">
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
                                        onClick={() => toggleStar(todo.id)}
                                        title={todo.starred ? 'Unstar task' : 'Star task'}
                                      >
                                        {todo.starred ? '⭐' : '☆'}
                                      </button>
                                      <button
                                        className="edit-btn"
                                        onClick={() => openEditTaskModal(todo)}
                                        title="Edit task"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="delete-btn"
                                        onClick={() => deleteTodo(todo.id)}
                                        title="Delete task"
                                      >
                                        🗑
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {completedTodosCount > 0 && (
                    <div className="footer-actions">
                      <button className="clear-all-btn" onClick={clearCompleted}>
                        Clear {completedTodosCount} completed task{completedTodosCount !== 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics Dashboard Page */}
        {currentPage === 'analytics' && (
          <section className="analytics-page modern-analytics">
            <div className="analytics-header">
              <div className="analytics-header-content">
                <div className="analytics-title-group">
                  <div className="analytics-icon-wrapper">
                    <BarChart3 size={32} />
                  </div>
                  <div>
                    <h1 className="analytics-title">Analytics Dashboard</h1>
                    <p className="analytics-subtitle">Track your progress and visualize productivity insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {allTasksForAnalytics.length === 0 ? (
              <div className="analytics-empty-state">
                <div className="empty-icon-wrapper">
                  <BarChart3 size={48} />
                </div>
                <h2>No Analytics Data Yet</h2>
                <p>Create some tasks to start tracking your productivity and see beautiful visualizations!</p>
                <button
                  className="btn-go-to-tasks"
                  onClick={() => { setCurrentPage('tasks'); localStorage.setItem('currentPage', 'tasks'); }}
                >
                  <ListTodo size={18} /> Go to My Tasks
                </button>
              </div>
            ) : (
              <>
                {/* Filters Section */}
                <div className="analytics-filters-modern">
                  <div className="filters-header">
                    <div className="filters-title-group">
                      <Target size={18} className="filters-icon" />
                      <h3 className="filters-title">Filter Analytics</h3>
                    </div>
                    <button className="btn-reset-filters" onClick={resetAnalyticsFilters}>
                      <X size={14} /> Reset All
                    </button>
                  </div>
                  <div className="filters-grid">
                    <div className="filter-item">
                      <label className="filter-label">Category</label>
                      <select
                        className="filter-select"
                        value={analyticsFilter.category}
                        onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, category: e.target.value })}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="filter-item">
                      <label className="filter-label">Priority</label>
                      <select
                        className="filter-select"
                        value={analyticsFilter.priority}
                        onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, priority: e.target.value })}
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🔵 Low</option>
                      </select>
                    </div>
                    <div className="filter-item">
                      <label className="filter-label">Status</label>
                      <select
                        className="filter-select"
                        value={analyticsFilter.status}
                        onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, status: e.target.value })}
                      >
                        <option value="all">All Status</option>
                        <option value="completed">✅ Completed</option>
                        <option value="pending">⏳ Pending</option>
                      </select>
                    </div>
                    <div className="filter-item">
                      <label className="filter-label">Date Range</label>
                      <select
                        className="filter-select"
                        value={analyticsFilter.dateRange}
                        onChange={(e) => setAnalyticsFilter({ ...analyticsFilter, dateRange: e.target.value })}
                      >
                        <option value="all">All Time</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 3 Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="analytics-summary-cards-modern">
                  <div className="summary-card-modern productivity">
                    <div className="summary-card-header">
                      <div className="summary-card-icon-wrapper productivity">
                        <BarChart3 size={22} />
                      </div>
                      <span className="summary-card-label">Productivity Rate</span>
                    </div>
                    <div className="summary-card-body">
                      <div className="summary-card-value">
                        {analyticsInsights.productivityRate}<span className="value-unit">%</span>
                      </div>
                      <div className="summary-card-ring">
                        <svg viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#productivityGradient)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={`${analyticsInsights.productivityRate}, 100`}
                            style={{ filter: 'drop-shadow(0 0 6px rgba(105, 219, 124, 0.5))' }}
                          />
                          <defs>
                            <linearGradient id="productivityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#69db7c" />
                              <stop offset="100%" stopColor="#51cf66" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="summary-card-modern total">
                    <div className="summary-card-header">
                      <div className="summary-card-icon-wrapper total">
                        <ListTodo size={22} />
                      </div>
                      <span className="summary-card-label">Total Tasks</span>
                    </div>
                    <div className="summary-card-body">
                      <div className="summary-card-value">{analyticsInsights.total}</div>
                    </div>
                  </div>
                  <div className="summary-card-modern completed">
                    <div className="summary-card-header">
                      <div className="summary-card-icon-wrapper completed">
                        <CheckCircle2 size={22} />
                      </div>
                      <span className="summary-card-label">Completed</span>
                    </div>
                    <div className="summary-card-body">
                      <div className="summary-card-value">{analyticsInsights.completed}</div>
                    </div>
                  </div>
                  <div className="summary-card-modern pending">
                    <div className="summary-card-header">
                      <div className="summary-card-icon-wrapper pending">
                        <Clock size={22} />
                      </div>
                      <span className="summary-card-label">Pending</span>
                    </div>
                    <div className="summary-card-body">
                      <div className="summary-card-value">{analyticsInsights.pending}</div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {analyticsInsights.insights.length > 0 && (
                  <div className="analytics-insights-modern">
                    <div className="insights-header">
                      <Sparkles size={18} className="insights-icon" />
                      <h3 className="insights-title">Smart Insights</h3>
                    </div>
                    <div className="insights-list">
                      {analyticsInsights.insights.map((insight, index) => (
                        <div key={index} className="insight-item">
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Charts Grid */}
                <div className="analytics-charts-grid">
                  {/* Task Status Pie Chart */}
                  <div className="chart-card-modern">
                    <div className="chart-card-header">
                      <BarChart3 size={18} className="chart-icon" />
                      <h3 className="chart-title">Task Status Overview</h3>
                    </div>
                    <p className="chart-description">Distribution of completed vs pending tasks</p>
                    <div className="chart-container">
                      {getFilteredTasksForAnalytics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={statusChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {statusChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                              }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                              itemStyle={{ color: 'rgba(255,255,255,0.85)' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="chart-no-data">No data available</div>
                      )}
                    </div>
                    <div className="chart-stats">
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: CHART_COLORS.completed }}></span>
                        <span className="stat-label">Completed:</span>
                        <span className="stat-value">{statusChartData[0]?.value || 0}</span>
                      </div>
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: CHART_COLORS.pending }}></span>
                        <span className="stat-label">Pending:</span>
                        <span className="stat-value">{statusChartData[1]?.value || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Bar Chart */}
                  <div className="chart-card-modern">
                    <div className="chart-card-header">
                      <Target size={18} className="chart-icon" />
                      <h3 className="chart-title">Priority Distribution</h3>
                    </div>
                    <p className="chart-description">Tasks organized by priority level</p>
                    <div className="chart-container">
                      {priorityChartData.some(p => p.tasks > 0) ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={priorityChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={70} />
                            <Tooltip
                              contentStyle={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                              }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                              itemStyle={{ color: 'rgba(255,255,255,0.85)' }}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="tasks" name="Total" radius={[0, 4, 4, 0]}>
                              {priorityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                            <Bar dataKey="completed" name="Completed" fill="#69db7c" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="chart-no-data">No data available</div>
                      )}
                    </div>
                    <div className="chart-stats priority-stats">
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: CHART_COLORS.high }}></span>
                        <span className="stat-label">High:</span>
                        <span className="stat-value">{priorityChartData[0]?.tasks || 0}</span>
                      </div>
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: CHART_COLORS.medium }}></span>
                        <span className="stat-label">Medium:</span>
                        <span className="stat-value">{priorityChartData[1]?.tasks || 0}</span>
                      </div>
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: CHART_COLORS.low }}></span>
                        <span className="stat-label">Low:</span>
                        <span className="stat-value">{priorityChartData[2]?.tasks || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Bar Chart */}
                  <div className="chart-card-modern wide">
                    <div className="chart-card-header">
                      <Folder size={18} className="chart-icon" />
                      <h3 className="chart-title">Category Distribution</h3>
                    </div>
                    <p className="chart-description">Tasks organized by category</p>
                    <div className="chart-container">
                      {categoryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={categoryChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                              dataKey="name"
                              stroke="rgba(255,255,255,0.5)"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip
                              contentStyle={{
                                background: '#1a1a1a',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                              }}
                              labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                              itemStyle={{ color: 'rgba(255,255,255,0.85)' }}
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="tasks" name="Tasks" radius={[4, 4, 0, 0]}>
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="chart-no-data">No categorized tasks</div>
                      )}
                    </div>
                  </div>

                  {/* Time-Based Line Chart */}
                  <div className="chart-card wide">
                    <h3 className="chart-title">
                      <span>📅</span> Weekly Activity Trend
                    </h3>
                    <p className="chart-description">Tasks created and completed over the last 7 days</p>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={timeChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="shortDate"
                            stroke="rgba(255,255,255,0.5)"
                          />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <Tooltip
                            contentStyle={{
                              background: '#1a1a1a',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '10px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                            itemStyle={{ color: 'rgba(255,255,255,0.85)' }}
                            labelFormatter={(label, payload) => payload[0]?.payload?.date || label}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="created"
                            name="Created"
                            stroke="#4dabf7"
                            strokeWidth={3}
                            dot={{ fill: '#4dabf7', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            name="Completed"
                            stroke="#69db7c"
                            strokeWidth={3}
                            dot={{ fill: '#69db7c', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="chart-stats">
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: '#4dabf7' }}></span>
                        <span className="stat-label">Created this week:</span>
                        <span className="stat-value">{timeChartData.reduce((sum, d) => sum + d.created, 0)}</span>
                      </div>
                      <div className="chart-stat">
                        <span className="stat-dot" style={{ background: '#69db7c' }}></span>
                        <span className="stat-label">Completed this week:</span>
                        <span className="stat-value">{timeChartData.reduce((sum, d) => sum + d.completed, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Settings Page */}
        {currentPage === 'settings' && (
          <section className="settings-page modern-settings">
            <div className="settings-header">
              <div className="settings-header-content">
                <div className="settings-icon-wrapper">
                  <Settings size={28} />
                </div>
                <div>
                  <h1 className="settings-title">Settings</h1>
                  <p className="settings-subtitle">Manage your preferences and account</p>
                </div>
              </div>
            </div>

            <div className="settings-content">
              {/* Profile Section */}
              <div className="settings-section-modern profile-section">
                <div className="settings-section-header">
                  <div className="section-header-left">
                    <User size={20} className="section-icon" />
                    <div>
                      <h2 className="settings-section-title">Profile</h2>
                      <p className="settings-section-description">Personalize your account information</p>
                    </div>
                  </div>
                </div>

                {/* Profile Overview Card */}
                <div className="profile-overview-card-modern">
                  <div className="profile-avatar-large" onClick={() => isEditingProfile && setShowEmojiPicker(!showEmojiPicker)}>
                    <span className="avatar-display">{isEditingProfile ? tempProfile.avatar : userProfile.avatar}</span>
                    {isEditingProfile && <div className="avatar-edit-overlay"><Edit3 size={16} /></div>}
                  </div>
                  <div className="profile-info">
                    <h3 className="profile-name">{userProfile.name || 'Your Name'}</h3>
                    <p className="profile-email">{userProfile.email || 'No email set'}</p>
                    {userProfile.bio && <p className="profile-bio">"{userProfile.bio}"</p>}
                  </div>
                  {!isEditingProfile && (
                    <button className="btn-edit-profile-modern" onClick={startEditingProfile}>
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Emoji Picker Modal */}
                {showEmojiPicker && isEditingProfile && (
                  <div className="emoji-picker-modal">
                    <div className="emoji-picker-header">
                      <h4>Choose Avatar</h4>
                      <button className="emoji-picker-close" onClick={() => setShowEmojiPicker(false)}>✕</button>
                    </div>
                    <div className="emoji-picker-content">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category} className="emoji-category">
                          <h5 className="emoji-category-title">{category}</h5>
                          <div className="emoji-grid">
                            {emojis.map((emoji, i) => (
                              <button
                                key={i}
                                className={`emoji-option ${tempProfile.avatar === emoji ? 'selected' : ''}`}
                                onClick={() => {
                                  setTempProfile({ ...tempProfile, avatar: emoji })
                                  setShowEmojiPicker(false)
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Profile Form */}
                {isEditingProfile && (
                  <div className="profile-edit-form">
                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-field-label">
                          <span className="field-icon">👤</span>
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-field-input"
                          placeholder="Enter your name"
                          value={tempProfile.name}
                          onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                          maxLength={30}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-field-label">
                          <span className="field-icon">📧</span>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-field-input"
                          placeholder="your.email@example.com"
                          value={tempProfile.email}
                          onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label className="form-field-label">
                          <span className="field-icon">💭</span>
                          Bio / Status
                        </label>
                        <input
                          type="text"
                          className="form-field-input"
                          placeholder="What's on your mind?"
                          value={tempProfile.bio}
                          onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                          maxLength={60}
                        />
                        <span className="field-helper">{tempProfile.bio.length}/60 characters</span>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="btn-save-profile" onClick={saveProfile}>
                        💾 Save Changes
                      </button>
                      <button className="btn-cancel-profile" onClick={cancelEditingProfile}>
                        Cancel
                      </button>
                      <button className="btn-reset-profile" onClick={resetProfile}>
                        ⚠️ Reset Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* Reset Profile Button - Available when not editing */}
                {!isEditingProfile && (
                  <div className="profile-danger-zone">
                    <button className="btn-reset-profile-danger" onClick={resetProfile}>
                      ⚠️ Reset Profile
                    </button>
                    <p className="danger-zone-help">Reset your profile name, avatar, and bio to default values</p>
                  </div>
                )}

                {/* Preferences */}
                <div className="preferences-section">
                  <h3 className="preferences-title">⚙️ Preferences</h3>

                  <div className="preference-item">
                    <div className="preference-info">
                      <label className="preference-label">
                        <span className="preference-icon">🎨</span>
                        Theme
                      </label>
                      <p className="preference-description">Choose your preferred color theme</p>
                    </div>
                    <div className="preference-control">
                      <select
                        className="preference-select"
                        value={userProfile.theme}
                        onChange={(e) => {
                          const newProfile = { ...userProfile, theme: e.target.value }
                          setUserProfile(newProfile)
                          localStorage.setItem('userProfile', JSON.stringify(newProfile))
                          showToast('Theme preference saved! 🎨', 'success')
                        }}
                      >
                        <option value="dark">🌙 Dark</option>
                        <option value="light">☀️ Light (Coming Soon)</option>
                        <option value="system">💻 System (Coming Soon)</option>
                      </select>
                    </div>
                  </div>

                  <div className="preference-item">
                    <div className="preference-info">
                      <label className="preference-label">
                        <span className="preference-icon">👋</span>
                        Show Greeting
                      </label>
                      <p className="preference-description">Display greeting message on Home page</p>
                    </div>
                    <div className="preference-control">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={userProfile.showGreeting}
                          onChange={(e) => {
                            const newProfile = { ...userProfile, showGreeting: e.target.checked }
                            setUserProfile(newProfile)
                            localStorage.setItem('userProfile', JSON.stringify(newProfile))
                            showToast(e.target.checked ? 'Greeting enabled! 👋' : 'Greeting disabled', 'success')
                          }}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">📊 Account Statistics</h2>
                  <p className="settings-section-description">Your productivity overview</p>
                </div>

                <div className="settings-stats-grid">
                  <div className="settings-stat-card">
                    <div className="settings-stat-icon">📝</div>
                    <div className="settings-stat-value">{totalTasks}</div>
                    <div className="settings-stat-label">Total Tasks</div>
                  </div>
                  <div className="settings-stat-card">
                    <div className="settings-stat-icon">✅</div>
                    <div className="settings-stat-value">{totalCompleted}</div>
                    <div className="settings-stat-label">Completed</div>
                  </div>
                  <div className="settings-stat-card">
                    <div className="settings-stat-icon">📋</div>
                    <div className="settings-stat-value">{lists.length}</div>
                    <div className="settings-stat-label">Lists</div>
                  </div>
                  <div className="settings-stat-card">
                    <div className="settings-stat-icon">📁</div>
                    <div className="settings-stat-value">{categories.length}</div>
                    <div className="settings-stat-label">Categories</div>
                  </div>
                </div>
              </div>

              {/* Data Management Section */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <h2 className="settings-section-title">📦 Data Management</h2>
                  <p className="settings-section-description">Import and export your tasks in Excel format</p>
                </div>

                {/* Export Section */}
                <div className="data-management-card">
                  <div className="data-card-header">
                    <div className="data-card-icon">📤</div>
                    <div className="data-card-info">
                      <h3 className="data-card-title">Export to Excel</h3>
                      <p className="data-card-description">Download your tasks as an Excel file (.xlsx)</p>
                    </div>
                  </div>

                  <div className="export-options">
                    <label className="export-option-label">Export:</label>
                    <div className="export-filter-group">
                      <button
                        className={`export-filter-btn ${exportFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setExportFilter('all')}
                      >
                        📋 All Tasks
                      </button>
                      <button
                        className={`export-filter-btn ${exportFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setExportFilter('active')}
                      >
                        ⭕ Active Only
                      </button>
                      <button
                        className={`export-filter-btn ${exportFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setExportFilter('completed')}
                      >
                        ✅ Completed Only
                      </button>
                    </div>
                  </div>

                  <button className="btn-export-excel" onClick={exportToExcel}>
                    <span className="btn-icon">⬇️</span>
                    Download Excel File
                  </button>

                  <div className="export-info-box">
                    <strong>📋 Excel file includes:</strong>
                    <ul>
                      <li>Task Title</li>
                      <li>Description / Notes</li>
                      <li>Status (Active / Completed)</li>
                      <li>Priority (Low / Medium / High)</li>
                      <li>Due Date</li>
                      <li>Category / List Name</li>
                      <li>Tags</li>
                      <li>Created Date</li>
                    </ul>
                  </div>
                </div>

                {/* Import Section */}
                <div className="data-management-card">
                  <div className="data-card-header">
                    <div className="data-card-icon">📥</div>
                    <div className="data-card-info">
                      <h3 className="data-card-title">Import from Excel</h3>
                      <p className="data-card-description">Upload an Excel file to import tasks</p>
                    </div>
                  </div>

                  <div className="import-mode-selector">
                    <label className="import-mode-label">Import Mode:</label>
                    <div className="import-mode-group">
                      <label className="import-mode-option">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={(e) => setImportMode(e.target.value)}
                        />
                        <span className="import-mode-text">
                          <strong>🔗 Merge</strong> - Add to existing tasks
                        </span>
                      </label>
                      <label className="import-mode-option">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={(e) => setImportMode(e.target.value)}
                        />
                        <span className="import-mode-text">
                          <strong>🔄 Replace</strong> - Delete all & import
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="import-file-section">
                    <input
                      type="file"
                      id="excel-import-input"
                      accept=".xlsx"
                      onChange={handleImportFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="btn-import-excel"
                      onClick={() => document.getElementById('excel-import-input').click()}
                    >
                      <span className="btn-icon">⬆️</span>
                      Choose Excel File (.xlsx)
                    </button>
                  </div>

                  <div className="import-requirements">
                    <strong>✅ Required:</strong> Excel file must have a "Task Title" column
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Import Preview Modal */}
        {showImportPreview && importPreviewData && (
          <div className="modal-overlay" onClick={cancelImport}>
            <div className="modal import-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">📋 Import Preview</h3>
                <button className="modal-close" onClick={cancelImport}>✕</button>
              </div>

              <div className="modal-body">
                <div className="import-preview-summary">
                  <div className="preview-stat">
                    <div className="preview-stat-icon">📊</div>
                    <div className="preview-stat-content">
                      <div className="preview-stat-value">{importPreviewData.totalTasks}</div>
                      <div className="preview-stat-label">Tasks Found</div>
                    </div>
                  </div>

                  <div className="preview-stat">
                    <div className="preview-stat-icon">{importMode === 'merge' ? '🔗' : '🔄'}</div>
                    <div className="preview-stat-content">
                      <div className="preview-stat-value">{importMode === 'merge' ? 'Merge' : 'Replace'}</div>
                      <div className="preview-stat-label">Import Mode</div>
                    </div>
                  </div>
                </div>

                {importMode === 'replace' && (
                  <div className="import-warning-box">
                    <span className="warning-icon">⚠️</span>
                    <div className="warning-content">
                      <strong>Warning:</strong> Replace mode will delete all your existing tasks!
                    </div>
                  </div>
                )}

                <div className="import-preview-samples">
                  <h4 className="preview-samples-title">Sample Tasks:</h4>
                  <ul className="preview-samples-list">
                    {importPreviewData.sampleTasks.map((task, index) => (
                      <li key={index} className="preview-sample-item">
                        <span className="sample-number">{index + 1}.</span>
                        <span className="sample-text">{task}</span>
                      </li>
                    ))}
                    {importPreviewData.totalTasks > 5 && (
                      <li className="preview-more">
                        ... and {importPreviewData.totalTasks - 5} more tasks
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-confirm-import" onClick={confirmImport}>
                  <span className="btn-icon">✅</span>
                  Confirm Import
                </button>
                <button className="btn-cancel-import" onClick={cancelImport}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Lists */}
      <aside className={`right-sidebar ${rightSidebarOpen ? 'open' : 'closed'}`}>
        <div className="right-sidebar-header">
          <h2 className="right-sidebar-title">My Lists</h2>
          <button className="right-sidebar-toggle" onClick={() => setRightSidebarOpen(!rightSidebarOpen)}>
            {rightSidebarOpen ? '▶' : '◀'}
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
              <button className="create-list-btn" onClick={addNewList}>
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
                  onClick={() => { setActiveListId(list.id); setCurrentPage('tasks'); localStorage.setItem('currentPage', 'tasks'); }}
                >
                  {editingListId === list.id ? (
                    <input
                      type="text"
                      className="edit-list-input"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      onBlur={saveListName}
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
                          onClick={(e) => { e.stopPropagation(); startEditingList(list); }}
                          title="Edit"
                        >
                          ✎
                        </button>
                        {lists.length > 1 && (
                          <button
                            className="list-action-btn delete"
                            onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
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

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Task</h3>
              <button className="modal-close" onClick={() => setShowAddTaskModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What do you need to do?"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value.slice(0, 150))}
                  onKeyDown={handleAddTaskKeyPress}
                  maxLength={150}
                  autoFocus
                />
                <div className={`char-counter ${newTaskText.length >= 140 ? 'warning' : ''} ${newTaskText.length >= 150 ? 'limit' : ''}`}>
                  {newTaskText.length}/150
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Add additional details or context..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date & Time (Optional)</label>
                <div className="datetime-inputs">
                  <div className={`datetime-field ${newTaskDueDate ? 'has-value' : ''}`}>
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
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <span className="datetime-placeholder">{formatDateDisplay(newTaskDueDate)}</span>
                  </div>
                  <div className={`datetime-field ${newTaskDueTime ? 'has-value' : ''}`}>
                    <div className="datetime-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      className="datetime-input"
                      value={newTaskDueTime}
                      onChange={(e) => setNewTaskDueTime(e.target.value)}
                    />
                    <span className="datetime-placeholder">{formatTimeDisplay(newTaskDueTime)}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-options">
                  <button
                    className={`priority-option ${newTaskPriority === 'low' ? 'active' : ''}`}
                    onClick={() => setNewTaskPriority('low')}
                    style={{ '--priority-color': '#4dabf7' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#4dabf7' }} />
                    Low
                  </button>
                  <button
                    className={`priority-option ${newTaskPriority === 'medium' ? 'active' : ''}`}
                    onClick={() => setNewTaskPriority('medium')}
                    style={{ '--priority-color': '#ffa500' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#ffa500' }} />
                    Medium
                  </button>
                  <button
                    className={`priority-option ${newTaskPriority === 'high' ? 'active' : ''}`}
                    onClick={() => setNewTaskPriority('high')}
                    style={{ '--priority-color': '#ff4d4d' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#ff4d4d' }} />
                    High
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-selector">
                  <button
                    className={`category-option ${newTaskCategory === null ? 'active' : ''}`}
                    onClick={() => setNewTaskCategory(null)}
                  >
                    <span className="category-option-icon">📋</span>
                    <span>None</span>
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-option ${newTaskCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setNewTaskCategory(cat.id)}
                      style={{ '--cat-color': cat.color }}
                    >
                      <span className="category-option-icon">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    className="category-option add-category-btn"
                    onClick={() => setShowCategoryManager(true)}
                    title="Manage Categories"
                  >
                    <span className="category-option-icon">⚙️</span>
                    <span>Manage</span>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (Optional)</label>
                <div className="tags-input-container">
                  {newTaskTags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag-chip"
                      style={{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                      <button
                        className="tag-remove"
                        onClick={() => removeTag(tag.name)}
                        style={{ color: tag.color }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="tag-input"
                    placeholder={newTaskTags.length === 0 ? 'Type and press Enter...' : ''}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                  />
                </div>
                <div className="tag-suggestions">
                  {['Work', 'Personal', 'Urgent', 'Meeting', 'Ideas'].filter(s =>
                    !newTaskTags.some(t => t.name === s)
                  ).map((suggestion, i) => (
                    <button
                      key={i}
                      className="tag-suggestion"
                      onClick={() => {
                        const color = tagColors[(newTaskTags.length + i) % tagColors.length]
                        setNewTaskTags([...newTaskTags, { name: suggestion, color }])
                      }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddTaskModal(false)}>
                Cancel
              </button>
              <button
                className="btn-add"
                onClick={addTodo}
                disabled={!newTaskText.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <div className="modal-overlay" onClick={() => setShowEditTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Task</h3>
              <button className="modal-close" onClick={() => setShowEditTaskModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Task Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="What do you need to do?"
                  value={editTaskText}
                  onChange={(e) => setEditTaskText(e.target.value.slice(0, 150))}
                  onKeyDown={handleEditTaskKeyPress}
                  maxLength={150}
                  autoFocus
                />
                <div className={`char-counter ${editTaskText.length >= 140 ? 'warning' : ''} ${editTaskText.length >= 150 ? 'limit' : ''}`}>
                  {editTaskText.length}/150
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Add additional details or context..."
                  value={editTaskNotes}
                  onChange={(e) => setEditTaskNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date & Time (Optional)</label>
                <div className="datetime-inputs">
                  <div className={`datetime-field ${editTaskDueDate ? 'has-value' : ''}`}>
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
                      value={editTaskDueDate}
                      onChange={(e) => setEditTaskDueDate(e.target.value)}
                    />
                    <span className="datetime-placeholder">{formatDateDisplay(editTaskDueDate)}</span>
                  </div>
                  <div className={`datetime-field ${editTaskDueTime ? 'has-value' : ''}`}>
                    <div className="datetime-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      className="datetime-input"
                      value={editTaskDueTime}
                      onChange={(e) => setEditTaskDueTime(e.target.value)}
                    />
                    <span className="datetime-placeholder">{formatTimeDisplay(editTaskDueTime)}</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div className="priority-options">
                  <button
                    className={`priority-option ${editTaskPriority === 'low' ? 'active' : ''}`}
                    onClick={() => setEditTaskPriority('low')}
                    style={{ '--priority-color': '#4dabf7' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#4dabf7' }} />
                    Low
                  </button>
                  <button
                    className={`priority-option ${editTaskPriority === 'medium' ? 'active' : ''}`}
                    onClick={() => setEditTaskPriority('medium')}
                    style={{ '--priority-color': '#ffa500' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#ffa500' }} />
                    Medium
                  </button>
                  <button
                    className={`priority-option ${editTaskPriority === 'high' ? 'active' : ''}`}
                    onClick={() => setEditTaskPriority('high')}
                    style={{ '--priority-color': '#ff4d4d' }}
                  >
                    <span className="priority-dot" style={{ backgroundColor: '#ff4d4d' }} />
                    High
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-selector">
                  <button
                    className={`category-option ${editTaskCategory === null ? 'active' : ''}`}
                    onClick={() => setEditTaskCategory(null)}
                  >
                    <span className="category-option-icon">📋</span>
                    <span>None</span>
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`category-option ${editTaskCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setEditTaskCategory(cat.id)}
                      style={{ '--cat-color': cat.color }}
                    >
                      <span className="category-option-icon">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    className="category-option add-category-btn"
                    onClick={() => setShowCategoryManager(true)}
                    title="Manage Categories"
                  >
                    <span className="category-option-icon">⚙️</span>
                    <span>Manage</span>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (Optional)</label>
                <div className="tags-input-container">
                  {editTaskTags.map((tag, index) => (
                    <span
                      key={index}
                      className="tag-chip"
                      style={{ backgroundColor: tag.color + '20', borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                      <button
                        className="tag-remove"
                        onClick={() => removeEditTag(tag.name)}
                        style={{ color: tag.color }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="tag-input"
                    placeholder={editTaskTags.length === 0 ? 'Type and press Enter...' : ''}
                    value={editTagInput}
                    onChange={(e) => setEditTagInput(e.target.value)}
                    onKeyDown={handleEditTagKeyDown}
                    onBlur={addEditTag}
                  />
                </div>
                <div className="tag-suggestions">
                  {['Work', 'Personal', 'Urgent', 'Meeting', 'Ideas'].filter(s =>
                    !editTaskTags.some(t => t.name === s)
                  ).map((suggestion, i) => (
                    <button
                      key={i}
                      className="tag-suggestion"
                      onClick={() => {
                        const color = tagColors[(editTaskTags.length + i) % tagColors.length]
                        setEditTaskTags([...editTaskTags, { name: suggestion, color }])
                      }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditTaskModal(false)}>
                Cancel
              </button>
              <button
                className="btn-add"
                onClick={saveEditedTask}
                disabled={!editTaskText.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="modal-overlay" onClick={() => setShowCategoryManager(false)}>
          <div className="modal category-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📂 Manage Categories</h3>
              <button className="modal-close" onClick={() => setShowCategoryManager(false)}>
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
                        {categoryIcons.map((icon, i) => (
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
                        {categoryColors.map((color, i) => (
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
                      onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button
                      className="btn-add-category"
                      onClick={addCategory}
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
                              {categoryIcons.map((icon, i) => (
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
                              {categoryColors.map((color, i) => (
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
                                onKeyDown={(e) => e.key === 'Enter' && saveEditedCategory()}
                                autoFocus
                              />
                              <button className="btn-save-category" onClick={saveEditedCategory}>
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
                                onClick={() => startEditingCategory(cat)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="category-action-btn delete"
                                onClick={() => deleteCategory(cat.id)}
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
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCategoryManager(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default App
