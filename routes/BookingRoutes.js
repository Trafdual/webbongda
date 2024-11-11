const User = require('../models/UserModel')
const router = require('express').Router()
const Booking = require('../models/BookingModels')
const SanBong = require('../models/SanBongModels')
const Ca = require('../models/CaModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const momenttimezone = require('moment-timezone')
const moment = require('moment')

router.get('/getbooking/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const booking = await Promise.all(
      user.booking.map(async book => {
        const booking1 = await Booking.findById(book._id)
        const ca = await Ca.findById(booking1.ca)
        const loaisanbong = await LoaiSanBong.findById(booking1.loaisanbong)
        if (booking1.coc === false) {
          return {
            _id: booking1._id,
            user: user._id,
            loaisanbong: loaisanbong.tenloaisan,
            ca: ca.tenca,
            giaca: ca.giaca * booking1.soluongsan,
            begintime: moment(ca.begintime).format('HH:mm'),
            endtime: moment(ca.endtime).format('HH:mm'),
            ngayda: moment(booking1.ngayda).format('DD-MM-YYYY'),
            ngaydat: booking1.ngaydat,
            tiencoc: booking1.tiencoc,
            coc: booking1.coc,
            checkin: booking1.checkin,
            thanhtoan: booking1.thanhtoan,
            soluongsan: booking1.soluongsan
          }
        }
      })
    )
    const filteredBooking = booking.filter(Boolean)
    res.json(filteredBooking)
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

router.post('/datcocsan', async (req, res) => {
  try {
    const { tennguoidat, phone, idbookings } = req.body
    let tongcoc = 0

    for (const idbooking of idbookings) {
      const booking = await Booking.findById(idbooking)
      booking.tennguoidat = tennguoidat
      booking.phone = phone
      booking.coc = true
      tongcoc += booking.tiencoc || 0
      await booking.save()
    }
    res.json({ tongcoc })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/deletebooking/:idbooking/:iduser', async (req, res) => {
  try {
    const idbooking = req.params.idbooking
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const booking = await Booking.findById(idbooking)
    user.booking = user.booking.filter(
      book => book._id.toString() !== booking._id.toString()
    )
    await user.save()
    await Booking.findByIdAndDelete(idbooking)
    res.json({ message: 'xóa thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getbookingdays/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const bookings = await Booking.find({ user: iduser }).populate('ca')
    const bookingDays = bookings.map(booking => {
      return moment(booking.ngayda).startOf('day').toDate()
    })

    res.json(bookingDays)
  } catch (error) {
    console.error('Lỗi khi lấy ngày ca đặt:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

// api/bookingRoutes.js
router.get('/getbookingdetails/:iduser/:date', async (req, res) => {
  try {
    const { iduser, date } = req.params
    const user = await User.findById(iduser)

    // Chuyển đổi string date thành ngày thực tế
    const dayStart = moment(date).startOf('day').toDate()
    const dayEnd = moment(date).endOf('day').toDate()

    // Tìm tất cả các booking của người dùng trong ngày
    const bookings = await Booking.find({
      user: user._id,
      ngayda: { $gte: dayStart, $lte: dayEnd }
    }).populate('ca loaisanbong') // Giả sử bạn muốn lấy thông tin ca và loại sân

    const bookingDetails = await Promise.all(
      bookings.map(async booking => {
        const ca = await Ca.findById(booking.ca)
        return {
          _id: booking._id,
          ca: ca.tenca,
          begintime: moment(ca.begintime).format('HH:mm'),
          endtime: moment(ca.endtime).format('HH:mm'),
          loaisanbong: booking.loaisanbong.tenloaisan,
          giaca: ca.giaca * booking.soluongsan,
          soluongsan: booking.soluongsan,
          tiencoc: booking.tiencoc,
          coc: booking.coc,
          checkin: booking.checkin,
          thanhtoan: booking.thanhtoan
        }
      })
    )

    res.json(bookingDetails)
  } catch (error) {
    console.error('Lỗi khi lấy thông tin ca đặt:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
