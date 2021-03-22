const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
<<<<<<< HEAD
const {getStays, deleteStay, addStay,getStayById,updateStay} = require('./stay.controller')
=======
const {addStay, getStays, getStayById, deleteStay , updateStay} = require('./stay.controller')
>>>>>>> c0aa9a6f8e7525063ea537b18ba49ad856bac64a
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log,  getStays)
router.get('/:stayId', log, getStayById)
router.post('/', log, addStay)
router.delete('/:stayId',  requireAuth, deleteStay)
router.put('/:toyId', log, requireAuth, updateStay)


module.exports = router