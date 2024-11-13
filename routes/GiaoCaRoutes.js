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

    const giaocanew = new GiaoCa({
      timenhanca: momenttimezone.toDate(),
      nvhientai: idusergiaoca
    })
    usergiaoca.giaoca = giaocanew._id
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

    await giaoca.save()
    await giaocanew.save()
    await usergiaoca.save()

    res.json({
      giaoca
    })
  } catch (error) {
    res.status(500).json({ error: 'Có lỗi xảy ra' })
  }
})

module.exports = router
