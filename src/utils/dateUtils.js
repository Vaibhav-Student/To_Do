// Date utility functions for the Todo app

/**
 * Format due date for display in task items
 * Returns human-readable format like "Today, 3:00 PM" or "Tomorrow, 9:00 AM"
 */
export const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dueDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (dueDay.getTime() === today.getTime()) {
        return `Today, ${time}`;
    } else if (dueDay.getTime() === tomorrow.getTime()) {
        return `Tomorrow, ${time}`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        }) + `, ${time}`;
    }
};

/**
 * Format date string for display in date input placeholder
 * Returns format like "Wed, Jan 15"
 */
export const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Format time string for display in time input placeholder
 * Returns format like "3:00 PM"
 */
export const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return 'Select Time';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Check if a task is overdue
 * Returns true if due date is in the past and task is not completed
 */
export const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
};

/**
 * Format last updated time for display
 * Returns relative time like "Just now", "5m ago", "2h ago", etc.
 */
export const formatLastUpdated = (updatedAt) => {
    if (!updatedAt) return null;
    const date = new Date(updatedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Just now (less than 1 minute)
    if (diffMins < 1) {
        return 'Just now';
    }
    // Minutes ago (less than 1 hour)
    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }
    // Hours ago (less than 24 hours)
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    // Yesterday
    if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    // Within last 7 days
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }
    // Older - show full date
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Get task age label for grouping tasks
 * Returns object with label, emoji, and className
 */
export const getTaskAgeLabel = (updatedAt, createdAt) => {
    const dateStr = updatedAt || createdAt;
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const now = new Date();

    // Get start of today (midnight)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Get start of yesterday
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    if (date >= todayStart) {
        return { label: 'Today', emoji: '🟢', className: 'age-today' };
    } else if (date >= yesterdayStart) {
        return { label: 'Yesterday', emoji: '🟡', className: 'age-yesterday' };
    } else {
        return { label: 'Older', emoji: '🔵', className: 'age-older' };
    }
};

/**
 * Get today's start and end dates for filtering
 */
export const getTodayRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { today, tomorrow };
};
