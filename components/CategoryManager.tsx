import React, { useState } from 'react';
import { Category, DEFAULT_COLORS } from '../types';
import { Icons } from './Icon';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: (categories: Category[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setEditName('');
    setEditColor(DEFAULT_COLORS[0]);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editName.trim()) return;

    if (isCreating) {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: editName,
        color: editColor
      };
      onUpdate([...categories, newCategory]);
    } else if (editingId) {
      const updated = categories.map(c => 
        c.id === editingId ? { ...c, name: editName, color: editColor } : c
      );
      onUpdate(updated);
    }
    
    cancel();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure? This will not delete historical data but will remove the category from future selection.')) {
      onUpdate(categories.filter(c => c.id !== id));
    }
  };

  const cancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Manage Categories</h2>
        {!isCreating && !editingId && (
          <button 
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
          >
            <Icons.Plus className="w-4 h-4" /> New Category
          </button>
        )}
      </div>

      {/* Editor Form */}
      {(isCreating || editingId) && (
        <div className="bg-surface p-6 rounded-xl border border-gray-700 animate-slide-in">
          <h3 className="text-gray-300 font-semibold mb-4">{isCreating ? 'Create Category' : 'Edit Category'}</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-background border border-gray-700 text-white rounded p-2 focus:border-primary outline-none"
                placeholder="Category Name"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Color</label>
              <div className="flex flex-wrap gap-3">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${editColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={cancel} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600">
                {isCreating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-surface p-4 rounded-xl border border-gray-800 flex justify-between items-center group hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium text-gray-200">{cat.name}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(cat)} className="p-2 hover:bg-background rounded-full text-gray-400 hover:text-white">
                <Icons.Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-background rounded-full text-gray-400 hover:text-red-400">
                <Icons.Delete className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
