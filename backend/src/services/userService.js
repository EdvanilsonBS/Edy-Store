/** SERVICE: gerenciamento de usuários (ler, editar e excluir a própria conta; admin lista e exclui). */
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'

export const userService = {
  // Edita o próprio perfil. Aceita { name?, password? }; o e-mail não muda.
  async updateMe(user, { name, password } = {}) {
    const changes = {}
    if (name !== undefined) {
      const cleanName = String(name).trim()
      if (!cleanName) throw new AppError(400, 'Informe o nome.')
      changes.name = cleanName
    }
    if (password !== undefined) {
      if (String(password).length < 6) throw new AppError(400, 'A senha precisa ter pelo menos 6 caracteres.')
      changes.passwordHash = await bcrypt.hash(String(password), 10)
    }
    if (Object.keys(changes).length === 0) throw new AppError(400, 'Envie name e/ou password para atualizar.')
    return User.toPublic(User.update(user.id, changes))
  },

  // Exclui a própria conta (e os pedidos dela)
  removeMe: (user) => User.remove(user.id),

  // Só admin: lista todos os usuários (sem o hash da senha)
  list: () => User.all().map(User.toPublic),

  // Só admin: exclui outro usuário. Não deixa o admin apagar a si mesmo por aqui (use /users/me).
  removeById(admin, id) {
    if (id === admin.id) throw new AppError(400, 'Para excluir a sua própria conta use DELETE /api/users/me.')
    if (!User.remove(id)) throw new AppError(404, 'Usuário não encontrado.')
  },
}
