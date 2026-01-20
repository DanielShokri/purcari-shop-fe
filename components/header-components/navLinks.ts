export interface NavLink {
  name: string;
  path: string;
}

export const navLinks: NavLink[] = [
  { name: 'דף הבית', path: '/' },
  { name: 'חנות', path: '/products' },
  { name: 'אודות', path: '/about' },
  { name: 'צור קשר', path: '/contact' },
];
