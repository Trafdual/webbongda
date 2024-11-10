const router = require('express').Router()
const Ca = require('../models/CaModels')
const moment = require('moment')

router.get('/getCa', async (req, res) => {
  try {
    const ca = await Ca.find().lean()
    const cajson = await Promise.all(
      ca.map(async c => {
        const ca1 = await Ca.findById(c._id)
        return {
          _id: ca1._id,
          tenca: ca1.tenca,
          giaca: ca1.giaca,
          begintime: moment(c.begintime).format('HH:mm'), // Định dạng lại giờ
          endtime: moment(c.endtime).format('HH:mm'), // Định dạng lại giờ
          trangthai: ca1.trangthai
        }
      })
    )
    res.json(cajson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/postca', async (req, res) => {
  try {
    const { tenca, giaca, begintime, endtime, trangthai } = req.body
    const formattedbegin = moment(begintime, 'HH:mm').isValid()
      ? moment(begintime, 'HH:mm')
      : null
    const formattedend = moment(endtime, 'HH:mm').isValid()
      ? moment(endtime, 'HH:mm')
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
    const cajson = {
      _id: ca._id,
      tenca: ca.tenca,
      giaca: ca.giaca,
      begintime: moment(ca.begintime).format('HH:mm'), // Định dạng lại giờ
      endtime: moment(ca.endtime).format('HH:mm'), // Định dạng lại giờ
      trangthai: ca.trangthai
    }
    res.json(cajson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/updateca/:id', async (req, res) => {
  try {
    const { tenca, giaca, begintime, endtime, trangthai } = req.body
    const id = req.params.id
    const formattedbegin = moment(begintime, 'HH:mm').isValid()
      ? moment(begintime, 'HH:mm')
      : null
    const formattedend = moment(endtime, 'HH:mm').isValid()
      ? moment(endtime, 'HH:mm')
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

router.post('/deleteca/:id', async (req, res) => {
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
