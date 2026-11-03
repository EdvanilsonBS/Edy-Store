/**
 * LEITURA E ESCRITA NO localStorage (os dados que ficam salvos no navegador)
 * Usado pelo login, pela sacola e pelos pedidos.
 * Se o navegador bloquear o armazenamento (ex.: janela privada), as funções não quebram:
 * readStorage devolve o valor padrão e writeStorage simplesmente não salva.
 */

export const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sem armazenamento disponível: segue sem persistir */
  }
}

export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignora */
  }
}
