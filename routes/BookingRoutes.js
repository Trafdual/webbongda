const User = require('../models/UserModel')
const router = require('express').Router()
const Booking = require('../models/BookingModels')
const SanBong = require('../models/SanBongModels')
const Ca = require('../models/CaModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const momenttimezone = require('moment-timezone')

router.get('/getbooking/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const booking = await Promise.all(
      user.booking.map(async book => {
        const booking1 = await Booking.findById(book._id)
        const ca = await Ca.findById(booking1.ca)
        const loaisanbong = await LoaiSanBong.findById(booking1.loaisanbong)
        return {
          _id: booking1._id,
          user: user._id,
          loaisanbong: loaisanbong.tenloaisan,
          ca: ca.tenca,
          ngayda: booking1.ngayda,
          ngaydat: booking1.ngaydat,
          tiencoc: booking1.tiencoc,
          coc: booking1.coc,
          checkin: booking1.checkin,
          thanhtoan: booking1.thanhtoan
        }
      })
    )
    res.json(booking)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/datlichsan/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const { loaisanbong, idca, ngayda, soluongsan } = req.body
    const user = await User.findById(iduser)
    const loaisan = await LoaiSanBong.findOne({ tenloaisan: loaisanbong })
    const ngaydat = momenttimezone().toDate()
    const ca = await Ca.findById(idca)
    const booking = new Booking({
      user: user._id,
      loaisanbong: loaisan._id,
      ca: idca,
      ngayda: ngayda,
      ngaydat: ngaydat,
      tiencoc: (ca.giaca * soluongsan) / 2,
      soluongsan
    })
    await booking.save()
    user.booking.push(booking._id)
    await user.save()
    res.json(booking)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
