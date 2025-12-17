import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Activity, Category } from '../types';
import { Icons } from './Icon';

interface HistoryListProps {
  activities: Activity[];
  categories: Category[];
  isCalendarOpen: boolean;
  onCloseCalendar: () => void;
  includeTodayInComparison: boolean;
}

// Extracted Component to maintain state and refs independently of HistoryList renders
interface CalendarModalProps {
  onClose: () => void;
  selectedDates: string[];
  onDateClick: (date: string) => void;
  onClear: () => void;
  activitiesByDate: Record<string, Activity[]>;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
  onClose, 
  selectedDates, 
  onDateClick, 
  onClear, 
  activitiesByDate 
}) => {
  const todayRef = useRef<HTMLButtonElement>(null);

  // Scroll to today only on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, []);

  // Continuous Calendar Generation
  // Range: 12 months back -> 12 months forward (Increased range for better utility)
  const today = new Date();
  
  const startRange = new Date(today.getFullYear(), today.getMonth() - 12, 1);
  const startDayOffset = startRange.getDay(); // 0 is Sunday
  const startDate = new Date(startRange);
  startDate.setDate(startDate.getDate() - startDayOffset);

  const endRange = new Date(today.getFullYear(), today.getMonth() + 12, 0);
  
  const allDays: Date[] = [];
  const loopDate = new Date(startDate);
  
  while (loopDate <= endRange) {
    allDays.push(new Date(loopDate));
    loopDate.setDate(loopDate.getDate() + 1);
  }

  // Month Labels Logic
  const monthLabels: { name: string, rowIndex: number }[] = [];
  allDays.forEach((d, i) => {
      // Add label if it's the 1st of the month
      if (d.getDate() === 1) {
          monthLabels.push({
              name: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
              rowIndex: Math.floor(i / 7)
          });
      }
  });

  // Ensure first visible month has a label if 1st was before startDate
  if (monthLabels.length === 0 || (monthLabels[0].rowIndex > 0)) {
     const firstMonthDate = allDays[7]; // Pick a date in the second row (safely in the view)
     const firstLabel = {
         name: firstMonthDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
         rowIndex: 0
     };
     // Only add if the existing first label isn't for the same month
     if (monthLabels.length === 0 || monthLabels[0].name !== firstLabel.name) {
         monthLabels.unshift(firstLabel);
     }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const ROW_HEIGHT = 56; // Increased slightly for better touch target

  return (
    <div className="fixed inset-0 z-50 flex flex-col pt-24 md:pt-32">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative flex-1 bg-surface border-t border-gray-700 shadow-2xl overflow-hidden flex flex-col rounded-t-3xl animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-surface z-10 shadow-sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Calendar className="w-5 h-5 text-primary" /> Select Days
          </h2>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30"
            >
              Today
            </button>
            <button 
              onClick={onClear}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
              disabled={selectedDates.length === 0}
            >
              Clear
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <Icons.X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto pb-safe scrollbar-thin">
           <div className="flex sticky top-0 bg-surface/95 backdrop-blur z-20 border-b border-gray-700">
              <div className="w-12 border-r border-gray-700 bg-surface"></div>
              <div className="flex-1 grid grid-cols-7 text-center py-3">
                  {weekDays.map(d => (
                      <div key={d} className="text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
                  ))}
              </div>
           </div>

           <div className="flex relative min-h-0 bg-[#0f172a]">
              {/* Left Column: Month Labels */}
              <div className="w-12 relative border-r border-gray-700 bg-surface/30 flex-shrink-0 z-10">
                  {monthLabels.map((l, idx) => (
                      <div 
                          key={`${l.name}-${idx}`}
                          className="absolute w-full flex items-center justify-center pointer-events-none"
                          style={{ 
                              top: l.rowIndex * ROW_HEIGHT, 
                              height: (ROW_HEIGHT * 4), 
                          }}
                      >
                          <span 
                              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                              {l.name}
                          </span>
                      </div>
                  ))}
              </div>

              {/* Right Column: Continuous Days Grid */}
              <div className="flex-1 grid grid-cols-7 w-full">
                  {allDays.map((d, i) => {
                      const localDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      const isSelected = selectedDates.includes(localDateStr);
                      const hasActivity = !!activitiesByDate[localDateStr];
                      const isToday = localDateStr === new Date().toLocaleDateString('en-CA');
                      
                      const currentMonth = d.getMonth();
                      const nextDay = allDays[i + 1];
                      const bottomDay = allDays[i + 7];
                      
                      // Contour Lines Logic
                      const isMonthRightEnd = nextDay && nextDay.getMonth() !== currentMonth;
                      const isMonthBottomEnd = bottomDay && bottomDay.getMonth() !== currentMonth;
                      
                      // Using inline styles for dynamic borders based on neighbor month logic
                      const cellStyle: React.CSSProperties = {
                          height: ROW_HEIGHT,
                          borderRight: isMonthRightEnd ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                          borderBottom: isMonthBottomEnd ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                      };

                      return (
                           <button
                              key={localDateStr}
                              ref={isToday ? todayRef : null}
                              onClick={() => onDateClick(localDateStr)}
                              style={cellStyle}
                              className={`flex flex-col items-center justify-center relative transition-colors ${
                                isSelected 
                                  ? 'bg-primary text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' 
                                  : isToday
                                    ? 'bg-gray-800 text-white shadow-[inset_0_0_0_1px_#3b82f6]'
                                    : 'hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <span className={`text-sm ${isToday || isSelected ? 'font-bold' : ''}`}>{d.getDate()}</span>
                              {hasActivity && !isSelected && (
                                <div className="w-1 h-1 bg-green-500 rounded-full mt-1" />
                              )}
                            </button>
                      )
                  })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const HistoryList: React.FC<HistoryListProps> = ({ 
  activities, 
  categories,
  isCalendarOpen,
  onCloseCalendar,
  includeTodayInComparison
}) => {
  const [scale, setScale] = useState(1.5); // pixels per minute
  // Store selected dates as strings "YYYY-MM-DD"
  const [selectedDates, setSelectedDates] = useState<string[]>([new Date().toLocaleDateString('en-CA')]);

  const getCategory = (id: string) => categories.find(c => c.id === id);

  // Helper to normalize dates to YYYY-MM-DD local time
  const toDateString = (timestamp: number) => {
    const d = new Date(timestamp);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  // Group activities by date string
  const activitiesByDate = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    activities.forEach(act => {
      const dateStr = toDateString(act.startTime);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(act);
    });
    return map;
  }, [activities]);

  const handleDateClick = (dateStr: string) => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    // Toggle Logic
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      // Logic for adding a new date
      let newSelection = [...selectedDates];
      
      // Check for "Include Today" Setting logic
      if (includeTodayInComparison) {
        // If ON: Ensure today is in the list when selecting a historical date, if not already present
        if (!newSelection.includes(todayStr) && dateStr !== todayStr) {
           newSelection.push(todayStr);
        }
      } else {
        // If OFF: If the user is currently only looking at Today (default), and clicks a historical date,
        // we replace Today with the new date to "switch" view rather than "compare".
        // If they have multiple days selected already, standard add applies.
        if (newSelection.length === 1 && newSelection[0] === todayStr && dateStr !== todayStr) {
           newSelection = []; // Clear today
        }
      }
      
      newSelection.push(dateStr);
      setSelectedDates(newSelection.sort());
    }
  };

  const clearSelection = () => {
    setSelectedDates([]);
  };

  // Timeline for a single day
  const DayTimeline: React.FC<{ dateStr: string }> = ({ dateStr }) => {
    const dayActivities = activitiesByDate[dateStr] || [];
    const dateObj = new Date(dateStr + 'T00:00:00'); 
    
    const sorted = [...dayActivities].sort((a,b) => a.startTime - b.startTime);

    return (
      <div className="flex-1 min-w-[200px] border-r border-gray-800 last:border-r-0 relative bg-[#0f172a]" style={{ height: `${1440 * scale}px` }}>
        {/* Day Header */}
        <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md p-2 text-center border-b border-gray-700 shadow-sm">
          <div className="font-bold text-white">{dateObj.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</div>
        </div>

        {/* Hour Markers (Background) */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-full border-t border-gray-800/30 text-[10px] text-gray-600 pl-1 select-none"
            style={{ top: i * 60 * scale, height: 60 * scale }}
          >
            {i}:00
          </div>
        ))}

        {/* Activity Blocks */}
        {sorted.map(act => {
          const start = new Date(act.startTime);
          const startMins = start.getHours() * 60 + start.getMinutes();
          
          let durationMins = 0;
          if (act.endTime) {
            durationMins = (act.endTime - act.startTime) / (1000 * 60);
          } else {
            const now = new Date();
            const endOfDay = new Date(start); 
            endOfDay.setHours(23, 59, 59, 999);
            const refEnd = now < endOfDay ? now : endOfDay;
            durationMins = (refEnd.getTime() - act.startTime) / (1000 * 60);
          }

          const top = startMins * scale;
          const height = Math.max(durationMins * scale, 20);

          const currentCategories = act.categoryIds
            .map(id => getCategory(id))
            .filter(Boolean) as Category[];
          
          const mainColor = currentCategories[0]?.color || '#666';

          return (
            <div
              key={act.id}
              className="absolute left-1 right-1 rounded-md overflow-hidden shadow-sm border border-white/10 hover:z-10 transition-all group"
              style={{
                top,
                height,
                backgroundColor: `${mainColor}cc`,
                borderLeft: `4px solid ${mainColor}`
              }}
            >
              <div className="p-1 h-full text-xs text-white leading-tight overflow-hidden">
                <div className="font-bold flex items-center justify-between">
                  <span className="truncate">
                    {currentCategories.map(c => c.name).join(', ')}
                  </span>
                  {act.mood && <span className="opacity-80">{act.mood}</span>}
                </div>
                {scale > 1 && (
                  <div className="opacity-75 text-[10px]">
                    {start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {Math.round(durationMins)}m
                  </div>
                )}
                {scale > 2 && act.thoughts.length > 0 && (
                   <div className="mt-1 opacity-70 italic truncate">"{act.thoughts[0].text}"</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Fallback: If no dates selected, default to Today for viewing.
  const datesToRender = selectedDates.length > 0 ? selectedDates : [new Date().toLocaleDateString('en-CA')];

  return (
    <div className="w-full h-full flex flex-col pb-safe">
      {isCalendarOpen && (
        <CalendarModal 
          onClose={onCloseCalendar}
          selectedDates={selectedDates}
          onDateClick={handleDateClick}
          onClear={clearSelection}
          activitiesByDate={activitiesByDate}
        />
      )}
      
      <div className="max-w-4xl mx-auto w-full mb-4">
        {/* Scale Slider */}
        <div className="flex items-center gap-4 bg-surface/50 p-2 rounded-lg">
          <Icons.ZoomOut className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <Icons.ZoomIn className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-gray-800 rounded-xl bg-background shadow-inner">
        <div className="flex min-h-full">
          {/* Time Axis Labels (Left Fixed) */}
          <div className="sticky left-0 z-30 bg-surface border-r border-gray-800 w-12 flex-shrink-0 text-[10px] text-gray-400 pt-10" style={{ height: `${1440 * scale}px` }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="absolute w-full text-center border-t border-transparent transform -translate-y-1/2" style={{ top: i * 60 * scale }}>
                {i}:00
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {datesToRender.sort().map(dateStr => (
            <DayTimeline key={dateStr} dateStr={dateStr} />
          ))}
        </div>
      </div>
    </div>
  );
};