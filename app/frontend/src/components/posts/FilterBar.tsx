import React from 'react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  visibility: string;
  onVisibilityChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  tags: string[];
  sort: string;
  onSortChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search, onSearchChange, category, onCategoryChange, categories,
  visibility, onVisibilityChange, tag, onTagChange, tags, sort, onSortChange
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4 p-2 bg-gray-50 rounded-lg">
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search posts..."
        className="border rounded px-2 py-1 w-48"
      />
      <select value={category} onChange={e => onCategoryChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">All Categories</option>
        {(categories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <select value={visibility} onChange={e => onVisibilityChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">All</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
      <select value={tag} onChange={e => onTagChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">All Tags</option>
        {(tags || []).map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={sort} onChange={e => onSortChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="created_at">Newest</option>
        <option value="likes">Most Liked</option>
        <option value="views">Most Viewed</option>
      </select>
    </div>
  );
};

export default FilterBar; 