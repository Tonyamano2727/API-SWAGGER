const router = require('express').Router()
const ctrls = require('../controllers/insertdata')

router.post('/',ctrls.insertdataproducts)

module.exports = router