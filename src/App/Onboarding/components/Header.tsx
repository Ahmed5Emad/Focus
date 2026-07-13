import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  readonly className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 ${className}`}>
      <div className="flex items-center gap-2">
        <ArrowLeft className="text-slate-900 cursor-pointer w-6 h-6" onClick={() => navigate(-1)} />
        <span className="text-xl font-black text-slate-900 tracking-tight">Focus</span>
      </div>
      <button className="text-sm font-medium text-slate-500 hover:text-slate-900" onClick={() => navigate('/dashboard')}>Skip</button>
    </header>
  );
};

export default Header;
