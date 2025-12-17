import React, { useState, useEffect } from 'react';
import { Activity, Category, Thought } from '../types';
import { Icons } from './Icon';

interface ActiveTrackerProps {
  activeActivity: Activity | null;
  categories: Category[];
  onStart: (categoryIds: string[], mood?: string) => void;
  onStop: () => void;
  onAddThought: (text: string) => void;
  multiSelectEnabled: boolean;
}

const MOODS = ['⚡️', '🙂', '😐', '😓', '😡'];

export const ActiveTracker: React.FC<ActiveTrackerProps> = ({
  activeActivity,
  categories,
  onStart,
  onStop,
  onAddThought,
  multiSelectEnabled
}) => {
  const [elapsed, setElapsed] = useState(0);
  // Store selected IDs as an array
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [thoughtText, setThoughtText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('🙂');

  useEffect(() => {
    if (activeActivity) {
      const interval = setInterval(() => {
        setElapsed(Date.now() - activeActivity.startTime);
      }, 1000);
      if (activeActivity.mood) {
        setSelectedMood(activeActivity.mood);
      }
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [activeActivity]);

  // Initial selection logic
  useEffect(() => {
    if (selectedCategoryIds.length === 0 && categories.length > 0) {
      // Default to first category if nothing selected
      setSelectedCategoryIds([categories[0].id]);
    }
  }, [categories]);

  const handleCategoryClick = (id: string) => {
    if (multiSelectEnabled) {
      if (selectedCategoryIds.includes(id)) {
        // Deselect, but allow empty here (start button disabled logic handles validation)
        setSelectedCategoryIds(prev => prev.filter(c => c !== id));
      } else {
        setSelectedCategoryIds(prev => [...prev, id]);
      }
    } else {
      // Single select mode
      setSelectedCategoryIds([id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedCategoryIds([]);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedCategoryIds.length > 0) {
      onStart(selectedCategoryIds, selectedMood);
    }
  };

  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (thoughtText.trim()) {
      onAddThought(thoughtText);
      setThoughtText('');
    }
  };

  // Determine active categories for display
  const currentCategories = activeActivity 
    ? categories.filter(c => activeActivity.categoryIds.includes(c.id))
    : categories.filter(c => selectedCategoryIds.includes(c.id));
  
  // Calculate Border Style
  const getBorderStyle = () => {
    if (currentCategories.length === 0) return '#3b82f6'; // Default Blue
    if (currentCategories.length === 1) return currentCategories[0].color;
    
    // Conic Gradient for multiple
    const colors = currentCategories.map(c => c.color);
    // Repeat first color at end to close loop smoothly
    const gradientColors = [...colors, colors[0]]; 
    const step = 100 / (gradientColors.length - 1);
    
    const gradientStops = gradientColors.map((c, i) => `${c} ${i * step}%`).join(', ');
    return `conic-gradient(from 0deg, ${gradientStops})`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 min-h-[80vh]">
      
      {/* Timer Display - Responsive Circle */}
      <div 
        className="relative w-[70vw] h-[70vw] max-w-[20rem] max-h-[20rem] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-500 shrink-0"
        style={{ 
          background: `linear-gradient(#0f172a, #0f172a) padding-box, ${getBorderStyle()} border-box`,
          border: '8px solid transparent',
        }}
      >
        <div className="text-4xl md:text-6xl font-mono font-bold tracking-wider text-white z-10">
          {formatTime(elapsed)}
        </div>
        {activeActivity ? (
          <div className="absolute bottom-6 md:bottom-10 flex flex-col items-center gap-1 z-10">
             {currentCategories.slice(0, 2).map(c => (
                <span key={c.id} className="text-xs md:text-sm font-semibold uppercase tracking-widest text-gray-400">
                  {c.name}
                </span>
             ))}
             {currentCategories.length > 2 && (
               <span className="text-xs text-gray-500">+{currentCategories.length - 2} more</span>
             )}
          </div>
        ) : (
          <div className="absolute bottom-6 md:bottom-10 flex flex-col items-center gap-1 z-10 animate-fade-in">
             <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
               Mood
             </span>
             <div className="flex gap-2 bg-surface/80 p-1.5 rounded-full backdrop-blur-sm border border-gray-700">
               {MOODS.map(m => (
                 <button
                   key={m}
                   onClick={() => setSelectedMood(m)}
                   className={`w-6 h-6 flex items-center justify-center rounded-full text-sm transition-all hover:scale-125 ${selectedMood === m ? 'bg-white/20 scale-110' : 'opacity-50 hover:opacity-100'}`}
                 >
                   {m}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!activeActivity ? (
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm text-gray-400 uppercase tracking-wide font-semibold">
              Select Activity
            </label>
            {multiSelectEnabled && selectedCategoryIds.length > 0 && (
              <button 
                onClick={handleClearSelection}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Clear selection"
              >
                <div className="w-5 h-5 flex items-center justify-center border border-current rounded-full text-xs">✕</div>
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
            {categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border-2 transition-all duration-200 flex items-center gap-2 text-sm md:text-base ${
                    isSelected
                      ? 'scale-105 bg-opacity-20' 
                      : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-surface'
                  }`}
                  style={{ 
                    borderColor: cat.color,
                    backgroundColor: isSelected ? `${cat.color}33` : undefined 
                  }}
                >
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium">{cat.name}</span>
                  {isSelected && multiSelectEnabled && <Icons.Check className="w-3 h-3 md:w-4 md:h-4" />}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={handleStart}
            disabled={selectedCategoryIds.length === 0}
            className="mt-6 group relative w-20 h-20 md:w-24 md:h-24 bg-green-500 hover:bg-green-600 rounded-full transition-all duration-300 transform hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
            title="Start Focus"
          >
            <Icons.Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-current ml-1" />
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
