const router = require('express').Router()
const GiaoCa = require('../models/GiaoCaModels')
const User = require('../models/UserModel')
const HoaDon = require('../models/HoaDonModels')
const momenttimezone = require('moment-timezone')

router.post('/giaoca/:idusser', async (req, res) => {
  try {
    const iduser = req.params.idusser
    const { tienbandau, idusergiaoca, tienphatsinh } = req.body
    const user = await User.findById(iduser)
    const usergiaoca = await User.findById(idusergiaoca)
    const giaoca = await GiaoCa.findById(user.giaoca)
    const shiftStartTime = giaoca.timenhanca
    const currentDateTime = new Date()

    const hoadons = await HoaDon.find({
      date: { $gte: shiftStartTime, $lte: currentDateTime },
      thanhtoan: true
    })
    const totalTienMat = hoadons.reduce((total, hoadon) => {
      if (hoadon.method === 'tiền mặt') {
        return total + hoadon.tongtien
      }
      return total
    }, 0)

    const totalChuyenKhoan = hoadons.reduce((total, hoadon) => {
      if (hoadon.method === 'chuyển khoản') {
        return total + hoadon.tongtien
      }
      return total
    }, 0)

    const hoandondatt = hoadons.length
    const hoandonchuatt = await HoaDon.countDocuments({
      date: { $gte: shiftStartTime, $lte: currentDateTime },
      thanhtoan: false
    })

    giaoca.tongtientttienmat = totalTienMat
    giaoca.tongtientttienmat = totalChuyenKhoan
    giaoca.hoadonthanhtoan = hoandondatt
    giaoca.hoadonchuathanhtoan = hoandonchuatt
    giaoca.tienbandau = tienbandau
    giaoca.tienphatsinh = tienphatsinh
    giaoca.nvtuonglai = idusergiaoca
    giaoca.timegiaoca = momenttimezone.toDate()
    usergiaoca.giaoca = giaoca._id
    await giaoca.save()
    res.json({
      giaoca
    })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getgiaoca/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const giaoca = await GiaoCa.findById(user.giaoca)

    const shiftStartTime = giaoca.timenhanca
    const currentDateTime = new Date()

    const hoadons = await HoaDon.find({
      date: { $gte: shiftStartTime, $lte: currentDateTime },
      thanhtoan: true
    })
    const totalTienMat = hoadons.reduce((total, hoadon) => {
      if (hoadon.method === 'tiền mặt') {
        return total + hoadon.tongtien
      }
      return total
    }, 0)

    const totalChuyenKhoan = hoadons.reduce((total, hoadon) => {
      if (hoadon.method === 'chuyển khoản') {
        return total + hoadon.tongtien
      }
      return total
    }, 0)

    const hoandondatt = hoadons.length
    const hoandonchuatt = await HoaDon.countDocuments({
      date: { $gte: shiftStartTime, $lte: currentDateTime },
      thanhtoan: false
    })

    const giaocajson = {
      _id: giaoca._id,
      nvhientai: user.hovaten,
      phone: user.phone,
      timenhanca: giaoca.timenhanca,
      hoadonthanhtoan: hoandondatt,
      hoadonchuathanhtoan: hoandonchuatt,
      tongtientttienmat: totalTienMat,
      tongtienttchuyenkhoan: totalChuyenKhoan
    }

    res.json(giaocajson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/nhanca/:iduser', async (req, res) => {
  try {
    const iduser = req.params.iduser
    const user = await User.findById(iduser)
    const giaoca1 = await GiaoCa.findById(user.giaoca)
    const tienbandau =
      giaoca1.tienbandau +
      giaoca1.tongtientttienmat +
      giaoca1.tongtienttchuyenkhoan -
      giaoca1.tienphatsinh
    const giaoca = new GiaoCa({
      timenhanca: momenttimezone.toDate(),
      nvhientai: user._id,
      tienbandau: tienbandau
    })
    user.giaoca = giaoca._id
    await giaoca.save()
    await user.save()
    res.json(giaoca)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getfullgiaoca', async (req, res) => {
  try {
    const giaoca = await GiaoCa.find().lean()
    const giaocajson = await Promise.all(
      giaoca.map(async giaoca1 => {
        const user = await User.findById(giaoca1.nvhientai)
        const user1 = await User.findById(giaoca1.nvtuonglai)
        return {
          _id: giaoca1._id,
          nvhientai: user.hovaten,
          phonehientai: user.phone,
          nvtuonglai: user1.hovaten,
          phonetuonglai: user1.phone,
          timenhanca: giaoca1.timenhanca,
          timegiaoca: giaoca1.timegiaoca,
          hoadonthanhtoan: giaoca1.hoadonthanhtoan,
          hoadonchuathanhtoan: giaoca1.hoadonchuathanhtoan,
          tienbandau: giaoca1.tienbandau,
          tienphatsinh: giaoca1.tienphatsinh,
          tongtientttienmat: giaoca1.tongtientttienmat,
          tongtienttchuyenkhoan: giaoca1.tongtienttchuyenkhoan
        }
      })
    )
    res.json(giaocajson)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router