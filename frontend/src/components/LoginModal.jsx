import { useEffect, useMemo, useState } from 'react'

const INITIAL_VALUES = {
  login: {
    username: '',
    password: '',
  },
  register: {
    username: '',
    email: '',
    password: '',
  },
}

export function LoginModal({
  open,
  mode,
  onClose,
  onModeChange,
  onSubmit,
  loading,
  errorMessage,
}) {
  const [formValues, setFormValues] = useState(INITIAL_VALUES)

  useEffect(() => {
    if (!open) {
      setFormValues(INITIAL_VALUES)
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

  const isRegisterMode = mode === 'register'
  const title = isRegisterMode ? 'Criar conta' : 'Entrar'
  const submitLabel = loading
    ? isRegisterMode
      ? 'Criando conta...'
      : 'Entrando...'
    : title
  const currentValues = formValues[mode]

  const helperText = useMemo(() => {
    if (isRegisterMode) {
      return 'Crie sua conta para salvar favoritos e acompanhar seu perfil.'
    }

    return 'Entre com sua conta para manter a sessao ativa e usar favoritos protegidos.'
  }, [isRegisterMode])

  if (!open) {
    return null
  }

  function updateField(field, value) {
    setFormValues((currentState) => ({
      ...currentState,
      [mode]: {
        ...currentState[mode],
        [field]: value,
      },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isRegisterMode) {
      await onSubmit(mode, {
        username: currentValues.username.trim(),
        email: currentValues.email.trim(),
        password: currentValues.password,
      })
      return
    }

    await onSubmit(mode, {
      username: currentValues.username.trim(),
      password: currentValues.password,
    })
  }

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button
        type="button"
        className="auth-modal__backdrop"
        aria-label="Fechar autenticacao"
        onClick={onClose}
      />

      <div className="auth-modal__content">
        <div className="auth-modal__header">
          <div>
            <span className="eyebrow">Conta</span>
            <h2 id="auth-title">{title}</h2>
          </div>

          <button
            type="button"
            className="carousel-button"
            aria-label="Fechar autenticacao"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <p className="auth-modal__lead">{helperText}</p>

        <div className="auth-modal__switch" role="tablist" aria-label="Modo de autenticacao">
          <button
            type="button"
            className={`button-link ${!isRegisterMode ? 'primary' : ''}`.trim()}
            role="tab"
            aria-selected={!isRegisterMode}
            onClick={() => onModeChange('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`button-link ${isRegisterMode ? 'primary' : ''}`.trim()}
            role="tab"
            aria-selected={isRegisterMode}
            onClick={() => onModeChange('register')}
          >
            Criar conta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Usuario</span>
            <input
              type="text"
              name="username"
              autoComplete={isRegisterMode ? 'username' : 'username'}
              value={currentValues.username}
              onChange={(event) => updateField('username', event.target.value)}
              required
            />
          </label>

          {isRegisterMode ? (
            <label className="auth-field">
              <span>E-mail</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={currentValues.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>
          ) : null}

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              value={currentValues.password}
              onChange={(event) => updateField('password', event.target.value)}
              required
              minLength={8}
            />
          </label>

          {errorMessage ? <p className="auth-form__error">{errorMessage}</p> : null}

          <div className="auth-form__actions">
            <button type="button" className="button-link" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="button-link primary" disabled={loading}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
