const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getBookWithAccess, FRAME_STYLES } = require('../helpers');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/pages/:pageId/photos', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(Number(req.params.pageId));
    if (!page) return res.status(404).json({ error: 'Không tìm thấy trang.' });
    const acc = getBookWithAccess(page.book_id, req.user.id);
    if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
    if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn file ảnh.' });

    if (!ALLOWED.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Định dạng ảnh không hợp lệ (cho phép JPEG, PNG, WEBP, GIF).' });
    }

    let meta;
    try {
      meta = await sharp(req.file.buffer).metadata();
    } catch {
      return res.status(400).json({ error: 'File không phải ảnh hợp lệ.' });
    }
    if (!meta.format || !['jpeg', 'png', 'webp', 'gif'].includes(meta.format)) {
      return res.status(400).json({ error: 'File không phải ảnh hợp lệ.' });
    }

    const count = db.prepare('SELECT COUNT(*) AS c FROM photos WHERE page_id = ?').get(page.id).c;
    if (count >= 1) return res.status(403).json({ error: 'Trang này đã có ảnh.' });

    const frameStyle = FRAME_STYLES.includes(req.body && req.body.frame) ? req.body.frame : 'polaroid';

    let pipeline = sharp(req.file.buffer, { animated: meta.format === 'gif' });
    const md = meta;
    const longest = Math.max(md.width || 0, md.height || 0);
    if (longest > 1920) {
      pipeline = pipeline.resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true });
    }
    const outBuf = await pipeline
      .jpeg({ quality: 82 })
      .toBuffer();

    const filename = `${crypto.randomUUID()}.jpg`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), outBuf);

    const info = db
      .prepare('INSERT INTO photos (page_id, uploaded_by, filename, frame_style) VALUES (?, ?, ?, ?)')
      .run(page.id, req.user.id, filename, frameStyle);
    const user = db.prepare('SELECT display_name FROM users WHERE id = ?').get(req.user.id);
    const photo = {
      id: info.lastInsertRowid,
      url: `/uploads/${filename}`,
      uploadedBy: req.user.id,
      uploadedByName: user.display_name,
      frameStyle,
      canDelete: true,
    };
    res.status(201).json({ photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Đã có lỗi khi xử lý ảnh.' });
  }
});

router.delete('/photos/:photoId', requireAuth, (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(Number(req.params.photoId));
  if (!photo) return res.status(404).json({ error: 'Không tìm thấy ảnh.' });
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(photo.page_id);
  const acc = getBookWithAccess(page.book_id, req.user.id);
  if (!acc) return res.status(404).json({ error: 'Không tìm thấy cuốn sổ.' });
  const canDelete = acc.role === 'creator' || photo.uploaded_by === req.user.id;
  if (!canDelete) return res.status(403).json({ error: 'Bạn không có quyền xóa ảnh này.' });
  fs.unlink(path.join(UPLOAD_DIR, photo.filename), () => {});
  db.prepare('DELETE FROM photos WHERE id = ?').run(photo.id);
  res.json({ ok: true });
});

module.exports = router;