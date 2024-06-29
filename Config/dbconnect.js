const { default:mongoose } = require ('mongoose')

const dbconnect = async () => {
    try {
        const  connectdb = await mongoose.connect(process.env.MONGODB_URI)
        if(connectdb.connection.readyState === 1) console.log('DB connection is successfull')  // check connectting db 
        else console.log('DB connect failded');
        
    } catch (error) {
        console.log('DB connect is failded');
        throw new Error(error)
    }
}

module.exports = dbconnect