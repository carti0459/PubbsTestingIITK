import { 
  LayoutDashboard, 
  Route, 
  CreditCard, 
  User,
  HelpCircle,
  DollarSign
} from 'lucide-react'

export interface NavigationItem {
  id: string
  title: string
  icon: any
  href: string
  badge?: number
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/minDashboard',
  },
  {
    id: 'rides',
    title: 'My Rides',
    icon: Route,
    href: '/minDashboard/rides',
    badge: 2
  },
  {
    id: 'subscription',
    title: 'Subscription',
    icon: CreditCard,
    href: '/minDashboard/checkout',
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
    href: '/minDashboard/profile',
  },
  // Mobile-specific items
  {
    id: 'buy-subscription',
    title: 'Buy Subscription',
    icon: DollarSign,
    href: '/checkout',
    mobileOnly: true
  },
  {
    id: 'help',
    title: 'Help',
    icon: HelpCircle,
    href: '/help',
    mobileOnly: true
  }
]

export const getDesktopNavigationItems = () => 
  navigationItems.filter(item => !item.mobileOnly)

export const getMobileNavigationItems = () => 
  navigationItems.filter(item => !item.desktopOnly)

export const getAllNavigationItems = () => navigationItems