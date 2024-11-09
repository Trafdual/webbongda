const router = require('express').Router()
const User = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

router.post('/register', async (req, res) => {
  try {
    const { hovaten, password, role, phone, email } = req.body

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
      password: hashedPassword,
      role,
      phone,
      email
    })
    await user.save()
    res.status(201).json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})


router.post('/repass/:userId', async (req, res) => {
  try {
    const { passOld, passNew } = req.body
    const userId = req.params.userId
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

router.post('/rename/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const { username } = req.body
    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    )
    if (!user) {
      res.status(403).json({ message: 'không tìm thấy user' })
    }
    res.status(200).json({ message: 'đổi tên thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi tên' })
  }
})


router.post('/quenmk', async (req, res) => {
  try {
    const { phone, passNew, username } = req.body
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }
    const usernam = await User.findOne({ username: username })

    if (!usernam) {
      return res.status(403).json({ message: 'Không tìm thấy username' })
    }

    const user = await User.findOne({ phone: phone })

    if (!user || user.phone === null) {
      return res.status(403).json({ message: 'Không tìm thấy tài khoản' })
    }

    const hashedPassword = await bcrypt.hash(passNew, 10)
    user.password = hashedPassword
    await user.save()

    res.status(200).json({ message: 'Mật khẩu đã được cập nhật' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})

router.post('/doiavatar/:userId', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.userId
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

    return res.status(200).json({ message: 'Đổi avatar thành công.' })
  } catch (error) {
    console.error('Lỗi khi đổi avatar:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi avatar.' })
  }
})

module.exports = router
