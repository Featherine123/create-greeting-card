import { useState } from 'react'
import Modal from './Modal'
import { useToast } from './Toast'

function CopyRow({ label, value, hint }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast('Đã sao chép link!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Không thể sao chép.', 'error')
    }
  }
  return (
    <div className="border border-ink/10 rounded-card p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-[11px] text-ink-soft">{hint}</span>}
      </div>
      <div className="flex gap-2">
        <input className="input !py-2 text-sm" readOnly value={value} onFocus={(e) => e.target.select()} />
        <button className={`btn-primary shrink-0 !px-4 !py-2 text-sm ${copied ? 'bg-accent-sage hover:bg-accent-sage' : ''}`} onClick={copy}>
          {copied ? '✓ Đã chép' : 'Sao chép'}
        </button>
      </div>
    </div>
  )
}

export default function ShareModal({ open, book, onClose, onTogglePublic, busy }) {
  const { toast } = useToast()
  const base = window.location.href.split('#')[0]
  const contribLink = `${base}#/b/${book?.shareCode}`
  const viewLink = `${base}#/v/${book?.viewCode}`
  const isPublic = !!book?.publicView

  const toggle = async () => {
    try {
      await onTogglePublic(!isPublic)
      toast(isPublic ? 'Đã tắt link xem công khai.' : 'Đã tạo link xem công khai!')
    } catch {
      toast('Không thể thay đổi chế độ chia sẻ.', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="font-bold text-lg mb-4">Chia sẻ cuốn sổ 👥</h3>

      <CopyRow
        label="Link góp ảnh"
        hint="cần đăng nhập"
        value={contribLink}
      />

      <button
        onClick={toggle}
        disabled={busy}
        className="w-full flex items-center justify-between gap-3 border border-ink/10 rounded-card px-4 py-3 mb-3 hover:bg-paper transition cursor-pointer disabled:opacity-60"
      >
        <span className="text-left">
          <span className="block font-medium text-sm">Link chỉ xem — không cần đăng nhập</span>
          <span className="block text-xs text-ink-soft mt-0.5">
            {isPublic
              ? 'Ai có link này đều xem được sổ, không thể sửa.'
              : 'Bật để tạo link xem công khai.'}
          </span>
        </span>
        <span
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            isPublic ? 'bg-accent-sage' : 'bg-ink/20'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
              isPublic ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </span>
      </button>

      {isPublic ? (
        <CopyRow label="Link chỉ xem" hint="không cần đăng nhập" value={viewLink} />
      ) : (
        <p className="text-xs text-ink-soft px-1 mb-3">
          Link góp ảnh yêu cầu người xem đăng nhập để xem và góp ảnh kỷ niệm.
        </p>
      )}

      <div className="flex justify-end mt-2">
        <button className="btn-secondary" onClick={onClose}>
          Đóng
        </button>
      </div>
    </Modal>
  )
}