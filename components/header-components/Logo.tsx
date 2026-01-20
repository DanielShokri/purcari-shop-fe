import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex-shrink-0">
      <div className="text-2xl font-bold text-secondary tracking-widest uppercase">
        Purcari
      </div>
      <div className="text-[10px] text-gray-500 tracking-[0.2em] text-center -mt-1 uppercase">
        Israel
      </div>
    </Link>
  );
};

export default Logo;
