const router = require('express').Router()
const DoThue = require('../models/DoThueModels')
const uploads = require('./uploads')

router.get('/getdothue', async (req, res) => {
  try {
    const dothue = await DoThue.find().lean()
    res.json(dothue)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getputdothue/:iddothue', async (req, res) => {
  try {
    const iddothue = req.params.iddothue
    const dothue = await DoThue.findById(iddothue)
    res.json(dothue)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post(
  '/postdothue',
  uploads.fields([
    { name: 'image', maxCount: 1 } // Một ảnh duy nhất
  ]),
  async (req, res) => {
    try {
      const { tendothue, soluong, price } = req.body
      const domain = 'http://localhost:8080'
      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : ''
      const dothue = new DoThue({ tendothue, soluong, price, image })
      const madothue = 'DT' + dothue._id.toString().slice(-4)
      dothue.madothue = madothue
      await dothue.save()
      res.json(dothue)
    } catch (error) {
      console.error('đã xảy ra lỗi:', error)
      res.status(500).json({ error: 'Đã xảy ra lỗi' })
    }
  }
)

router.post(
  '/putdothue/:iddothue',
  uploads.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { tendothue, soluong, price } = req.body
      const iddothue = req.params.iddothue
      const domain = 'http://localhost:8080'

      const image = req.files['image']
        ? `${domain}/${req.files['image'][0].filename}`
        : ''
      const existingDoThue = await DoThue.findById(iddothue)

      const updatedDoThue = await DoThue.findByIdAndUpdate(
        iddothue,
        {
          tendothue,
          soluong,
          price,
          image: image || existingDoThue.image
        },
        { new: true }
      )

      res.json(updatedDoThue)
    } catch (error) {
      console.error('đã xảy ra lỗi:', error)
      res.status(500).json({ error: 'Đã xảy ra lỗi' })
    }
  }
)

router.post('/deletedothue/:iddothue', async (req, res) => {
  try {
    const iddothue = req.params.iddothue
    await DoThue.findByIdAndDelete(iddothue)
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
