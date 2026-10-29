import express from 'express'

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

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`)
  console.log(`Проверка:      http://localhost:${PORT}/api/health`)
})