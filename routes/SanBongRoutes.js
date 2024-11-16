const router = require('express').Router()
const LoaiSanBong = require('../models/LoaiSanBongModels')
const SanBong = require('../models/SanBongModels')
const Ca = require('../models/CaModels')
const Booking = require('../models/BookingModels')
const moment = require('moment')
const momenttimezone = require('moment-timezone')

router.get('/getfullsan', async (req, res) => {
  try {
    const sanbong = await SanBong.find().lean()
    const sanbongjson = await Promise.all(
      sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id)
        const loaisan = await LoaiSanBong.findById(san1.loaisan)
        return {
          _id: san1._id,
          masan: san1.masan,
          tensan: san1.tensan,
          loaisan: loaisan.tenloaisan,
          maloai: loaisan.maloaisan,
          idloaisan: loaisan._id,
          trangthai: san1.trangthai
        }
      })
    )
    res.json(sanbongjson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getallsan', async (req, res) => {
  try {
    const sanbong = await SanBong.find().lean()
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/getsantheoloai', async (req, res) => {
  try {
    const { tenloaisan } = req.body
    const loaisanbong = await LoaiSanBong.findOne({ tenloaisan })
    const sanbong = await Promise.all(
      loaisanbong.sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id)
        return {
          _id: san1._id,
          masan: san1.masan,
          tensan: san1.tensan,
          loaisan: loaisanbong.tenloaisan,
          maloai: loaisanbong.maloaisan,
          idloaisan: loaisanbong._id,
          trangthai: san1.trangthai
        }
      })
    )
    res.json(sanbong)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getsantheoidloai/:idloai', async (req, res) => {
  try {
    const idloai = req.params.idloai
    const loaisanbong = await LoaiSanBong.findById(idloai)
    const sanbong = await Promise.all(
      loaisanbong.sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id)
        return {
          _id: san1._id,
          masan: san1.masan,
          tensan: san1.tensan,
          loaisan: loaisanbong.tenloaisan,
          maloai: loaisanbong.maloaisan,
          idloaisan: loaisanbong._id,
          trangthai: san1.trangthai
        }
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

router.put('/putsanbong/:idsanbong', async (req, res) => {
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
router.get('/getputsanbong/:id', async (req, res) => {
  try {
    const id = req.params.id
    const sanbong = await SanBong.findById(id)
    const loaisanbong = await LoaiSanBong.findById(sanbong.loaisan)
    const sanbongjson = {
      _id: sanbong._id,
      masan: sanbong.masan,
      tensan: sanbong.tensan,
      loaisan: loaisanbong.tenloaisan,
      maloai: loaisanbong.maloaisan,
      idloaisan: loaisanbong._id,
      trangthai: sanbong.trangthai
    }
    res.json(sanbongjson)
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

router.get('/getallsanbong', async (request, res) => {
  try {
    const sanbong = await SanBong.find().lean()
    const currentDate = new Date()
    const currentHours = currentDate.getHours()
    const currentMinutes = currentDate.getMinutes()
    const sanbongjson = await Promise.all(
      sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id).lean()
        const loaisan = await LoaiSanBong.findById(san1.loaisan).lean()

        const ca = await Promise.all(
          (
            await Ca.find().lean()
          ).map(async c => {
            const today = momenttimezone()
            const booking = await Booking.findOne({
              ca: c._id,
              sanbong: san1._id,
              ngayda: today.startOf('day').toDate()
            })
            const trangthai = () => {
              const enttimeHours = c.endtime.getHours()
              const enttimeMinutes = c.endtime.getMinutes()
              if (booking) {
                if (booking.coc === true && booking.checkin === false) {
                  return 'Chờ nhận sân'
                } else if (
                  booking.checkin === true &&
                  booking.thanhtoan === false
                ) {
                  return 'Đang hoạt động'
                }
                else if(booking.thanhtoan === true){
                  return 'Quá giờ'
                }
              } else {
                if (enttimeHours === 0) {
                  if (currentHours === 0 && currentMinutes < enttimeMinutes) {
                    return 'Đang trống'
                  } else {
                    return 'Đang trống'
                  }
                } else if (
                  enttimeHours < currentHours ||
                  (enttimeHours === currentHours &&
                    enttimeMinutes <= currentMinutes)
                ) {
                  return 'Quá giờ'
                } else {
                  return 'Đang trống'
                }
              }
            }
            return {
              _id: c._id,
              tenca: c.tenca,
              giaca: c.giaca,
              begintime: moment(c.begintime).format('HH:mm'),
              endtime: moment(c.endtime).format('HH:mm'),
              loaisan: loaisan ? loaisan.tenloaisan : null,
              trangthai: trangthai()
            }
          })
        )

        return {
          _id: san1._id,
          tensan: san1.tensan,
          ca: ca
        }
      })
    )
    res.json(sanbongjson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})
router.get('/getfiltersanbong', async (request, res) => {
  try {
    const sanbong = await SanBong.find().lean()
    const ngayda = request.query.ngayda
      ? new Date(request.query.ngayda)
      : new Date()
    const currentHours = ngayda.getHours()
    const currentMinutes = ngayda.getMinutes()

    const sanbongjson = await Promise.all(
      sanbong.map(async san => {
        const san1 = await SanBong.findById(san._id).lean()
        const loaisan = await LoaiSanBong.findById(san1.loaisan).lean()

        const ca = await Promise.all(
          (
            await Ca.find().lean()
          ).map(async c => {
            const booking = await Booking.findOne({
              ca: c._id,
              sanbong: san1._id,
              ngayda: moment(ngayda).startOf('day').toDate()
            })
            const trangthai = () => {
              const enttimeHours = c.endtime.getHours()
              const enttimeMinutes = c.endtime.getMinutes()
              if (booking) {
                if (booking.coc === true && booking.checkin === false) {
                  return 'Chờ nhận sân'
                } else if (
                  booking.checkin === true &&
                  booking.thanhtoan === false
                ) {
                  return 'Đang hoạt động'
                }
              } else {
                if (enttimeHours === 0) {
                  if (currentHours === 0 && currentMinutes < enttimeMinutes) {
                    return 'Đang trống'
                  } else {
                    return 'Đang trống'
                  }
                } else if (
                  enttimeHours < currentHours ||
                  (enttimeHours === currentHours &&
                    enttimeMinutes <= currentMinutes)
                ) {
                  return 'Quá giờ'
                } else {
                  return 'Đang trống'
                }
              }
            }
            return {
              _id: c._id,
              tenca: c.tenca,
              giaca: c.giaca,
              begintime: moment(c.begintime).format('HH:mm'),
              endtime: moment(c.endtime).format('HH:mm'),
              loaisan: loaisan ? loaisan.tenloaisan : null,
              trangthai: trangthai()
            }
          })
        )

        return {
          _id: san1._id,
          tensan: san1.tensan,
          ca: ca
        }
      })
    )
    res.json(sanbongjson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
