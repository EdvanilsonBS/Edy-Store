/**
 * PÁGINA DE CADASTRO (rota "/signup")
 *   - Campos: nome, e-mail, senha (mínimo 6 caracteres) e confirmação de senha.
 *   - As regras e mensagens de erro estão na função `validate` abaixo - edite à vontade.
 *   - Cria a conta com signup() do AuthContext (simulado) e já deixa o usuário logado.
 */
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from './Layout'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, safeRedirect } from '../utils/validation'
import './AuthPage.css'

const SignupPage = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  // Regras de validação. Para exigir senha maior, troque o 6 (e a mensagem).
  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Informe o seu nome.'
    if (!isValidEmail(form.email)) next.email = 'Informe um e-mail válido.'
    if (form.password.length < 6) next.password = 'A senha precisa ter pelo menos 6 caracteres.'
    if (form.confirm !== form.password) next.confirm = 'As senhas não são iguais.'
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const result = await signup(form)
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
          <h1 className="auth__title">Cadastre-se</h1>
          <p className="auth__subtitle">Crie a sua conta na Digital Store em poucos segundos.</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && (
              <p className="auth__alert" role="alert">
                {formError}
              </p>
            )}
            <FormField
              label="Nome"
              type="text"
              autoComplete="name"
              placeholder="Como devemos te chamar?"
              value={form.name}
              onChange={update('name')}
              error={errors.name}
            />
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
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
            />
            <FormField
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={form.confirm}
              onChange={update('confirm')}
              error={errors.confirm}
            />
            <button type="submit" className="auth__submit" disabled={submitting}>
              {submitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="auth__switch">
            Já tem conta?{' '}
            <Link to={redirect === '/' ? '/login' : `/login?redirect=${encodeURIComponent(redirect)}`}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default SignupPage
