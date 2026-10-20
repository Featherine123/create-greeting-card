import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errMsg, COVER_COLORS } from '../api'
import { useAuth } from '../AuthContext'
import { useToast } from '../components/Toast'
import { ConfirmModal } from '../components/Modal'
import { NewBookModal, RestoreModal } from '../components/BookModals'

function BookCover({ item }) {
  const navigate = useNavigate()
  const { book, role } = item
  const color = COVER_COLORS[book.coverStyle] || COVER_COLORS.sage
  return (
    <button
      onClick={() => navigate(`/books/${book.id}`)}
      className="text-left w-full rounded-card overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="relative px-6 pt-10 pb-8" style={{ backgroundColor: color }}>
        <div className="absolute top-3 right-4 w-7 h-7 rounded-full bg-white/40 flex items-center justify-center text-sm">
          {role === 'creator' ? '✏️' : '🎁'}
        </div>
        <h3 className="font-script text-3xl text-white drop-shadow-sm leading-snug line-clamp-2">
          {book.title}
        </h3>
      </div>
      <div className="bg-white px-5 py-3 flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            role === 'creator' ? 'bg-accent-rose/15 text-accent-rose' : 'bg-accent-sky/40 text-[#5b7f9c]'
          }`}
        >
          {role === 'creator' ? 'Của tôi' : 'Người nhận'}
        </span>
        <span className="text-xs text-ink-soft">{book.createdAt?.slice(0, 10)}</span>
      </div>
    </button>
  )
}

export default function BooksPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [items, setItems] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/api/books')
      setItems(data)
    } catch (err) {
      toast(errMsg(err), 'error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const doLogout = async () => {
    await logout()
    navigate('/')
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/books/${toDelete.book.id}`)
      toast('Đã xóa cuốn sổ.')
      setToDelete(null)
      load()
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <button onClick={() => navigate('/books')} className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <span className="font-script text-2xl sm:text-3xl text-ink">Cuốn Sổ Lời Chúc</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-sage text-white flex items-center justify-center font-semibold text-sm">
            {(user?.displayName || '?')[0].toUpperCase()}
          </div>
          <div className="hidden sm:block text-sm">
            <div className="font-medium leading-tight">{user?.displayName}</div>
            <div className="text-xs text-ink-soft">@{user?.username}</div>
          </div>
          <button className="btn-ghost" onClick={doLogout} title="Đăng xuất">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="font-script text-3xl text-ink">Sổ của tôi</h2>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => setShowRestore(true)}>
              📦 Khôi phục từ ZIP
            </button>
            <button className="btn-primary" onClick={() => setShowNew(true)}>
              + Tạo cuốn sổ mới
            </button>
          </div>
        </div>

        {items === null ? (
          <div className="text-center text-ink-soft py-20 animate-pulse">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-card shadow-soft">
            <div className="text-5xl mb-4">🌸</div>
            <h3 className="font-script text-3xl mb-2">Chưa có cuốn sổ nào</h3>
            <p className="text-ink-soft mb-6">Hãy tạo cuốn sổ đầu tiên để gửi gắm những lời chúc yêu thương!</p>
            <button className="btn-primary" onClick={() => setShowNew(true)}>
              + Tạo cuốn sổ mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <BookCover key={item.book.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <NewBookModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={(book) => navigate(`/books/${book.id}`)}
      />
      <RestoreModal open={showRestore} onClose={() => setShowRestore(false)} />
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Xóa cuốn sổ?"
        message={`"${toDelete?.book.title}" và toàn bộ ảnh bên trong sẽ bị xóa vĩnh viễn.`}
        busy={busy}
      />
    </div>
  )
}