// Modern SVG Icons using Lucide React
// This replaces emoji icons for a professional, modern look

import {
  // Navigation icons
  Home,
  ListTodo,
  BarChart3,
  Settings,
  ListOrdered,
  
  // Time of day icons (for greeting)
  Sunrise,
  Sun,
  Sunset,
  Moon,
  
  // Task icons
  Pin,
  Flame,
  Star,
  Check,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Clock,
  Calendar,
  CalendarClock,
  AlertCircle,
  AlertTriangle,
  
  // Category icons
  Folder,
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
  Sparkles,
  Gift,
  Smartphone,
  
  // Profile/Avatar icons
  User,
  UserCircle,
  Smile,
  Glasses,
  PartyPopper,
  Crown,
  Dog,
  Cat,
  Award,
  Zap,
  Coffee,
  Headphones,
  Camera,
  Rocket,
  Brain,
  
  // Status icons
  CircleDot,
  CheckCheck,
  MoreHorizontal,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  
  // Priority indicators
  ArrowUp,
  ArrowRight,
  ArrowDown,
  
  // Misc icons
  Tag,
  Tags,
  Bell,
  BellRing,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Lightbulb,
  TrendingUp,
  Activity,
  PieChart,
} from 'lucide-react';

// Icon size constants for consistency
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Navigation icons mapping
export const NAV_ICONS = {
  home: Home,
  tasks: ListTodo,
  analytics: BarChart3,
  settings: Settings,
  lists: ListOrdered,
};

// Time-based greeting icons
export const GREETING_ICONS = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

// Category icons for selection - Modern SVG alternatives
export const CATEGORY_ICONS_MAP = {
  folder: Folder,
  briefcase: Briefcase,
  home: House,
  shopping: ShoppingCart,
  health: Heart,
  learning: BookOpen,
  finance: Wallet,
  goals: Target,
  gaming: Gamepad2,
  travel: Plane,
  food: UtensilsCrossed,
  fitness: Dumbbell,
  art: Palette,
  music: Music,
  email: Mail,
  tools: Wrench,
  nature: Sprout,
  favorite: Star,
  gift: Gift,
  mobile: Smartphone,
};

// Array of category icon keys for picker
export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS_MAP);

// Avatar icons for profile
export const AVATAR_ICONS_MAP = {
  user: User,
  smile: Smile,
  glasses: Glasses,
  party: PartyPopper,
  crown: Crown,
  dog: Dog,
  cat: Cat,
  award: Award,
  zap: Zap,
  coffee: Coffee,
  headphones: Headphones,
  camera: Camera,
  rocket: Rocket,
  brain: Brain,
  star: Star,
};

// Array of avatar icon keys for picker
export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS_MAP);

// Task age indicator icons
export const TASK_AGE_ICONS = {
  today: CircleDot,
  yesterday: Circle,
  older: Circle,
};

// Priority icons
export const PRIORITY_ICONS = {
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
};

// Action icons
export const ACTION_ICONS = {
  add: Plus,
  edit: Edit3,
  delete: Trash2,
  check: Check,
  close: X,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
};

// Status icons
export const STATUS_ICONS = {
  pending: Circle,
  completed: CheckCircle2,
  urgent: Flame,
  starred: Star,
  pinned: Pin,
};

// Export all Lucide components for direct use
export {
  Home,
  ListTodo,
  BarChart3,
  Settings,
  ListOrdered,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Pin,
  Flame,
  Star,
  Check,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Clock,
  Calendar,
  CalendarClock,
  AlertCircle,
  AlertTriangle,
  Folder,
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
  Sparkles,
  Gift,
  Smartphone,
  User,
  UserCircle,
  Smile,
  Glasses,
  PartyPopper,
  Crown,
  Dog,
  Cat,
  Award,
  Zap,
  Coffee,
  Headphones,
  Camera,
  Rocket,
  Brain,
  CircleDot,
  CheckCheck,
  MoreHorizontal,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Tag,
  Tags,
  Bell,
  BellRing,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Lightbulb,
  TrendingUp,
  Activity,
  PieChart,
};

// Helper function to render icon with consistent styling
export const Icon = ({ icon: IconComponent, size = 'md', className = '', color, ...props }) => {
  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.md;
  
  return (
    <IconComponent
      size={pixelSize}
      className={`lucide-icon ${className}`}
      color={color}
      strokeWidth={1.75}
      {...props}
    />
  );
};

// Category icon renderer
export const CategoryIcon = ({ iconKey, size = 'md', color = 'currentColor', className = '' }) => {
  const IconComponent = CATEGORY_ICONS_MAP[iconKey] || Folder;
  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.md;
  
  return (
    <IconComponent
      size={pixelSize}
      color={color}
      className={`category-icon ${className}`}
      strokeWidth={1.75}
    />
  );
};

// Avatar icon renderer
export const AvatarIcon = ({ iconKey, size = 'lg', color = 'currentColor', className = '' }) => {
  const IconComponent = AVATAR_ICONS_MAP[iconKey] || User;
  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.lg;
  
  return (
    <IconComponent
      size={pixelSize}
      color={color}
      className={`avatar-icon ${className}`}
      strokeWidth={1.5}
    />
  );
};

// Greeting icon renderer based on time of day
export const GreetingIcon = ({ period, size = 'lg', className = '' }) => {
  const IconComponent = GREETING_ICONS[period] || Sun;
  const pixelSize = typeof size === 'number' ? size : ICON_SIZES[size] || ICON_SIZES.lg;
  
  // Color based on time of day
  const colors = {
    morning: '#ffa94d',
    afternoon: '#ffd43b',
    evening: '#ff8c42',
    night: '#748ffc',
  };
  
  return (
    <IconComponent
      size={pixelSize}
      color={colors[period] || colors.afternoon}
      className={`greeting-icon ${className}`}
      strokeWidth={1.75}
    />
  );
};
