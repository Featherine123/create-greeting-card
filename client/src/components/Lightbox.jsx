import { useEffect } from 'react'

export default function Lightbox({ photo, onClose }) {
  useEffect(() => {
    if (!photo) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photo, onClose])

  if (!photo) return null
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={photo.url}
        alt={photo.uploadedByName || 'Ảnh'}
        className="max-w-full max-h-full rounded-lg shadow-2xl"
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
        {photo.uploadedByName && <>📸 {photo.uploadedByName}</>}
      </div>
    </div>
  )
}