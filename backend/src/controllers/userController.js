import { userService } from '../services/userService.js'

export const userController = {
  list: (req, res) => res.json(userService.list()),
  remove: (req, res) => {
    userService.removeById(req.user, req.params.id)
    res.status(204).end()
  },
}
