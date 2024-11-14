const router = require('express').Router()
const DoUong = require('../models/DoUongModels')
const uploads = require('./uploads')
const Hoadon = require('../models/HoaDonModels')

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

router.post('/bandouong/:iddouong/:idhoadon', async (req, res) => {
  try {
    const iddouong = req.params.iddouong
    const idhoadon = req.params.idhoadon
    const { soluong } = req.body
    const douong = await DoUong.findById(iddouong)
    const hoadon = await Hoadon.findById(idhoadon)
    hoadon.douong.push({
      iddouong: douong._id,
      soluong: soluong,
      tien: douong.price * soluong
    })
    douong.soluong = douong.soluong - soluong

    const tongTienDothue = hoadon.dothue.reduce(
      (sum, item) => sum + item.tien,
      0
    )
    const tongTienDouong = hoadon.douong.reduce(
      (sum, item) => sum + item.tien,
      0
    )

    hoadon.tongtien =
      hoadon.giasan - hoadon.tiencoc + tongTienDothue + tongTienDouong

    await douong.save()
    await hoadon.save()
    res.json(douong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/xoadouonghoadon/:iddouong/:idhoadon', async (req, res) => {
  try {
    const idhoadon = req.params.idhoadon
    const iddouong = req.params.iddouong
    const hoadon = await Hoadon.findById(idhoadon)
    const douong = await DoUong.findById(iddouong)

    const itemToRemove = hoadon.douong.find(
      item => item.iddouong.toString() === iddouong.toString()
    )

    if (!itemToRemove) {
      return res.json({ error: 'Không tìm thấy đồ uống trong hóa đơn' })
    }

    douong.soluong += itemToRemove.soluong
    await douong.save()

    hoadon.douong = hoadon.douong.filter(
      item => item.iddouong.toString() !== iddouong.toString()
    )

    const tongTienDothue = hoadon.dothue.reduce(
      (sum, item) => sum + item.tien,
      0
    )
    const tongTienDouong = hoadon.douong.reduce(
      (sum, item) => sum + item.tien,
      0
    )

    hoadon.tongtien =
      hoadon.giasan - hoadon.tiencoc + tongTienDothue + tongTienDouong

    await hoadon.save()
    res.json({
      message:
        'Xóa đồ uống khỏi hóa đơn thành công và cập nhật số lượng đồ uống'
    })
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
