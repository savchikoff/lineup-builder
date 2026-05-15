import { useState } from 'react'
import { useAdmin } from '../AdminContext'

interface Props {
  onClose: () => void
}

export function AdminLogin({ onClose }: Props) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setSubmitting(true)
    setError(null)
    try {
      await login(password)
      onClose()
    } catch {
      setError('Неверный пароль')
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3>Вход администратора</h3>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <div className="row" style={{ marginBottom: 0 }}>
          <button type="submit" disabled={submitting || !password}>
            {submitting ? 'Проверка…' : 'Войти'}
          </button>
          <button type="button" onClick={onClose}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}
