/** CONTROLLER: recebe a requisição, chama o service e devolve a resposta. */
import { authService } from '../services/authService.js'
import { userService } from '../services/userService.js'
import { User } from '../models/User.js'

export const authController = {
  signup: async (req, res) => res.status(201).json(await authService.signup(req.body ?? {})),
  login: async (req, res) => res.json(await authService.login(req.body ?? {})),
  me: (req, res) => res.json({ user: User.toPublic(req.user) }),
  updateMe: async (req, res) => res.json({ user: await userService.updateMe(req.user, req.body ?? {}) }),
  removeMe: (req, res) => {
    userService.removeMe(req.user)
    res.status(204).end()
  },
}
