import axios from 'axios'

export const api = axios.create({ withCredentials: true })

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const cfg = err.config || {}
    const isAuthCall = String(cfg.url || '').includes('/api/auth/')
    if (err.response?.status === 401 && !isAuthCall) {
      const loc = window.location.hash.slice(1) || '/books'
      window.location.hash = `#/?redirect=${encodeURIComponent(loc)}`
    }
    return Promise.reject(err)
  }
)

export function errMsg(e, fallback = 'Đã có lỗi xảy ra.') {
  return e?.response?.data?.error || fallback
}

export const ENVELOPE_COLORS = {
  rose: { main: '#D96C6C', dark: '#c95a5a', light: '#f0b4b4' },
  kraft: { main: '#C9A87C', dark: '#b9986a', light: '#e0c9a8' },
  sky: { main: '#A9C6D9', dark: '#96b5cc', light: '#cfe0ec' },
  sage: { main: '#8FA98A', dark: '#7d9a78', light: '#c2d2bf' },
}

export const COVER_COLORS = {
  rose: '#D96C6C',
  kraft: '#C9A87C',
  sky: '#A9C6D9',
  sage: '#8FA98A',
}

export const ENVELOPE_LABELS = { rose: 'Hồng', kraft: 'Kraft', sky: 'Xanh', sage: 'Xanh lá' }