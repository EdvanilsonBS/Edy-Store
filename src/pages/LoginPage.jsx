/**
 * PÁGINA DE LOGIN (rota "/login")
 *   - Valida e-mail e senha antes de enviar e mostra os erros embaixo de cada campo.
 *   - Chama login() do AuthContext (simulado - veja src/context/AuthContext.jsx).
 *   - Depois de entrar, volta para a página indicada em ?redirect= (ou para a Home).
 */
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from './Layout'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, safeRedirect } from '../utils/validation'
import './AuthPage.css'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Para onde ir após o login (?redirect=/orders). safeRedirect só aceita caminhos internos.
  const redirect = safeRedirect(searchParams.get('redirect'))

  // form = valores digitados | errors = erro de cada campo | formError = erro geral (senha errada)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Gera o onChange de um campo: update('email') atualiza só form.email
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    // Regras de validação (edite as mensagens aqui)
    const nextErrors = {}
    if (!isValidEmail(form.email)) nextErrors.email = 'Informe um e-mail válido.'
    if (!form.password) nextErrors.password = 'Informe a sua senha.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const result = await login(form)
    setSubmitting(false)

    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate(redirect)
  }

  return (
    <Layout>
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Entrar</h1>
          <p className="auth__subtitle">Acesse a sua conta para ver os seus pedidos.</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && (
              <p className="auth__alert" role="alert">
                {formError}
              </p>
            )}
            <FormField
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
            />
            <FormField
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="Digite a sua senha"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
            />
            <button type="submit" className="auth__submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="auth__switch">
            Ainda não tem conta?{' '}
            <Link to={redirect === '/' ? '/signup' : `/signup?redirect=${encodeURIComponent(redirect)}`}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage
