import express from 'express'
import db from './db.js'

const app = express()
const PORT = 5000

app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ResumeCraft API',
    time: new Date().toISOString(),
  })
})

app.get('/api/db-check', (req, res) => {
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all()
      .map((row) => row.name)
    res.json({ status: 'ok', tables })
  } catch (err) {
    console.error('Ошибка чтения таблиц:', err)
    res.status(500).json({ error: 'Ошибка базы данных' })
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`)
  console.log(`Проверка:      http://localhost:${PORT}/api/health`)
  console.log(`База данных:   http://localhost:${PORT}/api/db-check`)
})