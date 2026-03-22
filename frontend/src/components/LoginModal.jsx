import { useEffect, useState } from 'react'

export function LoginModal({ open, onClose, onSubmit, loading, errorMessage }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!open) {
      setUsername('')
      setPassword('')
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({
      username: username.trim(),
      password,
    })
  }

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button
        type="button"
        className="auth-modal__backdrop"
        aria-label="Fechar login"
        onClick={onClose}
      />

      <div className="auth-modal__content">
        <div className="auth-modal__header">
          <div>
            <span className="eyebrow">Conta</span>
            <h2 id="login-title">Entrar</h2>
          </div>

          <button
            type="button"
            className="carousel-button"
            aria-label="Fechar login"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <p className="auth-modal__lead">
          Entre com sua conta para manter a sessao ativa e usar favoritos protegidos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Usuario</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

          <div className="auth-form__actions">
            <button type="button" className="button-link" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="button-link primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
