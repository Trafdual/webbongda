const router = require('express').Router()
const User = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const momenttimezone = require('moment-timezone')
const GiaoCa = require('../models/GiaoCaModels')

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

router.post('/registerweb', async (req, res) => {
  try {
    const { hovaten, email, password, role, phone } = req.body

    // Kiểm tra số điện thoại
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }
    const exitphone = await User.findOne({ phone })
    if (exitphone) {
      return res.status(400).json({ message: 'số điện thoại đã được đăng kí' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'email đã được đăng ký' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      hovaten,
      email,
      password: hashedPassword,
      role,
      phone
    })
    await user.save()
    res.render('successadmin', { message: `Thêm ${user.role} thành công ` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})

router.post('/loginfull', async (req, res) => {
  try {
    const { email, password, role } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      res.json({ message: 'email không chính xác' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      res.json({ message: 'nhập sai mật khẩu' })
    }

    if (user.role !== role) {
      res.json({ message: 'bạn không có quyền truy cập trang web' })
    } else {
      if (user.role === 'staff') {
        const today = momenttimezone()
        const startOfDay = today.startOf('day').toDate()
        const endOfDay = today.endOf('day').toDate()

        const giaoca = await GiaoCa.find({
          timenhanca: { $gte: startOfDay, $lt: endOfDay }
        })
        if (giaoca.length > 0) {
          if (user.giaoca) {
            const giao = await GiaoCa.findById(user.giaoca)
            res.json({ user, nhanca: giao.nhanca })
          } else {
            res.json({ message: 'chưa đến ca của bạn' })
          }
        } else {
          res.json({ user })
        }
      } else {
        res.json({ user })
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})


router.get('/getnhanvien', async (req, res) => {
  try {
    const user = await User.find().lean()
    const userjson = user.filter(u => u.role === 'staff')
    const userjson2 = userjson.map(user => {
      const trangthai = () => {
        if (user.giaoca === null || user.giaoca === undefined) {
          return 'không trong ca'
        } else {
          return 'đang trong ca'
        }
      }
      return {
        _id: user._id,
        hovaten: user.hovaten,
        phone: user.phone,
        email: user.email,
        password: user.password,
        role: user.role,
        hoadon: user.hoadon,
        booking: user.booking,
        trangthai: trangthai()
      }
    })
    res.json(userjson2)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})

router.post('/userput/:id', async (req, res) => {
  try {
    const userId = req.params.id
    const { username, password, role, phone } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }

    const user = await User.findByIdAndUpdate(userId, {
      username,
      password: hashedPassword,
      role,
      phone: phone.toString()
    })

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user.' })
    }

    res.json(user)
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật user.' })
  }
})

router.post('/userputweb/:id', async (req, res) => {
  try {
    const userId = req.params.id
    const { username, role, phone } = req.body
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        role,
        phone: phone.toString()
      },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user.' })
    }

    res.render('successadmin', {
      message: `sửa thông tin ${user.role} thành công `
    })
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật user.' })
  }
})

router.post('/doiavatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.session.userId
    const user = await User.findById(userId)
    if (!user) {
      res.status(403).json({ message: 'không tìm thấy user' })
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một file ảnh.' })
    }

    const avatar = req.file.buffer.toString('base64')
    user.avatar = avatar
    await user.save()
    if (user.role === 'nhomdich') {
      return res.render('nhomdich', { user })
    }
    if (user.role === 'admin') {
      return res.render('admin', { user })
    }
  } catch (error) {
    console.error('Lỗi khi đổi avatar:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi avatar.' })
  }
})

router.post('/repass', async (req, res) => {
  try {
    const { passOld, passNew } = req.body
    const userId = req.session.userId
    const user = await User.findById(userId)
    const hashedPassword = await bcrypt.hash(passNew, 10)
    if (!user) {
      res.status(403).json({ message: 'không tìm thấy user' })
    }
    const isPasswordMatch = await bcrypt.compare(passOld, user.password)

    if (!isPasswordMatch) {
      return res.status(403).json({ message: 'Mật khẩu cũ của bạn không đúng' })
    }
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi mật khẩu' })
  }
})

router.post('/rename', async (req, res) => {
  try {
    const userId = req.session.userId
    const { username } = req.body
    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    )
    if (!user) {
      res.status(403).json({ message: 'không tìm thấy user' })
    }
    if (user.role === 'nhomdich') {
      res.render('nhomdich', { user })
    } else {
      res.render('admin', { user })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi tên' })
  }
})

module.exports = router
