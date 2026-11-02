/**
 * LOGIN E CADASTRO SIMULADOS (sem backend)
 *
 * Como funciona:
 *   - As contas ficam no localStorage do navegador (chave 'drip-store:users').
 *   - A sessão (quem está logado) fica em 'drip-store:session' e continua após recarregar.
 *   - A senha é guardada como hash SHA-256, nunca em texto puro.
 *   - NÃO serve para um sistema real: qualquer pessoa com acesso ao navegador vê os dados.
 *
 * Como usar em qualquer componente:
 *   const { user, signup, login, logout } = useAuth()
 *   user é null (deslogado) ou { name, email }.
 *
 * Para conectar a uma API de verdade, troque o corpo de signup/login/logout por chamadas fetch().
 * Para "zerar" as contas durante os testes: F12 > Application > Local Storage > apagar as chaves.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readStorage, removeStorage, writeStorage } from '../utils/storage'

// Autenticação SIMULADA: não existe backend. Os usuários ficam no localStorage do navegador.
// A senha é guardada como hash (SHA-256) apenas para não ficar em texto puro.
const USERS_KEY = 'drip-store:users'
const SESSION_KEY = 'drip-store:session'

const hash = async (text) => {
  if (!globalThis.crypto?.subtle) return btoa(unescape(encodeURIComponent(text)))
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const AuthContext = createContext(null)

// Envolve o site (veja main.jsx) para que `useAuth()` funcione em qualquer lugar.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStorage(SESSION_KEY, null))

  const startSession = (account) => {
    const session = { name: account.name, email: account.email }
    writeStorage(SESSION_KEY, session)
    setUser(session)
  }

  // Cria a conta. Devolve { ok: true } ou { ok: false, error: 'mensagem' }.
  const signup = useCallback(async ({ name, email, password }) => {
    const users = readStorage(USERS_KEY, [])
    const normalized = email.trim().toLowerCase()

    if (users.some((item) => item.email === normalized)) {
      return { ok: false, error: 'Já existe uma conta com esse e-mail.' }
    }

    const account = { name: name.trim(), email: normalized, passwordHash: await hash(password) }
    writeStorage(USERS_KEY, [...users, account])
    startSession(account)
    return { ok: true }
  }, [])

  // Confere e-mail e senha. Devolve { ok: true } ou { ok: false, error: 'mensagem' }.
  const login = useCallback(async ({ email, password }) => {
    const users = readStorage(USERS_KEY, [])
    const normalized = email.trim().toLowerCase()
    const account = users.find((item) => item.email === normalized)

    if (!account || account.passwordHash !== (await hash(password))) {
      return { ok: false, error: 'E-mail ou senha incorretos.' }
    }

    startSession(account)
    return { ok: true }
  }, [])

  // Encerra a sessão.
  const logout = useCallback(() => {
    removeStorage(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signup, login, logout }), [user, signup, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
