/** Express 4 não repassa erros de funções async para o errorHandler; este wrapper faz isso. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
