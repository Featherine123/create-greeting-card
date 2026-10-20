import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { errMsg } from '../api'
import { useToast } from '../components/Toast'

export default function AuthPage() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/books'
  const { login, register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (tab === 'login') {
        await login(username.trim(), password)
      } else {
        await register(username.trim(), password, displayName.trim())
      }
      toast(tab === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!')
      navigate(redirect, { replace: true })
    } catch (err) {
      toast(errMsg(err, 'Đã có lỗi xảy ra.'), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-card shadow-lift overflow-hidden mb-8">
          <div className="bg-accent-sage px-8 pt-10 pb-8 text-center relative">
            <div className="absolute top-4 right-5 w-8 h-8 rounded-full bg-gold/70 flex items-center justify-center text-base">
              🌸
            </div>
            <h1 className="font-script text-4xl sm:text-5xl text-white drop-shadow-sm">Cuốn Sổ Lời Chúc</h1>
            <p className="text-white/85 text-sm mt-2">Gửi gắm yêu thương qua từng trang kỷ niệm</p>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-soft p-6">
          <div className="flex bg-paper-dark rounded-full p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  tab === t ? 'bg-white shadow text-ink' : 'text-ink-soft hover:text-ink'
                }`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Tên hiển thị</label>
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Minh"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Tên đăng nhập</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Ít nhất 6 ký tự' : '••••••'}
                required
                minLength={6}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Đang xử lý…' : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}