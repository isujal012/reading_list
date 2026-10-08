import { useState, useEffect } from 'react';
import { BookOpen, Plus, Library, Trash2 } from 'lucide-react';

type ReadingStatus = 'want-to-read' | 'reading' | 'finished';

interface Book {
  id: string;
  title: string;
  status: ReadingStatus;
  createdAt: number;
}

const STATUS_META: Record<
  ReadingStatus,
  { label: string; badge: string; dot: string }
> = {
  'want-to-read': {
    label: 'Want to Read',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
  },
  reading: {
    label: 'Reading',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-400',
  },
  finished: {
    label: 'Finished',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-400',
  },
};

const STATUS_ORDER: ReadingStatus[] = ['want-to-read', 'reading', 'finished'];
const STORAGE_KEY = 'reading-list-books';

type FilterValue = ReadingStatus | 'all';

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  const addBook = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a book title.');
      return;
    }
    setError('');
    const book: Book = {
      id: crypto.randomUUID(),
      title: trimmed,
      status: 'want-to-read',
      createdAt: Date.now(),
    };
    setBooks((prev) => [book, ...prev]);
    setTitle('');
  };

  const changeStatus = (id: string, status: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const removeBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const counts = books.reduce(
    (acc, b) => {
      acc[b.status] += 1;
      return acc;
    },
    { 'want-to-read': 0, reading: 0, finished: 0 } as Record<ReadingStatus, number>
  );

  const filtered =
    filter === 'all' ? books : books.filter((b) => b.status === filter);

  const filterOptions: { value: FilterValue; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: books.length },
    ...STATUS_ORDER.map((s) => ({
      value: s,
      label: STATUS_META[s].label,
      count: counts[s],
    })),
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-2xl px-5 py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Reading List
              </h1>
              <p className="text-sm text-stone-500">
                Track the books you want to read, are reading, and have finished.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6 sm:py-8">
        {/* Add book form */}
        <form
          onSubmit={addBook}
          className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter book title…"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <Plus className="h-4 w-4" />
              Add Book
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </form>

        {/* Filter bar */}
        {books.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {filterOptions.map((opt) => {
              const active = filter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* List / empty state */}
        {books.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-12 text-center">
            <p className="text-sm text-stone-500">
              No books match this filter.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onStatusChange={changeStatus}
                onRemove={removeBook}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <BookOpen className="h-7 w-7" />
      </div>
      <p className="text-base font-medium text-stone-700">
        Your reading list is empty. Add your first book.
      </p>
    </div>
  );
}

function BookCard({
  book,
  onStatusChange,
  onRemove,
}: {
  book: Book;
  onStatusChange: (id: string, status: ReadingStatus) => void;
  onRemove: (id: string) => void;
}) {
  const meta = STATUS_META[book.status];
  return (
    <li className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-stone-900">
            {book.title}
          </h3>
          <span
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
        <button
          onClick={() => onRemove(book.id)}
          aria-label={`Remove ${book.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Status switcher */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {STATUS_ORDER.map((s) => {
          const active = book.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(book.id, s)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {STATUS_META[s].label}
            </button>
          );
        })}
      </div>
    </li>
  );
}
