const router = require('express').Router()
const User = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const Manga = require('../models/MangaModel')
const Payment = require('../models/PaymentModel')
const Baiviet = require('../models/BaiVietModel')

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

router.post('/loginadmin', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.render('dangkydangnhap/loginadmin.hbs', {
        UserError: 'Email không đúng'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.render('dangkydangnhap/loginadmin.hbs', {
        PassError: 'Mật khẩu không đúng'
      })
    }

    if (user.role === 'admin') {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        'mysecretkey',
        { expiresIn: '1h' }
      )
      req.session.userId = user._id
      req.session.token = token
      return res.redirect('/admin')
    } else {
      return res.render('dangkydangnhap/loginadmin.hbs', {
        RoleError: 'Bạn không có quyền truy cập trang web'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})

router.post('/loginuser', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.render('dangkydangnhap/loginuser.hbs', {
        UserError: 'Email không đúng'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.render('dangkydangnhap/loginuser.hbs', {
        PassError: 'Mật khẩu không đúng'
      })
    }

    if (user.role === 'user') {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        'mysecretkey',
        { expiresIn: '1h' }
      )
      req.session.userId = user._id
      req.session.token = token
      return res.redirect('/user')
    } else {
      return res.render('dangkydangnhap/loginuser.hbs', {
        RoleError: 'Bạn không có quyền truy cập trang web'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})

router.post('/loginstaff', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.render('dangkydangnhap/loginstaff.hbs', {
        UserError: 'Email không đúng'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.render('dangkydangnhap/loginstaff.hbs', {
        PassError: 'Mật khẩu không đúng'
      })
    }

    if (user.role === 'staff') {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        'mysecretkey',
        { expiresIn: '1h' }
      )
      req.session.userId = user._id
      req.session.token = token
      return res.redirect('/staff')
    } else {
      return res.render('dangkydangnhap/loginstaff.hbs', {
        RoleError: 'Bạn không có quyền truy cập trang web'
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi.' })
  }
})


router.post('/userdelete/:_id', async (req, res) => {
  try {
    const userId = req.params._id

    const hasUserCmtManga = await Manga.exists({ 'comment.userID': userId })
    const hasUserBaiviet = await Baiviet.exists({ userId: userId })
    const hasUserCommentsBaiviet = await Baiviet.exists({
      'comment.userID': userId
    })
    const haspayment = await Payment.exists({ userID: userId })

    if (
      !hasUserCmtManga &&
      !hasUserBaiviet &&
      !hasUserCommentsBaiviet &&
      !haspayment
    ) {
      const deletedUser = await User.findByIdAndRemove(userId)
      if (!deletedUser) {
        return res.status(404).json({ message: 'Người dùng không tồn tại.' })
      }

      return res.json({ message: 'Người dùng đã được xóa thành công.' })
    }

    await Manga.updateMany(
      { 'comment.userID': userId },
      { $pull: { comment: { userID: userId } } }
    )
    await Baiviet.deleteMany({ userId: userId })
    await Baiviet.updateMany(
      { 'comment.userID': userId },
      { $pull: { comment: { userID: userId } } }
    )
    await Payment.deleteMany({ userID: userId })

    const deletedUser = await User.findByIdAndRemove(userId)
    if (!deletedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' })
    }

    res.json({ message: 'Xóa user thành công' })
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa người dùng.' })
  }
})

router.post('/userdeleteweb/:_id', async (req, res) => {
  try {
    const userId = req.params._id

    const hasUserCmtManga = await Manga.exists({ 'comment.userID': userId })
    const hasUserBaiviet = await Baiviet.exists({ userId: userId })
    const hasUserCommentsBaiviet = await Baiviet.exists({
      'comment.userID': userId
    })
    const haspayment = await Payment.exists({ userID: userId })

    if (
      !hasUserCmtManga &&
      !hasUserBaiviet &&
      !hasUserCommentsBaiviet &&
      !haspayment
    ) {
      const deletedUser = await User.findByIdAndRemove(userId)
      if (!deletedUser) {
        return res.status(404).json({ message: 'Người dùng không tồn tại.' })
      }

      return res.json({ message: 'Người dùng đã được xóa thành công.' })
    }

    await Manga.updateMany(
      { 'comment.userID': userId },
      { $pull: { comment: { userID: userId } } }
    )
    await Baiviet.deleteMany({ userId: userId })
    await Baiviet.updateMany(
      { 'comment.userID': userId },
      { $pull: { comment: { userID: userId } } }
    )
    await Payment.deleteMany({ userID: userId })

    const deletedUser = await User.findByIdAndRemove(userId)
    if (!deletedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' })
    }

    res.render('successadmin', {
      message: `xóa ${deletedUser.role} thành công `
    })
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa người dùng.' })
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        password: hashedPassword,
        role,
        phone: phone.toString()
      },
      { new: true }
    )

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
