import { productService } from '../services/productService.js'

export const productController = {
  list: (req, res) => res.json(productService.list(req.query)),
  get: (req, res) => res.json(productService.getById(req.params.id)),
  filters: (req, res) => res.json(productService.filters()),
  categories: (req, res) => res.json(productService.categories()),
  create: (req, res) => res.status(201).json(productService.create(req.body)),
  replace: (req, res) => res.json(productService.replace(req.params.id, req.body)),
  patch: (req, res) => res.json(productService.patch(req.params.id, req.body)),
  remove: (req, res) => {
    productService.remove(req.params.id)
    res.status(204).end()
  },
}
