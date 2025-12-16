import React from 'react';
import { Activity, Category } from '../types';
import { Icons } from './Icon';

interface HistoryListProps {
  activities: Activity[];
  categories: Category[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ activities, categories }) => {
  const getCategory = (id: string) => categories.find(c => c.id === id);

  const formatDuration = (start: number, end: number | null) => {
    if (!end) return 'Ongoing';
    const ms = end - start;
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Sort activities by start time descending
  const sortedActivities = [...activities].sort((a, b) => b.startTime - a.startTime);

  if (sortedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Icons.Clock className="w-12 h-12 mb-4 opacity-50" />
        <p>No activity history yet.</p>
      </div>
    );
  }

  // Group by date
  const grouped = sortedActivities.reduce((acc, activity) => {
    const date = new Date(activity.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-10">
      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date} className="animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-400 mb-4 sticky top-0 bg-[#0f172a] py-2 z-10 border-b border-gray-800">
            {date}
          </h3>
          <div className="space-y-4">
            {(acts as Activity[]).map((activity) => {
              // Map all IDs to category objects
              const currentCategories = activity.categoryIds
                .map(id => getCategory(id))
                .filter(Boolean) as Category[];

              // Fallback if empty (shouldn't happen with new logic, but legacy data safe)
              const displayCategories = currentCategories.length > 0 
                ? currentCategories 
                : [{id: 'unknown', name: 'Unknown', color: '#ccc'}];

              return (
                <div 
                  key={activity.id} 
                  className="bg-surface rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all shadow-sm flex flex-col sm:flex-row gap-4"
                >
                  {/* Left: Time & Color Indicator */}
                  <div className="flex items-center gap-4 sm:w-1/4 min-w-[150px]">
                    <div className="flex flex-col gap-0.5 h-12 justify-center">
                       {displayCategories.map(c => (
                         <div 
                           key={c.id} 
                           className="w-1.5 rounded-full flex-1" 
                           style={{ backgroundColor: c.color }} 
                           title={c.name}
                         />
                       ))}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">
                        {formatDuration(activity.startTime, activity.endTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        {' - '} 
                        {activity.endTime ? new Date(activity.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       {displayCategories.map(category => (
                         <span 
                           key={category.id} 
                           className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700" 
                           style={{ color: category.color, borderColor: `${category.color}44` }}
                         >
                           {category.name}
                         </span>
                       ))}
                    </div>
                    
                    {/* Thoughts display */}
                    {activity.thoughts.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {activity.thoughts.map(thought => (
                          <div key={thought.id} className="flex items-start gap-2 text-sm text-gray-400">
                            <Icons.Pin className="w-3 h-3 mt-1 flex-shrink-0 opacity-50" />
                            <span>{thought.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
