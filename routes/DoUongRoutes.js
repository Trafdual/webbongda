const router = require('express').Router()
const DoUong = require('../models/DoUongModels')
const uploads = require('./uploads')

router.get('/getdouong', async (req, res) => {
  try {
    const douong = await DoUong.find().lean()
    res.json(douong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post(
  '/postdouong',
  uploads.fields([
    { name: 'image', maxCount: 1 } // Một ảnh duy nhất
  ]),
  async (req, res) => {
    try {
      const { tendouong, soluong, price } = req.body
      const domain = 'http://localhost:8080'
      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : ''
      const douong = new DoUong({ tendouong, soluong, price, image })
      const madouong = 'DU' + douong._id.toString().slice(-4)
      douong.madouong = madouong
      await douong.save()
      res.json(douong)
    } catch (error) {
      console.error('đã xảy ra lỗi:', error)
      res.status(500).json({ error: 'Đã xảy ra lỗi' })
    }
  }
)

router.get('/getputdouong/:iddouong', async (req, res) => {
  try {
    const iddouong = req.params.iddouong
    const douong = await DoUong.findById(iddouong)
    res.json(douong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post(
  '/putdouong/:iddouong',
  uploads.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { tendouong, soluong, price } = req.body
      const iddouong = req.params.iddouong
      const domain = 'http://localhost:8080'

      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : ''
      const existingDoUong = await DoUong.findById(iddouong)

      const updatedDoUong = await DoUong.findByIdAndUpdate(
        iddouong,
        {
          tendouong,
          soluong,
          price,
          image: image || existingDoUong.image
        },
        { new: true }
      )

      res.json(updatedDoUong)
    } catch (error) {
      console.error('đã xảy ra lỗi:', error)
      res.status(500).json({ error: 'Đã xảy ra lỗi' })
    }
  }
)

router.post('/deletedouong/:iddouong', async (req, res) => {
  try {
    const iddouong = req.params.iddouong
    await DoUong.findByIdAndDelete(iddouong)
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
