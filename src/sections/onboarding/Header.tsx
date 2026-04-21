import React from 'react';

interface HeaderProps {
  readonly className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-slate-900 cursor-pointer">arrow_back</span>
        <span className="text-xl font-black text-slate-900 tracking-tight">Focus</span>
      </div>
      <button className="text-sm font-medium text-slate-500 hover:text-slate-900">Skip</button>
    </header>
  );
};

export default Header;
