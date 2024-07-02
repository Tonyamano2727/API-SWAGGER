const userRouter = require('./userRoutes')
// const PostRouter = require('./Post')
const {notFound , errHandler} = require('../middlewares/errHandler')
const insertdata = require('./insertdata')
const productsRouter = require('./productsRoutes')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    app.use('/api/insert', insertdata)
    app.use('/api/products', productsRouter)


    app.use(notFound)
    app.use(errHandler)
}
module.exports = initRoutes