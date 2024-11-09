const router = require('express').Router()
const LoaiSanBong = require('../models/LoaiSanBongModels')
const SanBong = require('../models/SanBongModels')

router.get('/getfullsan', async (req, res) => {
  try {
    const sanbong = await SanBong.find().lean()
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getsantheoloai', async (req, res) => {
  try {
    const { tenloaisan } = req.body
    const loaisanbong = await LoaiSanBong.findOne({ tenloaisan })
    const sanbong = await Promise.all(
      loaisanbong.sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id)
        return san1
      })
    )
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/postsanbong', async (req, res) => {
  try {
    const { maloaisan, tensan, trangthai } = req.body
    const loaisanbong = await LoaiSanBong.findOne({ maloaisan })
    const sanbong = new SanBong({
      tensan,
      trangthai
    })
    loaisanbong.sanbong.push(sanbong._id)
    sanbong.masan = 'SB' + sanbong._id.toString().slice(-4)
    sanbong.loaisan = loaisanbong._id
    await sanbong.save()
    await loaisanbong.save()
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/putsanbong/:idsanbong', async (req, res) => {
  try {
    const idsanbong = req.params.idsanbong
    const { tensan, trangthai } = req.body
    const sanbong = await SanBong.findByIdAndUpdate(idsanbong, {
      tensan,
      trangthai
    })
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/deletesanbong/:idsanbong', async (req, res) => {
  try {
    const idsanbong = req.params.idsanbong
    const sanbong = await SanBong.findById(idsanbong)
    const loaisanbong = await LoaiSanBong.findById(sanbong.loaisan)
    loaisanbong.sanbong = loaisanbong.sanbong.filter(
      san => san._id.toString() !== sanbong._id.toString()
    )
    await SanBong.findByIdAndDelete(idsanbong)
    await loaisanbong.save()
    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})


module.exports = router
