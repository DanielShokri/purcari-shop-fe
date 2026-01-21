import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-sm text-gray-500 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {/* Home link */}
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-secondary transition-colors"
            aria-label="דף הבית"
          >
            <Home size={14} />
            <span>דף הבית</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              <ChevronLeft size={14} className="mx-1 text-gray-400" />
              {isLast || !item.href ? (
                <span 
                  className={`${isLast ? 'text-gray-900 font-medium' : 'text-gray-500'} line-clamp-1`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.href} 
                  className="hover:text-secondary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
