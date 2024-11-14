const router = require('express').Router()
const Ca = require('../models/CaModels')
const moment = require('moment')
const Booking = require('../models/BookingModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const SanBong = require('../models/SanBongModels')

router.get('/getCa', async (req, res) => {
  try {
    const ca = await Ca.find().lean()
    res.json(ca)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getCatest/:tenloaisan', async (req, res) => {
  try {
    const tenloaisan = req.params.tenloaisan
    const ca = await Ca.find().lean() // Lấy danh sách ca
    const cajson = await Promise.all(
      ca.map(async c => {
        const ca1 = await Ca.findById(c._id) // Tìm lại ca theo _id
        const loaisan = await LoaiSanBong.findOne({
          tenloaisan: tenloaisan
        })
        const ngayda = moment(req.query.ngayda).startOf('day').toDate()

        // Lấy số lượng sân đã được đặt cho ca và ngày đó
        const bookingsForCaOnDate = await Booking.find({
          loaisanbong: loaisan._id,
          ca: c._id,
          ngayda: ngayda
        })

        // Tính số lượng sân đã được đặt
        const bookedSanCount = bookingsForCaOnDate.reduce(
          (acc, booking) => acc + booking.soluongsan,
          0
        )

        const availableSanCount = loaisan.sanbong.length - bookedSanCount
        return {
          _id: ca1._id,
          tenca: ca1.tenca,
          giaca: ca1.giaca,
          begintime: moment(c.begintime).format('HH:mm'),
          endtime: moment(c.endtime).format('HH:mm'),
          trangthai: ca1.trangthai,
          availableSanCount: availableSanCount
        }
      })
    )
    res.json(cajson)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
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

router.get('/soluongsan', async (req, res) => {
  try {
    const ngayDa = new Date()
    const sanList = await SanBong.find()
    const currentTime = new Date()
    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    const bookings = await Booking.find({ ngayda: ngayDa }).populate('ca')

    let soluongCaHoatDong = 0
    let soluongCaChoNhanSan = 0
    let soluongCaQuaGio = 0
    let soluongCaTrong = 0
    let soluongCaTong = 0

    for (const san of sanList) {
      const bookingSan = bookings.filter(booking =>
        booking.sanbong.equals(san._id)
      )

      const caDaDatIds = bookingSan.map(booking => booking.ca._id.toString())

      const caTrong = await Ca.find({ _id: { $nin: caDaDatIds } })

      caTrong.forEach(ca => {
        const caEndHours = ca.endtime.getHours()
        const caEndMinutes = ca.endtime.getMinutes()

        if (caEndHours === 0) {
          if (currentHours === 0 && currentMinutes < caEndMinutes) {
            // Nếu giờ hiện tại là 0h và phút hiện tại chưa qua phút kết thúc của ca 0h, thì ca vẫn trống
            soluongCaTrong++
          } else {
            // Sau 0h, ca đó sẽ được tính là ca trống
            soluongCaTrong++
          }
        } else if (
          caEndHours < currentHours ||
          (caEndHours === currentHours && caEndMinutes <= currentMinutes)
        ) {
          soluongCaQuaGio++ // Ca đã qua giờ
        } else {
          soluongCaTrong++ // Ca chưa qua giờ và chưa được đặt
        }
        soluongCaTong++
      })

      // Tính các ca đã đặt và còn hoạt động
      soluongCaHoatDong += bookingSan.filter(booking => {
        const caEndTime = new Date(booking.ca.endtime)
        const caEndHours = caEndTime.getHours()
        const caEndMinutes = caEndTime.getMinutes()

        return (
          booking.checkin &&
          (caEndHours > currentHours ||
            (caEndHours === currentHours && caEndMinutes > currentMinutes) ||
            (caEndHours === 0 && currentHours !== 23)) // Ca còn hoạt động
        )
      }).length

      soluongCaChoNhanSan += bookingSan.filter(booking => {
        const caEndTime = new Date(booking.ca.endtime)
        const caEndHours = caEndTime.getHours()
        const caEndMinutes = caEndTime.getMinutes()

        return (
          booking.coc === true &&
          booking.checkin === false &&
          (caEndHours > currentHours ||
            (caEndHours === currentHours && caEndMinutes > currentMinutes) ||
            (caEndHours === 0 && currentHours !== 23))
        )
      }).length
    }

    // Trả về tổng số ca cho tất cả các sân
    res.json({
      soluongCaHoatDong,
      soluongCaChoNhanSan,
      soluongCaQuaGio,
      soluongCaTrong,
      soluongCaTong
    })
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/santrong', async (req, res) => {
  try {
    const ngayDa = new Date()
    const sanList = await SanBong.find()
    const currentTime = new Date()
    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    const bookings = await Booking.find({ ngayda: ngayDa }).populate('ca')

    const danhSachCaTrongCuaSan = []

    for (const san of sanList) {
      const bookingSan = bookings.filter(booking =>
        booking.sanbong.equals(san._id)
      )

      const caDaDatIds = bookingSan.map(booking => booking.ca._id.toString())

      const caTrong = await Ca.find({ _id: { $nin: caDaDatIds } })

      const danhSachCaTrong = []

      caTrong.forEach(ca => {
        const caEndHours = ca.endtime.getHours()
        const caEndMinutes = ca.endtime.getMinutes()

        if (caEndHours === 0) {
          if (currentHours === 0 && currentMinutes < caEndMinutes) {
            danhSachCaTrong.push(ca)
          } else {
            danhSachCaTrong.push(ca)
          }
        } else if (
          caEndHours < currentHours ||
          (caEndHours === currentHours && caEndMinutes <= currentMinutes)
        ) {
          return
        } else {
          danhSachCaTrong.push(ca)
        }
      })

      danhSachCaTrongCuaSan.push({
        san: san._id,
        caTrong: danhSachCaTrong
      })
    }

    res.json(danhSachCaTrongCuaSan)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/sanquagio', async (req, res) => {
  try {
    const ngayDa = new Date()
    const sanList = await SanBong.find()
    const currentTime = new Date()
    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    const bookings = await Booking.find({ ngayda: ngayDa }).populate('ca')

    const danhSachcaQuaGioCuaSan = []

    for (const san of sanList) {
      const bookingSan = bookings.filter(booking =>
        booking.sanbong.equals(san._id)
      )

      const caDaDatIds = bookingSan.map(booking => booking.ca._id.toString())

      const caQuaGio = await Ca.find({ _id: { $nin: caDaDatIds } })

      const danhSachcaQuaGio = []

      caQuaGio.forEach(ca => {
        const caEndHours = ca.endtime.getHours()
        const caEndMinutes = ca.endtime.getMinutes()

        if (caEndHours === 0) {
          if (currentHours === 0 && currentMinutes < caEndMinutes) {
            return
          } else {
            return
          }
        } else if (
          caEndHours < currentHours ||
          (caEndHours === currentHours && caEndMinutes <= currentMinutes)
        ) {
          danhSachcaQuaGio.push(ca)
        } else {
          return
        }
      })

      danhSachcaQuaGioCuaSan.push({
        san: san._id,
        caQuaGio: danhSachcaQuaGio
      })
    }

    res.json(danhSachcaQuaGioCuaSan)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
