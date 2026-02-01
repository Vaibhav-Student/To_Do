// Color constants for the Todo app

// Tag colors for task tags
export const TAG_COLORS = [
  '#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7',
  '#9775fa', '#f783ac', '#20c997', '#a9e34b', '#748ffc'
];

// Category colors for category selection
export const CATEGORY_COLORS = [
  '#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa',
  '#f783ac', '#20c997', '#ffd43b', '#748ffc', '#a9e34b'
];

// Priority colors
export const PRIORITY_COLORS = {
  high: '#ff4d4d',
  medium: '#ffa500',
  low: '#4dabf7'
};

// Chart colors for analytics
export const CHART_COLORS = {
  completed: '#69db7c',
  pending: '#ffa94d',
  high: '#ff6b6b',
  medium: '#ffd43b',
  low: '#4dabf7',
  categories: ['#4dabf7', '#69db7c', '#ffa94d', '#ff6b6b', '#9775fa', '#f783ac', '#20c997', '#ffd43b', '#748ffc', '#a9e34b']
};

// Get priority color utility
export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
};
