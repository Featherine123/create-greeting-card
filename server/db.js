const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

const db = new Database(path.join(DATA_DIR, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS books (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  share_code     TEXT UNIQUE NOT NULL,
  view_code      TEXT UNIQUE,
  title          TEXT NOT NULL,
  wish_title     TEXT NOT NULL DEFAULT '',
  wish_message   TEXT NOT NULL DEFAULT '',
  envelope_style TEXT NOT NULL DEFAULT 'rose',
  cover_style    TEXT NOT NULL DEFAULT 'sage',
  public_view    INTEGER NOT NULL DEFAULT 0,
  created_by     INTEGER NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (book_id, page_number)
);

CREATE TABLE IF NOT EXISTS photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id     INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  filename    TEXT NOT NULL,
  frame_style TEXT NOT NULL DEFAULT 'polaroid',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS book_recipients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);
CREATE INDEX IF NOT EXISTS idx_pages_book_id ON pages(book_id);
CREATE INDEX IF NOT EXISTS idx_photos_page_id ON photos(page_id);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON book_recipients(user_id);
`);

const bookCols = db.prepare('PRAGMA table_info(books)').all();
if (!bookCols.some((c) => c.name === 'public_view')) {
  db.exec('ALTER TABLE books ADD COLUMN public_view INTEGER NOT NULL DEFAULT 0');
}
if (!bookCols.some((c) => c.name === 'view_code')) {
  db.exec('ALTER TABLE books ADD COLUMN view_code TEXT');
}
const photoCols = db.prepare('PRAGMA table_info(photos)').all();
if (!photoCols.some((c) => c.name === 'frame_style')) {
  db.exec("ALTER TABLE photos ADD COLUMN frame_style TEXT NOT NULL DEFAULT 'polaroid'");
}

module.exports = db;