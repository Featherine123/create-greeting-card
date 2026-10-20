import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errMsg } from '../api'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'

export function NewBookModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await api.post('/api/books', { title })
      toast('Đã tạo cuốn sổ mới!')
      onCreated?.(data.book)
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="font-bold text-lg mb-4">Tạo cuốn sổ mới</h3>
      <form onSubmit={submit}>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề cuốn sổ (VD: Sinh nhật 2026)"
          maxLength={60}
          required
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-primary" disabled={busy || !title.trim()}>
            {busy ? 'Đang tạo…' : 'Tạo sổ'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function RestoreModal({ open, onClose, onRestored }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const pick = () => fileRef.current?.click()

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('zip', file)
      const { data } = await api.post('/api/books/import', fd)
      toast('Khôi phục thành công! Đã tạo sổ mới.')
      onRestored?.(data.book)
      navigate(`/books/${data.book.id}`)
    } catch (err) {
      toast(errMsg(err, 'Không thể khôi phục ZIP.'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="font-bold text-lg mb-2">Khôi phục từ ZIP</h3>
      <p className="text-ink-soft text-sm mb-5">
        Chọn file ZIP đã tải về. Hệ thống sẽ tạo một cuốn sổ mới từ dữ liệu trong file.
      </p>
      <input ref={fileRef} type="file" accept=".zip,application/zip" className="hidden" onChange={onFile} />
      <div
        className="border-2 border-dashed border-ink/20 rounded-card p-8 text-center cursor-pointer hover:border-accent-rose hover:bg-accent-rose/5 transition"
        onClick={pick}
      >
        <div className="text-3xl mb-2">📦</div>
        <div className="text-sm text-ink-soft">{busy ? 'Đang khôi phục…' : 'Bấm để chọn file ZIP'}</div>
      </div>
      <div className="flex justify-end mt-5">
        <button className="btn-secondary" onClick={onClose}>
          Đóng
        </button>
      </div>
    </Modal>
  )
}