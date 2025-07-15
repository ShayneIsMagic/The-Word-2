'use client';

import { useState, useMemo } from 'react';
import { Book } from '@/lib/data';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface BookGridProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  className?: string;
}

export default function BookGrid({ books, onBookSelect, className = "" }: BookGridProps) {
  const [filter, setFilter] = useState<'all' | 'old' | 'new'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = [...new Set(books.map(book => book.category))];
    return cats.sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    let filtered = books;
    
    if (filter !== 'all') {
      filtered = filtered.filter(book => book.testament === filter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(book => book.category === categoryFilter);
    }
    
    return filtered;
  }, [books, filter, categoryFilter]);

  const getTestamentColor = (testament: 'old' | 'new') => {
    return testament === 'old' 
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' 
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
             'Law': 'bg-zb-red-100 text-zb-red-800 dark:bg-zb-red-900 dark:text-zb-red-200',
       'Poetry': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
       'Prophets': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
       'Gospel': 'bg-zb-green-100 text-zb-green-800 dark:bg-zb-green-900 dark:text-zb-green-200',
      'History': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Pauline Epistles': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Apocalyptic': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className={className}>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          </div>
          
          <div className="flex space-x-2">
            {(['all', 'old', 'new'] as const).map((testament) => (
              <button
                key={testament}
                onClick={() => setFilter(testament)}
                                 className={`px-3 py-1 text-sm rounded-full transition-colors ${
                   filter === testament
                     ? 'bg-zb-red-500 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                 }`}
              >
                {testament === 'all' ? 'All' : testament === 'old' ? 'Old Testament' : 'New Testament'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBooks.map(book => (
          <button
            key={book.id}
            onClick={() => onBookSelect(book)}
            className="group p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left"
          >
            <div className="flex items-start justify-between mb-2">
                             <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-zb-red-600 dark:group-hover:text-zb-red-400">
                {book.name}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {book.abbreviation}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {book.chapters} chapter{book.chapters !== 1 ? 's' : ''}
            </p>
            
            <div className="flex flex-wrap gap-1">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTestamentColor(book.testament)}`}>
                {book.testament === 'old' ? 'OT' : 'NT'}
              </span>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(book.category)}`}>
                {book.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No books found matching the current filters.
        </div>
      )}
    </div>
  );
} 