import { useState, useEffect } from 'react';
import { Plus, Calendar, Folder, User, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskCreation() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user, currentWorkspaceId } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      navigate('/dashboard');
      return;
    }

    if (inputValue.length === 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < 2 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    } else if (e.key === 'Enter' && inputValue.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('tasks')
          .insert([{ 
            title: inputValue.trim(), 
            user_id: user?.id,
            workspace_id: currentWorkspaceId 
          }]);
        
        if (error) throw error;
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Error creating task:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 relative">
          <Plus className="text-zinc-400 w-6 h-6 mr-3" />
          <input
            autoFocus
            className="w-full bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0 p-0 h-10"
            placeholder="What needs to be done?"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2 ml-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              Enter <CornerDownLeft className="w-3 h-3" />
            </kbd>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1 bg-zinc-50/50 dark:bg-zinc-900/50">
          {inputValue.length === 0 ? (
            <>
              <div className="mb-4">
                <div className="px-3 py-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</span>
                </div>
                
                <button className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group transition-colors ${selectedIndex === 0 ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Schedule for Today</span>
                  </div>
                  <div className={`flex gap-1 transition-opacity ${selectedIndex === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">⌘</kbd>
                    <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">T</kbd>
                  </div>
                </button>

                <button className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group transition-colors mt-1 ${selectedIndex === 1 ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                      <Folder className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Add to Project</span>
                  </div>
                  <div className={`flex gap-1 transition-opacity ${selectedIndex === 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">⌘</kbd>
                    <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">P</kbd>
                  </div>
                </button>

                <button className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group transition-colors mt-1 ${selectedIndex === 2 ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Assign to...</span>
                  </div>
                  <div className={`flex gap-1 transition-opacity ${selectedIndex === 2 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">@</kbd>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <ArrowRight className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">Press Enter to create task</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">"{inputValue}"</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Esc</kbd>
              <span className="text-xs">Close</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">↑</kbd>
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">↓</kbd>
              <span className="text-xs">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">↵</kbd>
              <span className="text-xs">Select</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            Focus Tasks
          </div>
        </div>
      </div>
    </div>
  );
}
