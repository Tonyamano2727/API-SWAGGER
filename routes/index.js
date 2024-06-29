const userRouter = require('./userRoutes')
// const PostRouter = require('./Post')
const {notFound , errHandler} = require('../middlewares/errHandler')

const initRoutes = (app) => {
    app.use('/api/user', userRouter)
    // app.use('/api/post', PostRouter)


    app.use(notFound)
    app.use(errHandler)
}
module.exports = initRoutes