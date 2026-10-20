import { ENVELOPE_COLORS } from '../api'

export default function Envelope({ style = 'rose', opened, onOpen, children }) {
  const c = ENVELOPE_COLORS[style] || ENVELOPE_COLORS.rose
  return (
    <div className="envelope-scene">
      <div
        className={`envelope ${opened ? 'envelope-opened' : ''}`}
        onClick={opened ? undefined : onOpen}
        role="button"
        aria-label="Mở phong bì"
      >
        <div className="env-card">{children}</div>

        <div className="env-back" style={{ background: c.light }} />

        <div className="env-front" style={{ background: c.main }}>
          <div className="env-tri env-tri-l" style={{ background: c.dark }} />
          <div className="env-tri env-tri-r" style={{ background: c.dark }} />
          <div className="env-stamp">
            <span className="env-stamp-inner">🌸</span>
          </div>
        </div>

        <div className="env-flap" style={{ background: c.main }}>
          <div className="env-flap-fold" style={{ background: c.dark }} />
        </div>
      </div>
    </div>
  )
}