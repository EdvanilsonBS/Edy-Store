/**
 * VALIDAÇÕES usadas nos formulários de login e cadastro
 * isValidEmail   checagem simples de formato (algo@dominio.xx)
 * safeRedirect   só deixa redirecionar para caminhos internos do site
 */
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

// só aceita caminhos internos (evita redirecionar para outro site)
export const safeRedirect = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/'
