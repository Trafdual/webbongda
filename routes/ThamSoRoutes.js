const router = require('express').Router()
const ThamSo = require('../models/ThamSoModels')
const unidecode = require('unidecode')

router.get('/getthamso', async (req, res) => {
  try {
    const thamso = await ThamSo.find().lean()
    res.json(thamso)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/postthamso', async (req, res) => {
  try {
    const { chucnang, type, giatri, ghichu } = req.body
    const thamso = new ThamSo({ chucnang, type, giatri, ghichu })
    thamso.maCode = unidecode(chucnang).toUpperCase().replace(/\s+/g, '_')
    await thamso.save()
    res.json(thamso)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.get('/getchitietthamso/:idthamso', async (req, res) => {
  try {
    const idthamso = req.params.idthamso
    const thamso = await ThamSo.findById(idthamso)
    res.json(thamso)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/putthamso/:idthamso', async (req, res) => {
  try {
    const { chucnang, type, giatri, ghichu } = req.body
    const idthamso = req.params.idthamso
    const thamso = await ThamSo.findById(idthamso)
    thamso.chucnang = chucnang
    thamso.type = type
    thamso.giatri = giatri
    thamso.ghichu = ghichu
    thamso.maCode = unidecode(chucnang).toUpperCase().replace(/\s+/g, '_')
    await thamso.save()
    res.json(thamso)
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

router.post('/deletethamso/:idthamso', async (req, res) => {
  try {
    const idthamso = req.params.idthamso
    await ThamSo.findByIdAndDelete(idthamso)
    res.json({ message: 'xóa tham số thành công' })
  } catch (error) {
    console.error('đã xảy ra lỗi:', error)
    res.status(500).json({ error: 'Đã xảy ra lỗi' })
  }
})

module.exports = router
