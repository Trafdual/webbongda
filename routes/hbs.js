const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')

const checkAuth = (req, res, next) => {
  if (!req.session.token) {
    return res.redirect('/loginadmin')
  }
  try {
    const decoded = jwt.verify(req.session.token, 'mysecretkey', {
      expiresIn: '1h'
    })
    req.userData = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      req.session.destroy()
      return res.redirect('/loginadmin')
    } else {
      console.error(error)
      return res.status(500).json({ message: 'Đã xảy ra lỗi.' })
    }
  }
}

router.get('/loginadmin', async (req, res) => {
  res.render('dangkydangnhap/loginadmin.hbs')
})
router.get('/loginuser', async (req, res) => {
  res.render('dangkydangnhap/loginuser.hbs')
})

router.get('/loginstaff', async (req, res) => {
  res.render('dangkydangnhap/loginstaff.hbs')
})


router.get('/login', async (req, res) => {
  res.render('dangkydangnhap/login.hbs')
})

router.get('/userscreen', async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ role: 'user' }, { role: 'nhomdich' }]
    })
    res.render('user', { user: users })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error)
    res
      .status(500)
      .json({ error: 'Đã xảy ra lỗi khi lấy danh sách người dùng' })
  }
})

router.get('/admin', checkAuth, async (req, res) => {
  const userId = req.session.userId
  const user = await User.findById(userId)
  if (!user) {
    res.status(403).json({ message: 'không tìm thấy user' })
  }
  res.render('admin/admin.hbs', { user })
})

router.get('/logout', async (req, res) => {
  res.redirect('/loginadmin')
})

router.get('/nhomdich', checkAuth, async (req, res) => {
  const userId = req.session.userId
  const user = await User.findById(userId)
  if (!user) {
    res.status(403).json({ message: 'không tìm thấy user' })
  }
  res.render('nhomdich', { user })
})

router.get('/setting', async (req, res) => {
  const userId = req.session.userId
  const user = await User.findById(userId)
  if (!user) {
    res.status(403).json({ message: 'không tìm thấy user' })
  }
  res.render('setting', { user })
})

module.exports = router
