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
  includeTodayInComparison: boolean;
  setIncludeTodayInComparison: (enabled: boolean) => void;
}

type SettingsTab = 'categories' | 'sync';

export const Settings: React.FC<SettingsProps> = ({ 
  categories, 
  activities, 
  onUpdateCategories,
  onUpdateActivities,
  multiSelectEnabled,
  setMultiSelectEnabled,
  includeTodayInComparison,
  setIncludeTodayInComparison
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('linkedEmail');
    if (savedEmail) setLinkedEmail(savedEmail);
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) setLastSyncTime(lastSync);
  }, []);

  const handleLinkAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    setIsSyncing(true);
    // Simulation of linking process
    setTimeout(() => {
      setLinkedEmail(emailInput);
      localStorage.setItem('linkedEmail', emailInput);
      setIsSyncing(false);
      setIsEmailModalOpen(false);
      handleSync();
    }, 1500);
  };

  const handleUnlink = () => {
    if (confirm('Are you sure you want to unlink this account?')) {
      setLinkedEmail(null);
      localStorage.removeItem('linkedEmail');
      setLastSyncTime(null);
      localStorage.removeItem('lastSyncTime');
    }
  };

  const handleSync = () => {
    if (!linkedEmail) return;
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
      
      {/* Email Link Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
            onClick={() => !isSyncing && setIsEmailModalOpen(false)} 
          />
          <div className="relative bg-surface w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Link Your Account</h3>
                  <p className="text-sm text-gray-400">Secure your tracking data and sync across devices.</p>
                </div>
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  disabled={isSyncing}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-0"
                >
                  <Icons.X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleLinkAccount} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icons.Smartphone className="w-5 h-5 text-gray-500" />
                    </div>
                    <input 
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-background border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <p className="text-xs text-primary/80 leading-relaxed">
                    By linking your account, your categories, activities, and pinned thoughts will be securely stored and associated with this email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing || !emailInput.includes('@')}
                  className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <Icons.Refresh className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icons.Check className="w-5 h-5" />
                  )}
                  <span>{isSyncing ? 'Linking...' : 'Confirm & Sync'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
          General
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
          <div className="space-y-4">
            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider ml-1">Preferences</h3>
            
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

            <div className="bg-surface p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Automatically include today in comparison</h3>
                <p className="text-xs text-gray-500">When selecting past dates, keep today selected for comparison.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeTodayInComparison}
                  onChange={(e) => setIncludeTodayInComparison(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
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
                <Icons.Cloud className="w-6 h-6 text-primary" /> Account Synchronization
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md">
                Securely back up your activity logs and pinned thoughts to your account to never lose your progress.
              </p>

              {!linkedEmail ? (
                <button 
                  onClick={() => setIsEmailModalOpen(true)}
                  disabled={isSyncing}
                  className="flex items-center gap-3 px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Icons.Smartphone className="w-5 h-5" />
                  <span>Link Email Account</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-gray-700">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      {linkedEmail[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">Linked Account</div>
                      <div className="text-xs text-gray-400">{linkedEmail}</div>
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