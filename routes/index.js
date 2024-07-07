const {notFound , errHandler} = require('../middlewares/errHandler')
const insertdata = require('./insertdata')
const productsRouter = require('./productsRoutes')
const OrderRouter = require('./orderRoutes')
const userRouter = require('./userRoutes')

const initRoutes = (app) => {
    app.use('/api', userRouter)
    app.use('/api/insert', insertdata)
    app.use('/api/products', productsRouter)
    app.use('/api/orders', OrderRouter)


    app.use(notFound)
    app.use(errHandler)
}
module.exports = initRoutes