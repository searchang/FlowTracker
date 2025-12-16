import React, { useState, useEffect } from 'react';
import { Category, Activity } from '../types';
import { CategoryManager } from './CategoryManager';
import { Icons } from './Icon';

interface SettingsProps {
  categories: Category[];
  activities: Activity[];
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateActivities: (activities: Activity[]) => void;
  multiSelectEnabled: boolean;
  setMultiSelectEnabled: (enabled: boolean) => void;
}

type SettingsTab = 'categories' | 'sync';

export const Settings: React.FC<SettingsProps> = ({ 
  categories, 
  activities, 
  onUpdateCategories,
  onUpdateActivities,
  multiSelectEnabled,
  setMultiSelectEnabled
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    const linked = localStorage.getItem('isGoogleLinked') === 'true';
    setIsGoogleLinked(linked);
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) setLastSyncTime(lastSync);
  }, []);

  const handleLinkGoogle = () => {
    // Simulation of OAuth flow
    setIsSyncing(true);
    setTimeout(() => {
      setIsGoogleLinked(true);
      localStorage.setItem('isGoogleLinked', 'true');
      setIsSyncing(false);
      handleSync();
    }, 1500);
  };

  const handleUnlink = () => {
    setIsGoogleLinked(false);
    localStorage.removeItem('isGoogleLinked');
    setLastSyncTime(null);
    localStorage.removeItem('lastSyncTime');
  };

  const handleSync = () => {
    if (!isGoogleLinked) return;
    setIsSyncing(true);
    // Simulate network request
    setTimeout(() => {
      const now = new Date().toLocaleString();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now);
      setIsSyncing(false);
    }, 2000);
  };

  const handleExport = () => {
    const data = {
      categories,
      activities,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronosflow_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.categories && Array.isArray(json.categories)) {
          onUpdateCategories(json.categories);
        }
        if (json.activities && Array.isArray(json.activities)) {
          onUpdateActivities(json.activities);
        }
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to parse backup file.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-safe">
      
      {/* Tab Navigation */}
      <div className="flex p-1 bg-surface rounded-xl border border-gray-800">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'categories' 
              ? 'bg-primary text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sync' 
              ? 'bg-primary text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Backup & Sync
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div className="space-y-6">
          <div className="bg-surface p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Allow Multi-select Categories</h3>
              <p className="text-xs text-gray-500">Select multiple categories for a single activity session.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={multiSelectEnabled}
                onChange={(e) => setMultiSelectEnabled(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <CategoryManager categories={categories} onUpdate={onUpdateCategories} />
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          
          {/* Cloud Sync Card */}
          <div className="bg-surface rounded-xl border border-gray-800 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Icons.Cloud className="w-32 h-32 text-primary" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Icons.Cloud className="w-6 h-6 text-primary" /> Google Drive Sync
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md">
                Automatically backup your tracking history to your Google Drive to keep your data safe and accessible across devices.
              </p>

              {!isGoogleLinked ? (
                <button 
                  onClick={handleLinkGoogle}
                  disabled={isSyncing}
                  className="flex items-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSyncing ? (
                    <Icons.Refresh className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span>{isSyncing ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Linked Account</div>
                      <div className="text-xs text-gray-400">user@example.com</div>
                    </div>
                    <button onClick={handleUnlink} className="text-red-400 hover:text-red-300 p-2">
                      <Icons.LogOut className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 px-1">
                    <span>Status: <span className="text-green-400 font-medium">Active</span></span>
                    <span>Last Synced: {lastSyncTime || 'Never'}</span>
                  </div>

                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Icons.Refresh className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual Backup Card */}
          <div className="bg-surface rounded-xl border border-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Icons.Smartphone className="w-5 h-5 text-secondary" /> Manual Backup
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="flex flex-col items-center justify-center gap-2 p-6 bg-background rounded-xl border border-gray-700 hover:border-gray-500 transition-all hover:bg-gray-800 group"
              >
                <Icons.Download className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                <span className="font-medium text-gray-300">Export Data</span>
                <span className="text-xs text-gray-500">Download JSON file</span>
              </button>

              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-6 bg-background rounded-xl border border-gray-700 hover:border-gray-500 transition-all hover:bg-gray-800 group">
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                <Icons.Upload className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                <span className="font-medium text-gray-300">Import Data</span>
                <span className="text-xs text-gray-500">Restore from JSON file</span>
              </label>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
