export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Thought {
  id: string;
  text: string;
  timestamp: number;
}

export interface Activity {
  id: string;
  categoryIds: string[];
  startTime: number;
  endTime: number | null;
  thoughts: Thought[];
}

export enum ViewMode {
  TRACKER = 'TRACKER',
  HISTORY = 'HISTORY',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
}

export const DEFAULT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // rose
];
