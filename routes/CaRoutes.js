const router = require('express').Router()
const Ca = require('../models/CaModels')
const moment = require('moment')
const Booking = require('../models/BookingModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const SanBong = require('../models/SanBongModels')
const momenttimezone = require('moment-timezone')

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
    const bookings = await Booking.find({
      ngayda: momenttimezone().startOf('day').toDate()
    }).populate('ca')
    console.log(bookings)

    let soluongCaHoatDong = 0
    let soluongCaChoNhanSan = 0
    let soluongCaQuaGio = 0
    let soluongCaTrong1 = 0
    let soluongCaTong = 0
    let soluongcaTrongTong = 0

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
            soluongCaTrong1++
          } else {
            soluongCaTrong1++
          }
        } else if (
          caEndHours < currentHours ||
          (caEndHours === currentHours && caEndMinutes <= currentMinutes)
        ) {
          soluongCaQuaGio++
        } else {
          soluongCaTrong1++
        }
      })

      soluongCaHoatDong += bookingSan.filter(booking => {
        return booking.checkin && booking.thanhtoan === false
      }).length

      soluongCaChoNhanSan += bookingSan.filter(booking => {
        return booking.coc === true && booking.checkin === false
      }).length
    }

    soluongcaTrongTong = soluongCaTrong1 - soluongCaHoatDong
    soluongCaTong =
      soluongcaTrongTong +
      soluongCaHoatDong +
      soluongCaQuaGio +
      soluongCaChoNhanSan

    res.json({
      soluongCaHoatDong,
      soluongCaChoNhanSan,
      soluongCaQuaGio,
      soluongcaTrongTong,
      soluongCaTong
    })
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/santrong', async (req, res) => {
  try {
    const ngayDa = momenttimezone()
    const sanList = await SanBong.find()
    const currentTime = new Date()
    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    const bookings = await Booking.find({
      ngayda: ngayDa.startOf('day').toDate()
    }).populate('ca')

    const danhSachCaTrongCuaSan = []

    for (const san of sanList) {
      const bookingSan = bookings.filter(booking =>
        booking.sanbong.equals(san._id)
      )

      const caDaDatIds = bookingSan.map(booking => booking.ca._id.toString())

      const caTrong = await Ca.find({ _id: { $nin: caDaDatIds } })

      const danhSachCaTrong = []

      caTrong.forEach(async ca => {
        const caEndHours = ca.endtime.getHours()
        const caEndMinutes = ca.endtime.getMinutes()

        if (caEndHours === 0) {
          if (currentHours === 0 && currentMinutes < caEndMinutes) {
            danhSachCaTrong.push({
              _id: ca._id,
              tenca: ca.tenca,
              giaca: ca.giaca,
              begintime: moment(ca.begintime).format('HH:mm'),
              endtime: moment(ca.endtime).format('HH:mm'),
              trangthai: 'Đang trống'
            })
          } else {
            danhSachCaTrong.push({
              _id: ca._id,
              tenca: ca.tenca,
              giaca: ca.giaca,
              begintime: moment(ca.begintime).format('HH:mm'),
              endtime: moment(ca.endtime).format('HH:mm'),
              trangthai: 'Đang trống'
            })
          }
        } else if (
          caEndHours < currentHours ||
          (caEndHours === currentHours && caEndMinutes <= currentMinutes)
        ) {
          return
        } else {
          danhSachCaTrong.push({
            _id: ca._id,
            tenca: ca.tenca,
            giaca: ca.giaca,
            begintime: moment(ca.begintime).format('HH:mm'),
            endtime: moment(ca.endtime).format('HH:mm'),
            trangthai: 'Đang trống'
          })
        }
      })
      if (danhSachCaTrong.length > 0) {
        danhSachCaTrongCuaSan.push({
          _id: san._id,
          tensan: san.tensan,
          ca: danhSachCaTrong
        })
      }
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
          danhSachcaQuaGio.push({
            _id: ca._id,
            tenca: ca.tenca,
            giaca: ca.giaca,
            begintime: moment(ca.begintime).format('HH:mm'),
            endtime: moment(ca.endtime).format('HH:mm'),
            trangthai: 'Quá giờ'
          })
        } else {
          return
        }
      })

      danhSachcaQuaGioCuaSan.push({
        _id: san._id,
        tensan: san.tensan,
        ca: danhSachcaQuaGio
      })
    }

    res.json(danhSachcaQuaGioCuaSan)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/chonhansan', async (req, res) => {
  try {
    const ngayDa = momenttimezone().startOf('day').toDate()
    const sanList = await SanBong.find()

    const bookings = await Booking.find({
      ngayda: ngayDa,
      coc: true,
      checkin: false
    }).populate('ca')

    const danhSachChoNhanSan = []

    for (const san of sanList) {
      const bookingSan = bookings.filter(booking =>
        booking.sanbong.equals(san._id)
      )

      const danhSachCaChoNhanSan = bookingSan.map(booking => ({
        _id: booking.ca._id,
        tenca: booking.ca.tenca,
        giaca: booking.ca.giaca,
        begintime: moment(booking.ca.begintime).format('HH:mm'),
        endtime: moment(booking.ca.endtime).format('HH:mm'),
        trangthai: 'Chờ nhận sân'
      }))

      if (danhSachCaChoNhanSan.length > 0) {
        danhSachChoNhanSan.push({
          _id: san._id,
          tensan: san.tensan,
          ca: danhSachCaChoNhanSan
        })
      }
    }

    res.json(danhSachChoNhanSan)
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})


module.exports = router
