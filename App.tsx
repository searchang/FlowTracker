import React, { useState, useEffect } from 'react';
import { Activity, Category, ViewMode, Thought } from './types';
import { ActiveTracker } from './components/ActiveTracker';
import { HistoryList } from './components/HistoryList';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { Icons } from './components/Icon';

// Default categories to bootstrap the app
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Deep Work', color: '#3b82f6' },
  { id: '2', name: 'Meeting', color: '#8b5cf6' },
  { id: '3', name: 'Learning', color: '#10b981' },
  { id: '4', name: 'Break', color: '#64748b' },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.TRACKER);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Settings State
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<boolean>(() => {
    return localStorage.getItem('multiSelectEnabled') === 'true';
  });

  const [includeTodayInComparison, setIncludeTodayInComparison] = useState<boolean>(() => {
    // Default to true if not set
    return localStorage.getItem('includeTodayInComparison') !== 'false';
  });

  // Data State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('activities');
    let parsed = saved ? JSON.parse(saved) : [];
    // Migration: Ensure categoryIds exists
    return parsed.map((a: any) => ({
      ...a,
      categoryIds: a.categoryIds || (a.categoryId ? [a.categoryId] : [])
    }));
  });

  const [activeActivity, setActiveActivity] = useState<Activity | null>(() => {
    const saved = localStorage.getItem('activeActivity');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Migration for active activity
    return {
      ...parsed,
      categoryIds: parsed.categoryIds || (parsed.categoryId ? [parsed.categoryId] : [])
    };
  });

  // Persistence
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('multiSelectEnabled', String(multiSelectEnabled)); }, [multiSelectEnabled]);
  useEffect(() => { localStorage.setItem('includeTodayInComparison', String(includeTodayInComparison)); }, [includeTodayInComparison]);
  
  useEffect(() => { 
    if (activeActivity) localStorage.setItem('activeActivity', JSON.stringify(activeActivity));
    else localStorage.removeItem('activeActivity');
  }, [activeActivity]);


  // Actions
  const handleStartActivity = (categoryIds: string[], mood?: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      categoryIds,
      startTime: Date.now(),
      endTime: null,
      thoughts: [],
      mood
    };
    setActiveActivity(newActivity);
  };

  const handleStopActivity = () => {
    if (activeActivity) {
      const finishedActivity = { ...activeActivity, endTime: Date.now() };
      setActivities([finishedActivity, ...activities]);
      setActiveActivity(null);
    }
  };

  const handleAddThought = (text: string) => {
    if (activeActivity) {
      const newThought: Thought = {
        id: crypto.randomUUID(),
        text,
        timestamp: Date.now()
      };
      setActiveActivity({
        ...activeActivity,
        thoughts: [...activeActivity.thoughts, newThought]
      });
    }
  };

  const NavButton = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => setView(mode)}
      className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-all flex-1 md:flex-none ${
        view === mode 
          ? 'text-primary bg-primary/10' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-surface'
      }`}
    >
      <Icon className="w-5 h-5 md:w-6 md:h-6 mb-1" strokeWidth={view === mode ? 2.5 : 2} />
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="h-[100dvh] bg-background text-gray-100 flex flex-col md:flex-row font-sans selection:bg-primary/30 overflow-hidden">
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="order-2 md:order-1 fixed bottom-0 w-full md:relative md:w-24 md:h-screen bg-surface/90 md:bg-surface backdrop-blur-lg md:backdrop-blur-none border-t md:border-t-0 md:border-r border-gray-800 z-50 flex md:flex-col justify-between items-center pb-safe md:py-8">
        <div className="hidden md:block mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Icons.Clock className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="flex md:flex-col w-full md:w-auto justify-around p-2 md:p-0 md:gap-4">
          <NavButton mode={ViewMode.TRACKER} icon={Icons.Play} label="Track" />
          <NavButton mode={ViewMode.HISTORY} icon={Icons.List} label="History" />
          <NavButton mode={ViewMode.ANALYTICS} icon={Icons.Chart} label="Analytics" />
          <NavButton mode={ViewMode.SETTINGS} icon={Icons.Settings} label="Settings" />
        </div>

        <div className="hidden md:block mt-auto text-xs text-gray-600 text-center">
          v1.2
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="order-1 md:order-2 flex-1 overflow-y-auto h-full p-4 md:p-8 pb-24 md:pb-8 relative">
        <header className="mb-6 md:mb-8 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur-sm z-40 py-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {view === ViewMode.TRACKER && (activeActivity ? 'Current Focus' : 'Start Focus')}
              {view === ViewMode.HISTORY && 'Activity Log'}
              {view === ViewMode.ANALYTICS && 'Performance'}
              {view === ViewMode.SETTINGS && 'Settings'}
            </h1>
            {view === ViewMode.HISTORY && (
              <button 
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`p-2 rounded-full transition-colors ${isCalendarOpen ? 'bg-primary text-white' : 'text-gray-400 hover:text-white bg-surface'}`}
              >
                <Icons.Calendar className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <p className="text-gray-500 mt-1 text-xs md:text-sm ml-2 hidden md:block">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {activeActivity && view !== ViewMode.TRACKER && (
             <button 
              onClick={() => setView(ViewMode.TRACKER)}
              className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-semibold flex items-center gap-2 animate-pulse"
             >
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
               <span className="hidden sm:inline">Timer Running</span>
               <span className="sm:hidden">Active</span>
             </button>
          )}
        </header>

        <div className="animate-fade-in pb-safe">
          {view === ViewMode.TRACKER && (
            <ActiveTracker
              activeActivity={activeActivity}
              categories={categories}
              onStart={handleStartActivity}
              onStop={handleStopActivity}
              onAddThought={handleAddThought}
              multiSelectEnabled={multiSelectEnabled}
            />
          )}

          {view === ViewMode.HISTORY && (
            <HistoryList 
              activities={activities} 
              categories={categories} 
              isCalendarOpen={isCalendarOpen}
              onCloseCalendar={() => setIsCalendarOpen(false)}
              includeTodayInComparison={includeTodayInComparison}
            />
          )}

          {view === ViewMode.ANALYTICS && (
            <Analytics activities={activities} categories={categories} />
          )}

          {view === ViewMode.SETTINGS && (
            <Settings 
              categories={categories} 
              activities={activities}
              onUpdateCategories={setCategories} 
              onUpdateActivities={setActivities}
              multiSelectEnabled={multiSelectEnabled}
              setMultiSelectEnabled={setMultiSelectEnabled}
              includeTodayInComparison={includeTodayInComparison}
              setIncludeTodayInComparison={setIncludeTodayInComparison}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
