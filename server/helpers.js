const db = require('./db');

const ENVELOPE_STYLES = ['rose', 'kraft', 'sky', 'sage'];
const COVER_STYLES = ['rose', 'kraft', 'sky', 'sage'];
const FRAME_STYLES = ['polaroid', 'heart', 'circle', 'tape', 'sticker'];

function getRole(book, userId) {
  if (!userId) return null;
  if (book.created_by === userId) return 'creator';
  const rec = db
    .prepare('SELECT id FROM book_recipients WHERE book_id = ? AND user_id = ?')
    .get(book.id, userId);
  return rec ? 'recipient' : null;
}

function serializeBook(b) {
  return {
    id: b.id,
    shareCode: b.share_code,
    viewCode: b.view_code || null,
    title: b.title,
    wishTitle: b.wish_title,
    wishMessage: b.wish_message,
    envelopeStyle: b.envelope_style,
    coverStyle: b.cover_style,
    publicView: !!b.public_view,
    createdBy: b.created_by,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

function serializePages(bookId, userId, role) {
  const pages = db
    .prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_number ASC')
    .all(bookId);
  return pages.map((p) => {
    const photos = db
      .prepare(
        `SELECT ph.*, u.display_name AS uploaded_by_name
         FROM photos ph JOIN users u ON u.id = ph.uploaded_by
         WHERE ph.page_id = ? ORDER BY ph.id ASC`
      )
      .all(p.id)
      .map((ph) => ({
        id: ph.id,
        url: `/uploads/${ph.filename}`,
        uploadedBy: ph.uploaded_by,
        uploadedByName: ph.uploaded_by_name,
        frameStyle: ph.frame_style,
        canDelete: role === 'creator' || ph.uploaded_by === userId,
      }));
    return { id: p.id, pageNumber: p.page_number, photos };
  });
}

function getBookWithAccess(bookId, userId) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  if (!book) return null;
  const role = getRole(book, userId);
  if (!role) return null;
  return { book, role };
}

function getBookReadAccess(bookId, userId) {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  if (!book) return null;
  if (book.created_by === userId) return { book, role: 'creator' };
  const rec = db
    .prepare('SELECT id FROM book_recipients WHERE book_id = ? AND user_id = ?')
    .get(bookId, userId);
  if (rec) return { book, role: 'recipient' };
  if (book.public_view) return { book, role: 'viewer' };
  return null;
}

function generateShareCode(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (;;) {
    let code = '';
    for (let i = 0; i < len; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const dup = db.prepare('SELECT id FROM books WHERE share_code = ?').get(code);
    if (!dup) return code;
  }
}

function slugify(title) {
  return String(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'wishbook';
}

module.exports = { ENVELOPE_STYLES, COVER_STYLES, FRAME_STYLES, getRole, serializeBook, serializePages, getBookWithAccess, getBookReadAccess, generateShareCode, slugify };