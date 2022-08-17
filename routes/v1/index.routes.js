const userRouter = require('./user/users.routes')
const sankeyUserRouter = require('./sankeyUser/sankeyUser.routes')

module.exports = (app) => {
  app.use('/users', userRouter)
  app.use('/sankeyusers', sankeyUserRouter)
}
