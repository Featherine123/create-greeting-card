export default function PhotoSlot({ photo, canDelete, canAdd = true, tilt = 0, onView, onDelete, onAdd }) {
  if (!photo) {
    if (!canAdd) {
      return (
        <div className="slot-empty !cursor-default opacity-60">
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium">Chưa có ảnh</span>
        </div>
      )
    }
    return (
      <button className="slot-empty" onClick={onAdd}>
        <span className="text-3xl">📷</span>
        <span className="text-sm font-medium">Thêm ảnh</span>
      </button>
    )
  }
  const frame = photo.frameStyle || 'polaroid'
  return (
    <div className="photo-frame-wrap" style={{ transform: `rotate(${tilt}deg)` }}>
      <div className={`photo-frame frame-${frame}`}>
        <img src={photo.url} alt={photo.uploadedByName || 'Ảnh'} loading="lazy" />
        {frame === 'polaroid' && photo.uploadedByName && <div className="pol-cap">{photo.uploadedByName}</div>}
        <div className="polaroid-overlay">
          <button onClick={() => onView(photo)} title="Xem lớn">
            🔍
          </button>
          {canDelete && (
            <button onClick={() => onDelete(photo)} title="Xóa ảnh">
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}