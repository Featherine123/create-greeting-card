import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, errMsg } from '../api'
import { useAuth } from '../AuthContext'
import { useToast } from '../components/Toast'
import { ConfirmModal } from '../components/Modal'
import Envelope from '../components/Envelope'
import PhotoSlot from '../components/PhotoSlot'
import Lightbox from '../components/Lightbox'
import FramePicker from '../components/FramePicker'
import WishModal from '../components/WishModal'
import ShareModal from '../components/ShareModal'

function Spiral() {
  return (
    <div className="spiral">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  )
}

function PageFrame({ children, className = '' }) {
  return (
    <div
      className={`relative bg-paper rounded-card shadow-soft border border-ink/5 px-6 sm:px-10 py-8 min-h-[480px] flex flex-col ${className}`}
    >
      <Spiral />
      <div className="pl-6 flex-1 flex flex-col">{children}</div>
    </div>
  )
}

function EnvelopePage({ book, role, opened, onOpen, onEditWish }) {
  const hasWish = !!book.wishTitle || !!book.wishMessage
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
      <Envelope style={book.envelopeStyle} opened={opened} onOpen={onOpen}>
        <div className="flex flex-col items-center justify-center px-6 py-5 text-center">
          {hasWish ? (
            <>
              <div className="text-2xl mb-1">🌸</div>
              <h3 className="font-script text-3xl text-accent-rose mb-3">{book.wishTitle}</h3>
              <div className="w-16 border-t border-ink/15 mb-3" />
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{book.wishMessage}</p>
            </>
          ) : (
            <p className="text-ink-soft text-sm italic">
              {role === 'creator' ? 'Viết lời chúc đầu tiên 💌' : 'Lời chúc đang được viết…'}
            </p>
          )}
        </div>
      </Envelope>

      {opened && (
        <div className="flex items-center gap-3 animate-photo-in relative z-50">
          <button className="btn-secondary" onClick={onOpen}>
            ↩ Mở lại
          </button>
          {role === 'creator' && (
            <button className="btn-primary" onClick={onEditWish}>
              ✏️ {hasWish ? 'Sửa lời chúc' : 'Viết lời chúc'}
            </button>
          )}
        </div>
      )}

      {!opened && role === 'creator' && !hasWish && (
        <button className="btn-primary animate-photo-in" onClick={onEditWish}>
          ✏️ Viết lời chúc
        </button>
      )}
    </div>
  )
}

function PhotoPage({ page, canEdit, onAdd, onView, onDeletePhoto }) {
  const photo = page.photos[0] || null
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-script text-2xl text-ink">Trang {page.pageNumber}</h3>
        <span className="text-xs text-ink-soft">{photo ? '1 ảnh' : 'Chưa có ảnh'}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[300px]">
          <PhotoSlot
            photo={photo}
            canDelete={photo ? photo.canDelete : false}
            canAdd={canEdit}
            tilt={page.pageNumber % 2 === 0 ? -1.5 : 1.5}
            onView={onView}
            onDelete={onDeletePhoto}
            onAdd={() => onAdd(page)}
          />
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  const { id, code } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef(null)

  const [data, setData] = useState(null)
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [envelopeOpened, setEnvelopeOpened] = useState(false)

  const [showWish, setShowWish] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showDownload, setShowDownload] = useState(false)
  const [delBook, setDelBook] = useState(false)
  const [delPage, setDelPage] = useState(null)
  const [delPhoto, setDelPhoto] = useState(null)
  const [busy, setBusy] = useState(false)

  const [lightbox, setLightbox] = useState(null)
  const [frameTarget, setFrameTarget] = useState(null)
  const [frameFile, setFrameFile] = useState(null)

  const isViewMode = location.pathname.startsWith('/v/')

  const load = useCallback(
    async (silent) => {
      if (!silent) setLoading(true)
      try {
        let url = `/api/books/${id}`
        if (code && isViewMode) url = `/api/books/view/${code}`
        else if (code) url = `/api/books/by-code/${code}`
        const { data } = await api.get(url)
        setData(data)
        setNotFound(false)
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true)
        else toast(errMsg(err), 'error')
      } finally {
        setLoading(false)
      }
    },
    [id, code, isViewMode, toast]
  )

  useEffect(() => {
    setIdx(0)
    setEnvelopeOpened(false)
    load()
  }, [load])

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-6xl">🕊️</div>
        <h1 className="font-script text-4xl">Không tìm thấy cuốn sổ</h1>
        <p className="text-ink-soft">Link chia sẻ có thể không đúng hoặc cuốn sổ đã bị xóa.</p>
        <button className="btn-primary" onClick={() => navigate('/books')}>
          Về danh sách sổ
        </button>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-soft animate-pulse">Đang mở sổ…</div>
      </div>
    )
  }

  const { book, pages, role } = data
  const total = 1 + pages.length
  const current = idx === 0 ? null : pages[idx - 1]
  const nextVirtual = idx + 1
  const nextPage = nextVirtual >= total ? null : nextVirtual === 0 ? null : pages[nextVirtual - 1]

  const goPrev = () => setIdx((i) => (i - 1 + total) % total)
  const goNext = () => setIdx((i) => (i + 1) % total)

  const refresh = () => load(true)

  const pickPhoto = (page) => {
    setFrameTarget(page)
    fileRef.current?.click()
  }

  const onFileSelected = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!okTypes.includes(file.type)) {
      toast('Định dạng ảnh không hợp lệ (JPEG, PNG, WEBP, GIF).', 'error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Ảnh quá lớn (tối đa 10MB).', 'error')
      return
    }
    setFrameFile(file)
  }

  const savePhoto = async (frame) => {
    const fd = new FormData()
    fd.append('file', frameFile)
    fd.append('frame', frame)
    try {
      await api.post(`/api/pages/${frameTarget.id}/photos`, fd)
      toast('Đã thêm ảnh!')
      setFrameFile(null)
      setFrameTarget(null)
      refresh()
    } catch (err) {
      toast(errMsg(err), 'error')
    }
  }

  const addPage = async () => {
    setBusy(true)
    try {
      await api.post(`/api/books/${book.id}/pages`)
      toast('Đã thêm trang mới!')
      refresh()
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelPage = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/books/${book.id}/pages/${delPage.id}`)
      toast('Đã xóa trang.')
      setDelPage(null)
      refresh()
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelPhoto = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/photos/${delPhoto.id}`)
      toast('Đã xóa ảnh.')
      setDelPhoto(null)
      refresh()
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelBook = async () => {
    setBusy(true)
    try {
      await api.delete(`/api/books/${book.id}`)
      toast('Đã xóa cuốn sổ.')
      navigate('/books')
    } catch (err) {
      toast(errMsg(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  const saveWish = async (payload) => {
    try {
      await api.put(`/api/books/${book.id}/wish`, payload)
      toast('Đã lưu lời chúc!')
      setShowWish(false)
      refresh()
    } catch (err) {
      toast(errMsg(err), 'error')
    }
  }

  const download = (kind) => {
    setShowDownload(false)
    window.location.href = `/api/books/${book.id}/export/${kind}`
  }

  const canAddPage = role === 'creator' && total < 5

  return (
    <div className="min-h-screen pb-16">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />

      <header className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-2 relative z-50">
        {!(role === 'viewer' && !user) && (
          <button className="btn-ghost" onClick={() => navigate('/books')}>
            ← Về
          </button>
        )}
        <h1 className="font-script text-2xl sm:text-3xl text-ink flex-1 truncate px-2">{book.title}</h1>

        {role === 'creator' && (
          <button className="btn-ghost" onClick={() => setShowWish(true)} title="Viết lời chúc">
            ✏️
          </button>
        )}
        {role === 'creator' && (
          <button className="btn-ghost" onClick={() => setShowShare(true)} title="Chia sẻ">
            👥
          </button>
        )}
        <div className="relative">
          <button className="btn-ghost" onClick={() => setShowDownload((s) => !s)} title="Tải xuống">
            ⬇️
          </button>
          {showDownload && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDownload(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-card shadow-lift border border-ink/5 py-2 w-44">
                <button
                  className="w-full text-left px-4 py-2.5 hover:bg-paper-dark text-sm font-medium"
                  onClick={() => download('zip')}
                >
                  📦 Tải ZIP (backup)
                </button>
                <button
                  className="w-full text-left px-4 py-2.5 hover:bg-paper-dark text-sm font-medium"
                  onClick={() => download('pdf')}
                >
                  📄 Tải PDF (in)
                </button>
              </div>
            </>
          )}
        </div>
        {role === 'creator' && (
          <>
            <button className="btn-ghost" onClick={() => setDelBook(true)} title="Xóa sổ">
              🗑️
            </button>
            {canAddPage && (
              <button className="btn-primary !px-4 !py-2 text-sm" onClick={addPage} disabled={busy}>
                + Thêm trang
              </button>
            )}
          </>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <div className="relative">
          <div key={idx} className="animate-page-flip grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <PageFrame>
              {idx === 0 ? (
                <EnvelopePage
                  book={book}
                  role={role}
                  opened={envelopeOpened}
                  onOpen={() => setEnvelopeOpened((o) => !o)}
                  onEditWish={() => setShowWish(true)}
                />
              ) : (
                <PhotoPage
                  page={current}
                  canEdit={role !== 'viewer'}
                  onAdd={pickPhoto}
                  onView={setLightbox}
                  onDeletePhoto={setDelPhoto}
                />
              )}
            </PageFrame>

            {nextPage && (
              <div className="hidden lg:block">
                <PageFrame className="lg:block">
                  <PhotoPage
                    page={nextPage}
                    canEdit={role !== 'viewer'}
                    onAdd={pickPhoto}
                    onView={setLightbox}
                    onDeletePhoto={setDelPhoto}
                  />
                </PageFrame>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button className="btn-secondary !p-2.5" onClick={goPrev} aria-label="Trang trước">
            ◀
          </button>
          <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Trang ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === idx ? 'bg-accent-rose scale-125' : 'bg-ink/20 hover:bg-ink/40'
                }`}
              />
            ))}
          </div>
          <button className="btn-secondary !p-2.5" onClick={goNext} aria-label="Trang sau">
            ▶
          </button>
        </div>
      </main>

      {role === 'creator' && delPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="modal-card">
            <h3 className="font-bold text-lg mb-2">Xóa trang này?</h3>
            <p className="text-ink-soft text-sm mb-6">Ảnh trong trang sẽ bị xóa vĩnh viễn.</p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setDelPage(null)} disabled={busy}>
                Hủy
              </button>
              <button className="btn-danger" onClick={confirmDelPage} disabled={busy}>
                {busy ? 'Đang xóa…' : 'Xóa trang'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!delPhoto}
        onClose={() => setDelPhoto(null)}
        onConfirm={confirmDelPhoto}
        title="Xóa ảnh này?"
        message="Ảnh sẽ bị xóa vĩnh viễn khỏi cuốn sổ."
        busy={busy}
      />
      <ConfirmModal
        open={delBook}
        onClose={() => setDelBook(false)}
        onConfirm={confirmDelBook}
        title="Xóa cuốn sổ?"
        message={`"${book.title}" và toàn bộ ảnh bên trong sẽ bị xóa vĩnh viễn.`}
        busy={busy}
      />

      <WishModal open={showWish} book={book} onClose={() => setShowWish(false)} onSave={saveWish} />
      <ShareModal
        open={showShare}
        book={book}
        onClose={() => setShowShare(false)}
        onTogglePublic={async (publicView) => {
          await api.put(`/api/books/${book.id}/share`, { publicView })
          refresh()
        }}
      />
      <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />
      <FramePicker
        file={frameFile}
        onCancel={() => setFrameFile(null)}
        onSave={savePhoto}
      />
    </div>
  )
}