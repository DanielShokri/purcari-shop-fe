// Route labels for breadcrumbs and page titles
export const routeLabels: Record<string, string> = {
  '/': 'ראשי',
  '/products': 'מוצרים',
  '/products/new': 'מוצר חדש',
  '/categories': 'קטגוריות',
  '/orders': 'הזמנות',
  '/users': 'משתמשים',
  '/media': 'מדיה',
  '/settings': 'הגדרות',
  '/search': 'תוצאות חיפוש',
  '/analytics': 'אנליטיקות',
  '/notifications': 'התראות',
  '/coupons': 'קופונים',
  '/coupons/new': 'קופון חדש',
  '/cart-rules': 'חוקי עגלה',
  '/cart-rules/new': 'חוק חדש',
};

// Get page label from pathname
export function getPageLabel(pathname: string): string {
  // Check for exact match first
  if (routeLabels[pathname]) return routeLabels[pathname];
  
  // Check for edit routes (e.g., /products/:id/edit)
  if (pathname.includes('/products/') && pathname.includes('/edit')) {
    return 'עריכת מוצר';
  }
  
  // Check for coupon edit routes (e.g., /coupons/:id/edit)
  if (pathname.includes('/coupons/') && pathname.includes('/edit')) {
    return 'עריכת קופון';
  }
  
  // Check for cart rule edit routes (e.g., /cart-rules/:id/edit)
  if (pathname.includes('/cart-rules/') && pathname.includes('/edit')) {
    return 'עריכת חוק עגלה';
  }
  
  // Check for order details (e.g., /orders/:id)
  if (pathname.startsWith('/orders/') && pathname !== '/orders') {
    return 'פרטי הזמנה';
  }
  
  return 'עמוד';
}

// Navigation configuration for sidebar
export interface NavItem {
  to: string;
  icon: string;
  label: string;
  matchPaths?: string[]; // Additional paths that should mark this item as active
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: 'ראשי',
    items: [
      { to: '/', icon: 'home', label: 'לוח בקרה' },
      { to: '/products', icon: 'inventory_2', label: 'מוצרים', matchPaths: ['/products/'] },
      { to: '/categories', icon: 'category', label: 'קטגוריות' },
    ],
  },
  {
    title: 'ניהול',
    items: [
      { to: '/orders', icon: 'shopping_bag', label: 'הזמנות' },
      { to: '/users', icon: 'group', label: 'משתמשים' },
      { to: '/coupons', icon: 'local_offer', label: 'קופונים', matchPaths: ['/coupons/'] },
      { to: '/cart-rules', icon: 'rule', label: 'חוקי עגלה', matchPaths: ['/cart-rules/'] },
      { to: '/analytics', icon: 'insights', label: 'אנליטיקות' },
      { to: '/notifications', icon: 'notifications', label: 'התראות' },
      { to: '/media', icon: 'image', label: 'מדיה' },
    ],
  },
];

export const secondaryNavItems: NavItem[] = [
  { to: '/search', icon: 'search', label: 'חיפוש' },
  { to: '/settings', icon: 'settings', label: 'הגדרות' },
];

// Helper to check if a nav item is active
export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (currentPath === item.to) return true;
  if (item.matchPaths) {
    return item.matchPaths.some(path => currentPath.startsWith(path));
  }
  return false;
}
