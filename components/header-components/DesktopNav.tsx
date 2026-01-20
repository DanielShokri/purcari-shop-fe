import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from './navLinks';

const DesktopNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {navLinks.map((link) => (
        <Link 
          key={link.path} 
          to={link.path}
          className={`text-sm font-medium tracking-wide transition-colors hover:text-secondary ${
            location.pathname === link.path ? 'text-secondary font-bold' : 'text-gray-600'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default DesktopNav;
