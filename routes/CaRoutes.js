const router = require('express').Router()
const Ca = require('../models/CaModels')
const moment = require('moment')

router.get('/getCa', async (req, res) => {
  try {
    const ca = await Ca.find().lean()
    res.json(ca)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/postca', async (req, res) => {
  try {
    const { tenca, giaca, begintime, endtime, trangthai } = req.body
    const formattedbegin = moment(begintime).isValid()
      ? moment(begintime).toDate()
      : null
    const formattedend = moment(endtime).isValid()
      ? moment(begintime).toDate()
      : null

    const ca = new Ca({
      tenca,
      giaca,
      begintime: formattedbegin,
      endtime: formattedend,
      trangthai
    })
    await ca.save()
    res.json(ca)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getputca/:id', async (req, res) => {
  try {
    const id = req.params.id
    const ca = await Ca.findById(id).lean()
    res.json(ca)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/updateca/:id', async (req, res) => {
  try {
    const { tenca, giaca, begintime, endtime, trangthai } = req.body
    const id = req.params.id
    const formattedbegin = moment(begintime).isValid()
      ? moment(begintime).toDate()
      : null
    const formattedend = moment(endtime).isValid()
      ? moment(begintime).toDate()
      : null

    const ca = await Ca.findByIdAndUpdate(id, {
      tenca,
      giaca,
      begintime: formattedbegin,
      endtime: formattedend,
      endtime,
      trangthai
    })
    res.json(ca)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.delete('/deleteca/:id', async (req, res) => {
  try {
    const id = req.params.id
    await Ca.findByIdAndDelete(id)
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})
module.exports = router
