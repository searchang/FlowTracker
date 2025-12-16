import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell 
} from 'recharts';
import { Activity, Category } from '../types';
import { generateInsights } from '../services/geminiService';
import { Icons } from './Icon';

interface AnalyticsProps {
  activities: Activity[];
  categories: Category[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ activities, categories }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Helper to map category IDs to Names
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#ccc';

  // --- Data Preparation ---

  // 1. Total hours per category (All time or filtered, here we do All Time for simplicity of "Totals")
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    activities.forEach(act => {
      if (!act.endTime) return; // Skip active
      const hours = (act.endTime - act.startTime) / (1000 * 60 * 60);
      totals[act.categoryId] = (totals[act.categoryId] || 0) + hours;
    });

    return Object.entries(totals)
      .map(([id, hours]) => ({
        name: getCategoryName(id),
        hours: parseFloat(hours.toFixed(2)),
        color: getCategoryColor(id)
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [activities, categories]);

  // 2. Weekly Progression Line Graph
  const weeklyData = useMemo(() => {
    // Get last 7 days dates
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })); // e.g. "Oct 10"
    }

    // Initialize structure: { date: "Oct 10", [CatName]: hours, ... }
    const chartData = days.map(date => {
      const entry: any = { date };
      categories.forEach(c => entry[c.name] = 0);
      return entry;
    });

    activities.forEach(act => {
      if (!act.endTime) return;
      const actDate = new Date(act.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dayIndex = days.indexOf(actDate);
      
      if (dayIndex !== -1) {
        const catName = getCategoryName(act.categoryId);
        const hours = (act.endTime - act.startTime) / (1000 * 60 * 60);
        chartData[dayIndex][catName] += hours;
      }
    });

    // Round values
    chartData.forEach(day => {
      Object.keys(day).forEach(key => {
        if (typeof day[key] === 'number') {
          day[key] = parseFloat(day[key].toFixed(2));
        }
      });
    });

    return chartData;
  }, [activities, categories]);

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await generateInsights(activities, categories);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Productivity Analytics</h2>
        <button
          onClick={handleGenerateInsight}
          disabled={loadingInsight}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loadingInsight ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icons.Brain className="w-5 h-5" />
          )}
          <span>{loadingInsight ? 'Analyzing...' : 'Ask AI Insights'}</span>
        </button>
      </div>

      {/* AI Insight Box */}
      {insight && (
        <div className="bg-surface p-6 rounded-xl border border-indigo-500/30 shadow-lg animate-fade-in">
          <h3 className="text-lg font-semibold text-indigo-400 mb-2 flex items-center gap-2">
            <Icons.Brain className="w-5 h-5" /> Gemini Analysis
          </h3>
          <div className="prose prose-invert max-w-none text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {insight}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Trend Line Chart */}
        <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-300 mb-6">Last 7 Days (Hours)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {categories.map((cat) => (
                  <Line 
                    key={cat.id}
                    type="monotone" 
                    dataKey={cat.name} 
                    stroke={cat.color} 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 0, fill: cat.color }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Totals Bar Chart */}
        <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-300 mb-6">Total Hours by Category</h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryTotals} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  width={100}
                />
                <Tooltip 
                   cursor={{fill: '#334155', opacity: 0.4}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
