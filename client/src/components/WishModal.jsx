import { useState } from 'react'
import Modal from './Modal'
import { ENVELOPE_COLORS, COVER_COLORS, ENVELOPE_LABELS } from '../api'

export default function WishModal({ open, book, onClose, onSave }) {
  const [wishTitle, setWishTitle] = useState(book?.wishTitle || '')
  const [wishMessage, setWishMessage] = useState(book?.wishMessage || '')
  const [envelopeStyle, setEnvelopeStyle] = useState(book?.envelopeStyle || 'rose')
  const [coverStyle, setCoverStyle] = useState(book?.coverStyle || 'sage')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave({ wishTitle, wishMessage, envelopeStyle, coverStyle })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="font-bold text-lg mb-4">Viết lời chúc 💌</h3>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Tiêu đề thiệp</label>
          <input
            className="input"
            value={wishTitle}
            onChange={(e) => setWishTitle(e.target.value)}
            placeholder="VD: Chúc mừng sinh nhật!"
            maxLength={80}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nội dung lời chúc</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={wishMessage}
            onChange={(e) => setWishMessage(e.target.value)}
            placeholder="Những lời yêu thương dành cho người nhận…"
            maxLength={2000}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Màu phong bì</label>
          <div className="flex gap-3">
            {Object.keys(ENVELOPE_COLORS).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setEnvelopeStyle(k)}
                className={`w-10 h-10 rounded-full transition-all cursor-pointer ${
                  envelopeStyle === k ? 'ring-4 ring-offset-2 ring-accent-rose scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: ENVELOPE_COLORS[k].main }}
                title={ENVELOPE_LABELS[k]}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Màu bìa sổ</label>
          <div className="flex gap-3">
            {Object.keys(COVER_COLORS).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setCoverStyle(k)}
                className={`w-10 h-10 rounded-full transition-all cursor-pointer ${
                  coverStyle === k ? 'ring-4 ring-offset-2 ring-accent-rose scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: COVER_COLORS[k] }}
                title={ENVELOPE_LABELS[k]}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            Hủy
          </button>
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu lời chúc'}
          </button>
        </div>
      </form>
    </Modal>
  )
}