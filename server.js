const express = require('express');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger');
const dbConnect = require('./Config/dbconnect');
require('dotenv').config();
const initRoutes = require('./routes')

const app = express();
const port = process.env.PORT || 3000;

// Middleware để phân tích yêu cầu JSON
app.use(express.json());

// Kết nối tới MongoDB
dbConnect();

// Thiết lập Swagger
setupSwagger(app);

// Định tuyến API
app.use('/api', userRoutes);

initRoutes(app)

// Kiểm tra server
app.use('/', (req, res) => { 
  res.send('SERVER ONNNN'); 
});

// Khởi động server
app.listen(port, () => {
  console.log('SERVER RUNNING ON THE ' + port);
});
