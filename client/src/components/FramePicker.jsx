import { useEffect, useState } from 'react'
import Modal from './Modal'

export const FRAMES = [
  { key: 'polaroid', label: 'Polaroid' },
  { key: 'heart', label: 'Trái tim' },
  { key: 'circle', label: 'Tròn' },
  { key: 'tape', label: 'Băng keo' },
  { key: 'sticker', label: 'Sticker' },
]

export default function FramePicker({ file, onCancel, onSave }) {
  const [src, setSrc] = useState(null)
  const [frame, setFrame] = useState('polaroid')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const doSave = async () => {
    if (!src) return
    setSaving(true)
    try {
      await onSave(frame)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={!!file} onClose={onCancel} wide>
      <h3 className="font-bold text-lg mb-1">Chọn khung viền dễ thương</h3>
      <p className="text-ink-soft text-sm mb-4">Ảnh sẽ được lưu nguyên vẹn, chỉ thêm khung trang trí.</p>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 flex items-center justify-center bg-paper-dark rounded-card p-4 min-h-[220px]">
          {src && (
            <div className="w-44">
              <div className={`photo-frame frame-${frame}`}>
                <img src={src} alt="Xem trước" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            {FRAMES.map((f) => (
              <button
                key={f.key}
                onClick={() => setFrame(f.key)}
                className={`rounded-card border-2 p-2 transition-all cursor-pointer ${
                  frame === f.key ? 'border-accent-rose bg-accent-rose/5' : 'border-ink/10 hover:border-ink/25'
                }`}
              >
                <div className="w-full aspect-square bg-paper-dark rounded overflow-hidden flex items-center justify-center">
                  {src ? (
                    <div className="w-16">
                      <div className={`photo-frame frame-${f.key}`}>
                        <img src={src} alt="" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl">🖼️</div>
                  )}
                </div>
                <div className="text-xs font-medium mt-1.5 text-center">{f.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-secondary" onClick={onCancel} disabled={saving}>
          Hủy
        </button>
        <button className="btn-primary" onClick={doSave} disabled={saving || !src}>
          {saving ? 'Đang lưu…' : 'Lưu ảnh'}
        </button>
      </div>
    </Modal>
  )
}