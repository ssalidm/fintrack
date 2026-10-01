import {
  CalendarClock,
  ChartPie,
  Landmark,
  LayoutDashboard,
  ReceiptText,
  Repeat2,
  Shapes,
  Target,
  type LucideIcon,
} from 'lucide-react'

export interface SidebarNavigationItem {
  readonly to: string
  readonly label: string
  readonly icon: LucideIcon
  readonly end?: boolean
}

export const sidebarNavigationItems: SidebarNavigationItem[] = [
  {
    to: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: ReceiptText,
  },
  {
    to: '/transfers',
    label: 'Transfers',
    icon: Repeat2,
  },
  {
    to: '/recurring',
    label: 'Recurring',
    icon: CalendarClock,
  },
  {
    to: '/accounts',
    label: 'Accounts',
    icon: Landmark,
  },
  {
    to: '/categories',
    label: 'Categories',
    icon: Shapes,
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: ChartPie,
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: Target,
  },
]
