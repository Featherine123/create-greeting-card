const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const PDFDocument = require('pdfkit');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const {
  ENVELOPE_STYLES,
  COVER_STYLES,
  FRAME_STYLES,
  serializeBook,
  serializePages,
  getBookWithAccess,
  getBookReadAccess,
  getRole,
  generateShareCode,
  slugify,
} = require('../helpers');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const zipUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post('/', requireAuth, (req, res) => {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 60) {
    return res.status(400).json({ error: 'Tiêu đề không được bỏ trống và tối đa 60 ký tự.' });
  }
  const info = db
    .prepare('INSERT INTO books (share_code, title, created_by) VALUES (?, ?, ?)')
    .run(generateShareCode(), title, req.user.id);
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ book: serializeBook(book) });
});

router.get('/', requireAuth, (req, res) => {
  const mine = db
    .prepare('SELECT b.* FROM books b WHERE b.created_by = ? ORDER BY b.updated_at DESC')
    .all(req.user.id);
  const received = db
    .prepare(
      `SELECT b.* FROM books b
       JOIN book_recipients r ON r.book_id = b.id
       WHERE r.user_id = ? AND b.created_by != ?
       ORDER BY b.updated_at DESC`
    )
    .all(req.user.id, req.user.id);
  const list = [
    ...mine.map((b) => ({ book: serializeBook(b), role: 'creator' })),
    ...received.map((b) => ({ book: serializeBook(b), role: 'recipient' })),
  ];
  res.json(list);
});

router.get('/by-code/:code', requireAuth, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE share_code = ?').get(req.params.code);
  if (!book) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ này.' });
  let role = getRole(book, req.user.id);
  if (!role) {
    db.prepare('INSERT OR IGNORE INTO book_recipients (book_id, user_id) VALUES (?, ?)').run(
      book.id,
      req.user.id
    );
    role = 'recipient';
  }
  res.json({ book: serializeBook(book), pages: serializePages(book.id, req.user.id, role), role });
});

router.get('/view/:code', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE view_code = ?').get(req.params.code);
  if (!book || !book.public_view) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  const role = getRole(book, req.user && req.user.id);
  if (role) {
    return res.json({ book: serializeBook(book), pages: serializePages(book.id, req.user.id, role), role });
  }
  res.json({ book: serializeBook(book), pages: serializePages(book.id, null, 'viewer'), role: 'viewer' });
});

router.get('/:id', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  res.json({
    book: serializeBook(acc.book),
    pages: serializePages(acc.book.id, req.user.id, acc.role),
    role: acc.role,
  });
});

router.put('/:id', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được sửa.' });
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 60) return res.status(400).json({ error: 'Tiêu đề không hợp lệ.' });
  db.prepare("UPDATE books SET title = ?, updated_at = datetime('now') WHERE id = ?").run(title, acc.book.id);
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(acc.book.id);
  res.json({ book: serializeBook(book) });
});

router.delete('/:id', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được xóa sổ.' });
  deleteBookFiles(acc.book.id);
  db.prepare('DELETE FROM books WHERE id = ?').run(acc.book.id);
  res.json({ ok: true });
});

router.put('/:id/share', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được thay đổi chia sẻ.' });
  const publicView = req.body && req.body.publicView ? 1 : 0;
  let viewCode = acc.book.view_code;
  if (publicView && !viewCode) {
    viewCode = generateShareCode();
    db.prepare('UPDATE books SET view_code = ? WHERE id = ?').run(viewCode, acc.book.id);
  }
  db.prepare("UPDATE books SET public_view = ?, updated_at = datetime('now') WHERE id = ?").run(
    publicView,
    acc.book.id
  );
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(acc.book.id);
  res.json({ book: serializeBook(book) });
});

router.put('/:id/wish', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được viết lời chúc.' });
  const { wishTitle, wishMessage, envelopeStyle, coverStyle } = req.body || {};
  const wt = typeof wishTitle === 'string' ? wishTitle.slice(0, 80) : '';
  const wm = typeof wishMessage === 'string' ? wishMessage.slice(0, 2000) : '';
  const es = ENVELOPE_STYLES.includes(envelopeStyle) ? envelopeStyle : acc.book.envelope_style;
  const cs = COVER_STYLES.includes(coverStyle) ? coverStyle : acc.book.cover_style;
  db.prepare(
    "UPDATE books SET wish_title = ?, wish_message = ?, envelope_style = ?, cover_style = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(wt, wm, es, cs, acc.book.id);
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(acc.book.id);
  res.json({ book: serializeBook(book) });
});

router.post('/:id/pages', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được thêm trang.' });
  const taken = db
    .prepare('SELECT page_number FROM pages WHERE book_id = ?')
    .all(acc.book.id)
    .map((r) => r.page_number);
  let next = 2;
  while (taken.includes(next)) next++;
  if (next > 5) return res.status(403).json({ error: 'Cuốn sổ đã đủ 5 trang.' });
  const info = db
    .prepare('INSERT INTO pages (book_id, page_number) VALUES (?, ?)')
    .run(acc.book.id, next);
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ page: { id: page.id, pageNumber: page.page_number, photos: [] } });
});

router.delete('/:id/pages/:pageId', requireAuth, (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được xóa trang.' });
  const page = db.prepare('SELECT * FROM pages WHERE id = ? AND book_id = ?').get(Number(req.params.pageId), acc.book.id);
  if (!page) return res.status(404).json({ error: 'Không tìm thấy trang.' });
  const photos = db.prepare('SELECT filename FROM photos WHERE page_id = ?').all(page.id);
  for (const ph of photos) unlinkSafe(path.join(UPLOAD_DIR, ph.filename));
  db.prepare('DELETE FROM pages WHERE id = ?').run(page.id);
  res.json({ ok: true });
});

router.get('/:id/export/zip', (req, res) => {
  const acc = getBookReadAccess(Number(req.params.id), req.user && req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  const zip = new AdmZip();
  const pages = db
    .prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_number ASC')
    .all(acc.book.id)
    .map((p) => ({
      pageNumber: p.page_number,
      photos: db
        .prepare('SELECT id, filename, frame_style, uploaded_by FROM photos WHERE page_id = ? ORDER BY id ASC')
        .all(p.id),
    }));
  const bookJson = {
    version: 1,
    exportedAt: new Date().toISOString(),
    book: serializeBook(acc.book),
    pages,
  };
  zip.addFile('book.json', Buffer.from(JSON.stringify(bookJson, null, 2)));
  for (const page of pages) {
    for (const ph of page.photos) {
      const fp = path.join(UPLOAD_DIR, ph.filename);
      if (fs.existsSync(fp)) zip.addLocalFile(fp, 'photos');
    }
  }
  const buf = zip.toBuffer();
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${slugify(acc.book.title)}.zip"`);
  res.send(buf);
});

router.get('/:id/export/pdf', (req, res) => {
  const acc = getBookReadAccess(Number(req.params.id), req.user && req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  const doc = new PDFDocument({ size: 'A4', margin: 48, autoFirstPage: false });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${slugify(acc.book.title)}.pdf"`);
  doc.pipe(res);

  const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
  doc.registerFont('DejaVu', path.join(FONT_DIR, 'DejaVuSans.ttf'));
  doc.registerFont('DejaVu-Bold', path.join(FONT_DIR, 'DejaVuSans-Bold.ttf'));

  doc.addPage();
  const W = doc.page.width - 96;

  doc.font('DejaVu').fontSize(11).fillColor('#8A7A6A').text('CUỐN SỔ LỜI CHÚC', { align: 'center' });
  doc.moveDown(6);
  doc.font('DejaVu-Bold').fontSize(28).fillColor('#4A3F35').text(acc.book.title, { align: 'center' });
  doc.moveDown(1);
  doc.font('DejaVu').fontSize(12).fillColor('#8A7A6A').text(`Mã chia sẻ: ${acc.book.share_code}`, { align: 'center' });

  doc.addPage();
  doc.font('DejaVu-Bold').fontSize(20).fillColor('#D96C6C').text(
    acc.book.wish_title || 'Lời chúc',
    { align: 'center' }
  );
  doc.moveDown(2);
  doc.font('DejaVu').fontSize(13).fillColor('#4A3F35').text(
    acc.book.wish_message || 'Chưa có lời chúc.',
    { align: 'center', lineGap: 6 }
  );

  const pages = db
    .prepare('SELECT * FROM pages WHERE book_id = ? ORDER BY page_number ASC')
    .all(acc.book.id);
  for (const page of pages) {
    const photos = db.prepare('SELECT filename FROM photos WHERE page_id = ? ORDER BY id ASC').all(page.id);
    doc.addPage();
    doc.font('DejaVu-Bold').fontSize(14).fillColor('#4A3F35').text(`Trang ${page.page_number}`, { align: 'center' });
    doc.moveDown(1.5);
    if (photos.length === 0) {
      doc.font('DejaVu').fontSize(11).fillColor('#8A7A6A').text('(Trang trống)', { align: 'center' });
    } else {
      const imgW = photos.length === 2 ? (W - 24) / 2 : Math.min(W, 380);
      const x0 = doc.page.width / 2 - (photos.length === 2 ? W / 2 : imgW / 2);
      const yStart = doc.y;
      photos.forEach((ph, i) => {
        const fp = path.join(UPLOAD_DIR, ph.filename);
        if (fs.existsSync(fp)) {
          try {
            doc.image(fp, x0 + i * (imgW + 24), yStart, { width: imgW });
          } catch {
            drawPlaceholder(doc, x0 + i * (imgW + 24), yStart, imgW, imgW * 0.75);
          }
        } else {
          drawPlaceholder(doc, x0 + i * (imgW + 24), yStart, imgW, imgW * 0.75);
        }
      });
    }
  }
  doc.end();
});

function drawPlaceholder(doc, x, y, w, h) {
  doc.save().rect(x, y, w, h).strokeColor('#C9C2B5').lineWidth(1).dash(3, 3).stroke().restore();
  doc.font('DejaVu').fillColor('#8A7A6A').fontSize(10).text('(Ảnh không có)', x + 8, y + h / 2 - 6, { width: w - 16, align: 'center' });
}

router.post('/import', requireAuth, zipUpload.single('zip'), (req, res) => {
  doImport(req, res, req.user.id);
});

router.post('/:id/import', requireAuth, zipUpload.single('zip'), (req, res) => {
  const acc = getBookWithAccess(Number(req.params.id), req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  if (acc.role !== 'creator') return res.status(403).json({ error: 'Chỉ người tạo mới được khôi phục ZIP.' });
  doImport(req, res, req.user.id);
});

function doImport(req, res, ownerId) {
  if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn file ZIP.' });

  let zip;
  try {
    zip = new AdmZip(req.file.buffer);
  } catch {
    return res.status(400).json({ error: 'File không phải ZIP hợp lệ.' });
  }
  const bookEntry = zip.getEntry('book.json');
  if (!bookEntry) return res.status(400).json({ error: 'ZIP không chứa book.json.' });
  let data;
  try {
    data = JSON.parse(bookEntry.getData().toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'book.json không hợp lệ.' });
  }
  const b = data.book;
  if (!b || typeof b.title !== 'string' || !Array.isArray(data.pages)) {
    return res.status(400).json({ error: 'Cấu trúc ZIP không đúng định dạng.' });
  }

  const title = b.title.slice(0, 60) || 'Sổ khôi phục';
  const info = db
    .prepare('INSERT INTO books (share_code, title, wish_title, wish_message, envelope_style, cover_style, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(
      generateShareCode(),
      title,
      String(b.wishTitle || '').slice(0, 80),
      String(b.wishMessage || '').slice(0, 2000),
      ENVELOPE_STYLES.includes(b.envelopeStyle) ? b.envelopeStyle : 'rose',
      COVER_STYLES.includes(b.coverStyle) ? b.coverStyle : 'sage',
      req.user.id
    );
  const newBookId = info.lastInsertRowid;

  const pageOrder = data.pages
    .filter((p) => Number.isInteger(p.pageNumber) && p.pageNumber >= 2 && p.pageNumber <= 5)
    .sort((a, z) => a.pageNumber - z.pageNumber);
  const seen = new Set();
  for (const p of pageOrder) {
    if (seen.has(p.pageNumber)) continue;
    seen.add(p.pageNumber);
    const pageInfo = db
      .prepare('INSERT INTO pages (book_id, page_number) VALUES (?, ?)')
      .run(newBookId, p.pageNumber);
    const photos = Array.isArray(p.photos) ? p.photos.slice(0, 1) : [];
    for (const ph of photos) {
      const filename = String(ph.filename || '').split('/').pop();
      if (!filename) continue;
      const entry = zip.getEntry(`photos/${filename}`);
      if (!entry) continue;
      const savedName = `${require('crypto').randomUUID()}.jpg`;
      fs.writeFileSync(path.join(UPLOAD_DIR, savedName), entry.getData());
      db.prepare('INSERT INTO photos (page_id, uploaded_by, filename, frame_style) VALUES (?, ?, ?, ?)').run(
        pageInfo.lastInsertRowid,
        ownerId,
        savedName,
        FRAME_STYLES.includes(ph.frame_style) ? ph.frame_style : 'polaroid'
      );
    }
  }

  const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(newBookId);
  res.status(201).json({ book: serializeBook(newBook) });
}

function deleteBookFiles(bookId) {
  const pages = db.prepare('SELECT id FROM pages WHERE book_id = ?').all(bookId);
  for (const p of pages) {
    const photos = db.prepare('SELECT filename FROM photos WHERE page_id = ?').all(p.id);
    for (const ph of photos) unlinkSafe(path.join(UPLOAD_DIR, ph.filename));
  }
}

function unlinkSafe(fp) {
  fs.unlink(fp, () => {});
}

module.exports = router;