import React, { useState, useEffect } from 'react';
import { Activity, Category, Thought } from '../types';
import { Icons } from './Icon';

interface ActiveTrackerProps {
  activeActivity: Activity | null;
  categories: Category[];
  onStart: (categoryId: string) => void;
  onStop: () => void;
  onAddThought: (text: string) => void;
}

export const ActiveTracker: React.FC<ActiveTrackerProps> = ({
  activeActivity,
  categories,
  onStart,
  onStop,
  onAddThought,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [thoughtText, setThoughtText] = useState('');

  useEffect(() => {
    if (activeActivity) {
      const interval = setInterval(() => {
        setElapsed(Date.now() - activeActivity.startTime);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [activeActivity]);

  // Update selected category if the categories list changes or initializes
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedCategory) {
      onStart(selectedCategory);
    }
  };

  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (thoughtText.trim()) {
      onAddThought(thoughtText);
      setThoughtText('');
    }
  };

  const currentCategory = activeActivity 
    ? categories.find(c => c.id === activeActivity.categoryId) 
    : categories.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 min-h-[80vh]">
      
      {/* Timer Display - Responsive Circle */}
      <div 
        className="relative w-[70vw] h-[70vw] max-w-[20rem] max-h-[20rem] rounded-full flex items-center justify-center border-4 md:border-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-colors duration-500 shrink-0"
        style={{ borderColor: currentCategory?.color || '#3b82f6' }}
      >
        <div className="text-4xl md:text-6xl font-mono font-bold tracking-wider text-white">
          {formatTime(elapsed)}
        </div>
        {activeActivity && (
          <div className="absolute bottom-6 md:bottom-10 text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-400">
            {currentCategory?.name}
          </div>
        )}
      </div>

      {/* Controls */}
      {!activeActivity ? (
        <div className="flex flex-col items-center space-y-4 w-full">
          <label className="text-xs md:text-sm text-gray-400 uppercase tracking-wide font-semibold">Select Activity</label>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border-2 transition-all duration-200 flex items-center gap-2 text-sm md:text-base ${
                  selectedCategory === cat.id 
                    ? 'scale-105 bg-opacity-20' 
                    : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-surface'
                }`}
                style={{ 
                  borderColor: cat.color,
                  backgroundColor: selectedCategory === cat.id ? `${cat.color}33` : undefined 
                }}
              >
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleStart}
            disabled={!selectedCategory}
            className="mt-6 md:mt-8 group relative px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            <div className="flex items-center justify-center gap-3 text-white font-bold text-lg md:text-xl">
              <Icons.Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              <span>START FOCUS</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center space-y-4 md:space-y-6 animate-fade-in">
          
          {/* Thought Pinning */}
          <form onSubmit={handleAddThought} className="w-full max-w-md relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Pin className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
             </div>
            <input
              type="text"
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              placeholder="Pin a thought..."
              className="w-full bg-surface border border-gray-700 text-white rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!thoughtText.trim()}
              className="absolute right-2 top-2 p-1 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg transition-colors disabled:opacity-0"
            >
              <Icons.Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Recent Thoughts Preview */}
          {activeActivity.thoughts.length > 0 && (
            <div className="w-full max-w-md space-y-2">
              <h4 className="text-xs text-gray-500 uppercase font-semibold">Session Thoughts</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {activeActivity.thoughts.slice().reverse().map((t) => (
                  <div key={t.id} className="text-sm bg-surface/50 p-2 rounded border-l-2 border-primary/50 text-gray-300 flex justify-between items-center">
                    <span className="truncate mr-2">{t.text}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onStop}
            className="w-full md:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-white font-bold text-lg md:text-xl shadow-lg shadow-red-500/20"
          >
            <Icons.Stop className="w-6 h-6 fill-current" />
            <span>STOP ACTIVITY</span>
          </button>
        </div>
      )}
    </div>
  );
};
