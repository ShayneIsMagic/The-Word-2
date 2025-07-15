import { getAllBooks, getChapter, getVerse, searchInBooks } from './genesis-matthew';

export interface Book {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
  category: string;
  abbreviation: string;
}

export interface Verse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  greek?: string;
  hebrew?: string;
  strongs?: string[];
}

export interface SearchResult {
  type: 'verse' | 'book';
  id: string;
  title: string;
  content: string;
  relevance: number;
}

// Get books from the new data structure
const fullBooks = getAllBooks();

const books: Book[] = fullBooks.map(book => ({
  id: book.id,
  name: book.name,
  testament: book.testament,
  chapters: book.chapters.length,
  category: book.category,
  abbreviation: book.abbreviation,
}));

// Convert the new data structure to the old format for compatibility
const verses: Verse[] = fullBooks.flatMap(book => 
  book.chapters.flatMap(chapter => 
    chapter.verses.map(verse => ({
      id: `${book.id}${chapter.number}-${verse.number}`,
      book: book.name,
      chapter: chapter.number,
      verse: verse.number,
      text: verse.text,
      translation: 'ESV',
      greek: verse.greek,
      hebrew: verse.hebrew,
      strongs: verse.strongs,
    }))
  )
);

// Search index for faster lookups
const searchIndex = new Map<string, SearchResult[]>();

// Build search index
function buildSearchIndex() {
  // Index books
  books.forEach(book => {
    const keywords = `${book.name} ${book.abbreviation} ${book.category} ${book.testament}`.toLowerCase();
    const result: SearchResult = {
      type: 'book',
      id: book.id,
      title: book.name,
      content: `${book.name} (${book.testament} Testament)`,
      relevance: 1
    };
    
    keywords.split(' ').forEach(keyword => {
      if (!searchIndex.has(keyword)) {
        searchIndex.set(keyword, []);
      }
      searchIndex.get(keyword)!.push(result);
    });
  });

  // Index verses
  verses.forEach(verse => {
    const keywords = `${verse.text} ${verse.book} ${verse.chapter} ${verse.verse}`.toLowerCase();
    const result: SearchResult = {
      type: 'verse',
      id: verse.id,
      title: `${verse.book} ${verse.chapter}:${verse.verse}`,
      content: verse.text,
      relevance: 1
    };
    
    keywords.split(' ').forEach(keyword => {
      if (keyword.length > 2) { // Only index words longer than 2 characters
        if (!searchIndex.has(keyword)) {
          searchIndex.set(keyword, []);
        }
        searchIndex.get(keyword)!.push(result);
      }
    });
  });
}

// Initialize search index
buildSearchIndex();

export function getBooks() {
  return books;
}

export function getVerses() {
  return verses;
}

export function getBookById(id: string): Book | undefined {
  return books.find(book => book.id === id);
}

export function getVersesByBook(bookId: string): Verse[] {
  const book = getBookById(bookId);
  if (!book) return [];
  return verses.filter(verse => verse.book.toLowerCase() === book.name.toLowerCase());
}

export function getVerseById(id: string): Verse | undefined {
  return verses.find(verse => verse.id === id);
}

export function searchScripture(query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);
  const results = new Map<string, SearchResult>();
  
  keywords.forEach(keyword => {
    const matches = searchIndex.get(keyword) || [];
    matches.forEach(match => {
      if (results.has(match.id)) {
        results.get(match.id)!.relevance += 1;
      } else {
        results.set(match.id, { ...match });
      }
    });
  });
  
  return Array.from(results.values())
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 20); // Limit to top 20 results
}

export function getBooksByTestament(testament: 'old' | 'new'): Book[] {
  return books.filter(book => book.testament === testament);
}

export function getBooksByCategory(category: string): Book[] {
  return books.filter(book => book.category === category);
}

// New functions for working with the complete book data
export { getAllBooks as getFullBooks, getChapter, getVerse, searchInBooks }; 