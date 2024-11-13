const router = require('express').Router()
const HoaDon = require('../models/HoaDonModels')
const Booking = require('../models/BookingModels')
const SanBong = require('../models/SanBongModels')
const Ca = require('../models/CaModels')
const LoaiSanBong = require('../models/LoaiSanBongModels')
const DoThue = require('../models/DoThueModels')
const DoUong = require('../models/DoUongModels')
const moment = require('moment')


router.get('/gethoadon', async (req, res) => {
  try {
    const hoadon = await HoaDon.find().lean()
    const hoadonjson = await Promise.all(
      hoadon.map(async hd => {
        const booking = await Booking.findById(hd.booking)
        const sanbong = await SanBong.findById(booking.sanbong)
        const loaisanbong = await LoaiSanBong.findById(booking.loaisanbong)
        const ca = await Ca.findById(booking.ca)

        const bookingjson = {
          _id: booking._id,
          hovaten: booking.tennguoidat,
          phone: booking.phone,
          sanbong: sanbong.tensanbong,
          loaisanbong: loaisanbong.tenloaisan,
          ca: ca.tenca,
          giaca: ca.giaca,
          begintime: moment(ca.begintime).format('HH:mm'),
          endtime: moment(ca.endtime).format('HH:mm'),
          ngayda: moment(booking.ngayda).format('DD-MM-YYYY'),
          ngaydat: booking.ngaydat
        }
        const dothue = await Promise.all(
          hd.dothue.map(async dt => {
            const dt1 = await DoThue.findById(dt.iddothue)
            return {
              _id: dt1._id,
              tendothue: dt1.tendothue,
              image: dt1.image,
              soluong: dt.soluong,
              thanhtien: dt.tien
            }
          })
        )
        const douong = await Promise.all(
          hd.douong.map(async du => {
            const du1 = await DoUong.findById(du.iddouong)
            return {
              _id: du1._id,
              tendouong: du1.tendouong,
              image: du1.image,
              soluong: du.soluong,
              thanhtien: du.tien
            }
          })
        )

        return {
          idhoadon: hd._id,
          mahd: hd.mahd,
          booking: bookingjson,
          dothue: dothue,
          douong: douong,
          tongtien: hd.tongtien
        }
      })
    )
    res.json(hoadonjson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
