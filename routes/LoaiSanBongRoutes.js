const router = require('express').Router()
const LoaiSanBong = require('../models/LoaiSanBongModels')
const SanBong = require('../models/SanBongModels')
router.get('/getloaisanbong', async (req, res) => {
  try {
    const loaisanbong = await LoaiSanBong.find().lean()
    res.json(loaisanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})
router.post('/postloaisanbong', async (req, res) => {
  try {
    const { tenloaisan } = req.body
    const loaisanbong = new LoaiSanBong({ tenloaisan })
    const maloaisan = 'LS' + loaisanbong._id.toString().slice(-4)
    loaisanbong.maloaisan = maloaisan
    await loaisanbong.save()
    res.json(loaisanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getputloaisanbong/:idloai', async (req, res) => {
  try {
    const idloai = req.params.idloai
    const loaisanbong = await LoaiSanBong.findById(idloai)
    res.json(loaisanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/putloaisanbong/:idloai', async (req, res) => {
  try {
    const idloai = req.params.idloai
    const { tenloaisan } = req.body
    const loaisanbong = await LoaiSanBong.findByIdAndUpdate(idloai, {
      tenloaisan: tenloaisan
    })
    res.json(loaisanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/deleteloaisanbong/:idloai', async (req, res) => {
  try {
    const idloai = req.params.idloai
    const loaisanbong = await LoaiSanBong.findById(idloai)
    await Promise.all(
      loaisanbong.sanbong.map(async sanbong => {
        await SanBong.findByIdAndDelete(sanbong._id)
      })
    )
    await LoaiSanBong.findByIdAndDelete(idloai)
    res.json({ message: 'xóa loại sân thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
