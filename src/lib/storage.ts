/**
 * Storage utility using localForage (Forage) for better performance
 * Automatically uses IndexedDB with localStorage fallback
 */

import localforage from 'localforage';

// Configure localForage
localforage.config({
  name: 'TheWord',
  storeName: 'scripture_storage',
  description: 'Storage for The Word scripture study app',
  version: 1.0,
  size: 4980736, // ~5MB
  driver: [
    localforage.INDEXEDDB,
    localforage.WEBSQL,
    localforage.LOCALSTORAGE
  ]
});

// Storage keys
export const STORAGE_KEYS = {
  BOOKMARKS: 'bookmarks',
  NOTES: 'notes',
  SETTINGS: 'settings',
  SEARCH_HISTORY: 'search_history',
  LAST_READ: 'last_read',
  THEME: 'theme',
} as const;

// Type definitions
export interface Bookmark {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
  tags?: string[];
}

export interface Note {
  id: string;
  verseId: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Settings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showGreek: boolean;
  showHebrew: boolean;
  showStrongs: boolean;
  defaultTranslation: string;
}

// Bookmark operations
export const bookmarks = {
  async getAll(): Promise<Bookmark[]> {
    try {
      const bookmarks = await localforage.getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS);
      return bookmarks || [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  },

  async add(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<Bookmark> {
    try {
      const allBookmarks = await this.getAll();
      const newBookmark: Bookmark = {
        ...bookmark,
        id: `${bookmark.verseId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      allBookmarks.push(newBookmark);
      await localforage.setItem(STORAGE_KEYS.BOOKMARKS, allBookmarks);
      return newBookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      const allBookmarks = await this.getAll();
      const filtered = allBookmarks.filter(b => b.id !== id);
      await localforage.setItem(STORAGE_KEYS.BOOKMARKS, filtered);
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  },

  async exists(verseId: string): Promise<boolean> {
    try {
      const allBookmarks = await this.getAll();
      return allBookmarks.some(b => b.verseId === verseId);
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  },

  async getByVerseId(verseId: string): Promise<Bookmark | null> {
    try {
      const allBookmarks = await this.getAll();
      return allBookmarks.find(b => b.verseId === verseId) || null;
    } catch (error) {
      console.error('Error getting bookmark:', error);
      return null;
    }
  },
};

// Notes operations
export const notes = {
  async getAll(): Promise<Note[]> {
    try {
      const notes = await localforage.getItem<Note[]>(STORAGE_KEYS.NOTES);
      return notes || [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async getByVerseId(verseId: string): Promise<Note | null> {
    try {
      const allNotes = await this.getAll();
      return allNotes.find(n => n.verseId === verseId) || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  async add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const allNotes = await this.getAll();
      const now = new Date().toISOString();
      const newNote: Note = {
        ...note,
        id: `${note.verseId}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      allNotes.push(newNote);
      await localforage.setItem(STORAGE_KEYS.NOTES, allNotes);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const allNotes = await this.getAll();
      const index = allNotes.findIndex(n => n.id === id);
      if (index === -1) return null;

      allNotes[index] = {
        ...allNotes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await localforage.setItem(STORAGE_KEYS.NOTES, allNotes);
      return allNotes[index];
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      const allNotes = await this.getAll();
      const filtered = allNotes.filter(n => n.id !== id);
      await localforage.setItem(STORAGE_KEYS.NOTES, filtered);
      return true;
    } catch (error) {
      console.error('Error removing note:', error);
      return false;
    }
  },
};

// Settings operations
export const settings = {
  async get(): Promise<Settings> {
    try {
      const saved = await localforage.getItem<Settings>(STORAGE_KEYS.SETTINGS);
      return saved || {
        theme: 'auto',
        fontSize: 'medium',
        showGreek: true,
        showHebrew: true,
        showStrongs: true,
        defaultTranslation: 'ESV',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        theme: 'auto',
        fontSize: 'medium',
        showGreek: true,
        showHebrew: true,
        showStrongs: true,
        defaultTranslation: 'ESV',
      };
    }
  },

  async update(updates: Partial<Settings>): Promise<Settings> {
    try {
      const current = await this.get();
      const updated = { ...current, ...updates };
      await localforage.setItem(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
};

// Search history operations
export const searchHistory = {
  async getAll(): Promise<string[]> {
    try {
      const history = await localforage.getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY);
      return history || [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  },

  async add(query: string): Promise<void> {
    try {
      const history = await this.getAll();
      const filtered = history.filter(q => q.toLowerCase() !== query.toLowerCase());
      filtered.unshift(query);
      // Keep only last 50 searches
      const limited = filtered.slice(0, 50);
      await localforage.setItem(STORAGE_KEYS.SEARCH_HISTORY, limited);
    } catch (error) {
      console.error('Error adding search history:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await localforage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },
};

// Last read position
export const lastRead = {
  async get(): Promise<{ bookId: string; chapter: number; verse?: number } | null> {
    try {
      return await localforage.getItem(STORAGE_KEYS.LAST_READ);
    } catch (error) {
      console.error('Error getting last read:', error);
      return null;
    }
  },

  async set(bookId: string, chapter: number, verse?: number): Promise<void> {
    try {
      await localforage.setItem(STORAGE_KEYS.LAST_READ, { bookId, chapter, verse });
    } catch (error) {
      console.error('Error setting last read:', error);
    }
  },
};

// Utility: Clear all storage
export async function clearAllStorage(): Promise<void> {
  try {
    await localforage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

// Utility: Get storage size estimate
export async function getStorageSize(): Promise<number> {
  try {
    let size = 0;
    await localforage.iterate((value) => {
      size += JSON.stringify(value).length;
    });
    return size;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}






