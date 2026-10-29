import express from 'express'
import db from './db.js'

const app = express()
const PORT = 5000

app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ============ СЛУЖЕБНЫЕ ============

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

// ============ CRUD ============

// Список всех резюме (краткая информация для выбора)
app.get('/api/resumes', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT id, full_name, position, template, updated_at FROM RESUME ORDER BY updated_at DESC, id DESC')
      .all()
    res.json(
      rows.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        position: r.position,
        template: r.template,
        updatedAt: r.updated_at,
      }))
    )
  } catch (err) {
    console.error('Ошибка получения списка:', err)
    res.status(500).json({ error: 'Ошибка базы данных' })
  }
})

// Получить одно резюме со всеми вложенными данными
app.get('/api/resumes/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' })
  }
  try {
    const r = db.prepare('SELECT * FROM RESUME WHERE id = ?').get(id)
    if (!r) return res.status(404).json({ error: 'Резюме не найдено' })

    const education = db
      .prepare('SELECT id, institution, specialty, start_year AS startYear, end_year AS endYear FROM EDUCATION WHERE resume_id = ? ORDER BY id')
      .all(id)
    const experience = db
      .prepare('SELECT id, company, position, description FROM EXPERIENCE WHERE resume_id = ? ORDER BY id')
      .all(id)
    const skills = db
      .prepare('SELECT id, name FROM SKILL WHERE resume_id = ? ORDER BY id')
      .all(id)
    const projects = db
      .prepare('SELECT id, name, description, link FROM PROJECT WHERE resume_id = ? ORDER BY id')
      .all(id)

    res.json({
      id: r.id,
      fullName: r.full_name,
      position: r.position,
      email: r.email,
      phone: r.phone,
      about: r.about,
      template: r.template,
      education,
      experience,
      skills,
      projects,
    })
  } catch (err) {
    console.error('Ошибка загрузки резюме:', err)
    res.status(500).json({ error: 'Ошибка базы данных' })
  }
})

// Создать новое резюме
app.post('/api/resumes', (req, res) => {
  const data = req.body || {}
  if (!data.fullName || !String(data.fullName).trim()) {
    return res.status(400).json({ error: 'ФИО обязательно для заполнения' })
  }
  try {
    const newId = saveResume(null, data)
    res.status(201).json({ id: newId })
  } catch (err) {
    console.error('Ошибка сохранения:', err)
    res.status(500).json({ error: 'Не удалось сохранить резюме' })
  }
})

// Обновить существующее резюме
app.put('/api/resumes/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' })
  }
  const data = req.body || {}
  if (!data.fullName || !String(data.fullName).trim()) {
    return res.status(400).json({ error: 'ФИО обязательно для заполнения' })
  }
  const exists = db.prepare('SELECT id FROM RESUME WHERE id = ?').get(id)
  if (!exists) return res.status(404).json({ error: 'Резюме не найдено' })

  try {
    saveResume(id, data)
    res.json({ id })
  } catch (err) {
    console.error('Ошибка обновления:', err)
    res.status(500).json({ error: 'Не удалось обновить резюме' })
  }
})

// Удалить резюме
app.delete('/api/resumes/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' })
  }
  try {
    const result = db.prepare('DELETE FROM RESUME WHERE id = ?').run(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Резюме не найдено' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('Ошибка удаления:', err)
    res.status(500).json({ error: 'Не удалось удалить резюме' })
  }
})

// ============ ВНУТРЕННЯЯ ФУНКЦИЯ СОХРАНЕНИЯ ============

// id === null — создаём; иначе — обновляем (удаляем дочерние и пишем заново)
function saveResume(id, data) {
  const resume = {
    full_name: String(data.fullName || '').trim(),
    position: data.position || '',
    email: data.email || '',
    phone: data.phone || '',
    about: data.about || '',
    template: data.template || 'classic',
  }

  db.exec('BEGIN')
  try {
    let resumeId = id

    if (id === null) {
      const info = db
        .prepare(
          'INSERT INTO RESUME (full_name, position, email, phone, about, template) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .run(
          resume.full_name,
          resume.position,
          resume.email,
          resume.phone,
          resume.about,
          resume.template
        )
      resumeId = Number(info.lastInsertRowid)
    } else {
      db.prepare(
        'UPDATE RESUME SET full_name = ?, position = ?, email = ?, phone = ?, about = ?, template = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(
        resume.full_name,
        resume.position,
        resume.email,
        resume.phone,
        resume.about,
        resume.template,
        id
      )
      // Полностью перезаписываем дочерние записи
      db.prepare('DELETE FROM EDUCATION WHERE resume_id = ?').run(id)
      db.prepare('DELETE FROM EXPERIENCE WHERE resume_id = ?').run(id)
      db.prepare('DELETE FROM SKILL WHERE resume_id = ?').run(id)
      db.prepare('DELETE FROM PROJECT WHERE resume_id = ?').run(id)
    }

    const insEdu = db.prepare(
      'INSERT INTO EDUCATION (resume_id, institution, specialty, start_year, end_year) VALUES (?, ?, ?, ?, ?)'
    )
    for (const e of data.education || []) {
      if (!e) continue
      if (!e.institution && !e.specialty && !e.startYear && !e.endYear) continue
      insEdu.run(resumeId, e.institution || '', e.specialty || '', String(e.startYear || ''), String(e.endYear || ''))
    }

    const insExp = db.prepare(
      'INSERT INTO EXPERIENCE (resume_id, company, position, description) VALUES (?, ?, ?, ?)'
    )
    for (const e of data.experience || []) {
      if (!e) continue
      if (!e.company && !e.position && !e.description) continue
      insExp.run(resumeId, e.company || '', e.position || '', e.description || '')
    }

    const insSkill = db.prepare('INSERT INTO SKILL (resume_id, name) VALUES (?, ?)')
    for (const s of data.skills || []) {
      if (!s || !s.name || !String(s.name).trim()) continue
      insSkill.run(resumeId, String(s.name).trim())
    }

    const insProj = db.prepare(
      'INSERT INTO PROJECT (resume_id, name, description, link) VALUES (?, ?, ?, ?)'
    )
    for (const p of data.projects || []) {
      if (!p) continue
      if (!p.name && !p.description && !p.link) continue
      insProj.run(resumeId, p.name || '', p.description || '', p.link || '')
    }

    db.exec('COMMIT')
    return resumeId
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`)
  console.log(`Проверка:      http://localhost:${PORT}/api/health`)
  console.log(`База данных:   http://localhost:${PORT}/api/db-check`)
  console.log(`Резюме (CRUD): http://localhost:${PORT}/api/resumes`)
})