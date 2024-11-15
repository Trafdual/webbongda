const User = require('../models/UserModel')
const router = require('express').Router()
const Booking = require('../models/BookingModels')
const SanBong = require('../models/SanBongModels')
const Ca = require('../models/CaModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const momenttimezone = require('moment-timezone')
const moment = require('moment')
const Hoadon = require('../models/HoaDonModels')
const LichSu = require('../models/LichSuModels')
const { response } = require('express')

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
    const loaisan = await LoaiSanBong.findOne({
      tenloaisan: loaisanbong
    }).populate('sanbong')
    const ngaydat = momenttimezone().toDate()
    const ca = await Ca.findById(idca)

    let selectedSan = null

    for (const san of loaisan.sanbong) {
      const existingBooking = await Booking.findOne({
        sanbong: san,
        ca: idca,
        ngayda: ngayda
      })

      if (!existingBooking) {
        selectedSan = san
        break
      }
    }

    if (!selectedSan) {
      return res.json({
        error: 'Không có sân nào trống cho ca và ngày đã chọn'
      })
    }

    const booking = new Booking({
      user: user._id,
      sanbong: selectedSan,
      loaisanbong: loaisan._id,
      ca: idca,
      ngayda: ngayda,
      ngaydat: ngaydat,
      tiencoc: (ca.giaca * soluongsan) / 2,
      soluongsan,
      sanbong: selectedSan._id
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

router.post('/datlichho/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const { loaisanbong, idca, ngayda, soluongsan } = req.body
    const user = await User.findById(iduser)
    const loaisan = await LoaiSanBong.findOne({
      tenloaisan: loaisanbong
    }).populate('sanbong')
    const ngaydat = momenttimezone().toDate()
    const ca = await Ca.findById(idca)

    let selectedSan = null

    for (const san of loaisan.sanbong) {
      const existingBooking = await Booking.findOne({
        sanbong: san,
        ca: idca,
        ngayda: ngayda
      })

      if (!existingBooking) {
        selectedSan = san
        break
      }
    }

    if (!selectedSan) {
      return res.json({
        error: 'Không có sân nào trống cho ca và ngày đã chọn'
      })
    }

    const booking = new Booking({
      user: user._id,
      sanbong: selectedSan,
      loaisanbong: loaisan._id,
      ca: idca,
      ngayda: ngayda,
      ngaydat: ngaydat,
      tiencoc: (ca.giaca * soluongsan) / 2,
      soluongsan,
      sanbong: selectedSan._id
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
      const ca = await Ca.findById(booking.ca)
      booking.tennguoidat = tennguoidat
      booking.phone = phone
      booking.coc = true
      tongcoc += booking.tiencoc || 0
      const hoadon = new Hoadon({
        booking: booking._id,
        tiencoc: booking.tiencoc,
        giasan: ca.giaca * booking.soluongsan,
        tongtien: booking.tiencoc,
        date: momenttimezone().toDate(),
        method: 'chuyển khoản'
      })
      const lichsu = new LichSu({
        hovaten: tennguoidat,
        sodienthoai: phone,
        method: 'chuyển khoản',
        ngaygio: momenttimezone().toDate(),
        noiDung: 'đặt cọc',
        tongtien:booking.tiencoc
      })
      lichsu.maGD = 'GD' + lichsu._id.toString().slice(-4)
      hoadon.mahd = 'HD' + hoadon._id.toString().slice(-4)
      await lichsu.save()
      await booking.save()
      await hoadon.save()
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

router.get('/getbookingdetails/:iduser/:date', async (req, res) => {
  try {
    const { iduser, date } = req.params
    const user = await User.findById(iduser)

    const dayStart = moment(date).startOf('day').toDate()
    const dayEnd = moment(date).endOf('day').toDate()

    const bookings = await Booking.find({
      user: user._id,
      ngayda: { $gte: dayStart, $lte: dayEnd }
    }).populate('ca loaisanbong')

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

router.post('/postcheckin/:idbooking', async (req, res) => {
  try {
    const idbooking = req.params.idbooking
    const booking = await Booking.findById(idbooking)
    booking.checkin = true
    await booking.save()
    res.json(booking)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getdacoc', async (req, res) => {
  try {
    const booking = await Booking.find().lean()
    const bookingjson = booking.filter(
      booking => booking.coc === true && booking.checkin === false
    )
    const bookingjson2 = await Promise.all(
      bookingjson.map(async booking => {
        const sanbong = await SanBong.findById(booking.sanbong)
        const loaisanbong = await LoaiSanBong.findById(booking.loaisanbong)
        const ca = await Ca.findById(booking.ca)
        return {
          _id: booking._id,
          hovaten: booking.tennguoidat,
          phone: booking.phone,
          sanbong: sanbong.tensan,
          loaisanbong: loaisanbong.tenloaisan,
          ca: ca.tenca,
          giaca: ca.giaca,
          begintime: moment(ca.begintime).format('HH:mm'),
          endtime: moment(ca.endtime).format('HH:mm'),
          ngayda: moment(booking.ngayda).format('DD-MM-YYYY'),
          ngaydat: booking.ngaydat
        }
      })
    )
    res.json(bookingjson2)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/checkin', async (req, res) => {
  try {
    const booking = await Booking.find().lean()
    const bookingjson = booking.filter(booking => booking.checkin === true)
    const bookingjson2 = await Promise.all(
      bookingjson.map(async booking => {
        const sanbong = await SanBong.findById(booking.sanbong)
        const loaisanbong = await LoaiSanBong.findById(booking.loaisanbong)
        const ca = await Ca.findById(booking.ca)
        return {
          _id: booking._id,
          hovaten: booking.tennguoidat,
          phone: booking.phone,
          sanbong: sanbong.tensan,
          loaisanbong: loaisanbong.tenloaisan,
          ca: ca.tenca,
          giaca: ca.giaca,
          begintime: moment(ca.begintime).format('HH:mm'),
          endtime: moment(ca.endtime).format('HH:mm'),
          ngayda: moment(booking.ngayda).format('DD-MM-YYYY'),
          ngaydat: booking.ngaydat
        }
      })
    )
    res.json(bookingjson2)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/huysan/:idbooking/:iduser', async (req, res) => {
  try {
    const idbooking = req.params.idbooking
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const booking = await Booking.findById(idbooking)
    user.booking = user.booking.filter(
      book => book._id.toString() !== booking._id.toString()
    )
    booking.huysan = true
    await Booking.findByIdAndDelete(idbooking)
    await user.save()
    res.json({ message: 'hủy sân thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
