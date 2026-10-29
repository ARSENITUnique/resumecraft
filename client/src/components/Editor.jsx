import { useState, useRef, useEffect } from 'react'
import html2pdf from 'html2pdf.js'
import ResumePreview from './ResumePreview'
import { api } from '../api'
import './Editor.css'

const emptyEducation = () => ({
  id: crypto.randomUUID(),
  institution: '',
  specialty: '',
  startYear: '',
  endYear: '',
})

const emptyExperience = () => ({
  id: crypto.randomUUID(),
  company: '',
  position: '',
  description: '',
})

const emptySkill = () => ({
  id: crypto.randomUUID(),
  name: '',
})

const emptyProject = () => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  link: '',
})

const emptyResume = () => ({
  fullName: '',
  position: '',
  email: '',
  phone: '',
  about: '',
  template: 'classic',
  education: [emptyEducation()],
  experience: [emptyExperience()],
  skills: [emptySkill()],
  projects: [emptyProject()],
})

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// Приводит ответ от API к состоянию формы (с генерацией новых id для React)
function normalizeResumeFromApi(data) {
  return {
    fullName: data.fullName || '',
    position: data.position || '',
    email: data.email || '',
    phone: data.phone || '',
    about: data.about || '',
    template: data.template || 'classic',
    education: (data.education && data.education.length ? data.education : [{}]).map((e) => ({
      id: crypto.randomUUID(),
      institution: e.institution || '',
      specialty: e.specialty || '',
      startYear: e.startYear != null ? String(e.startYear) : '',
      endYear: e.endYear != null ? String(e.endYear) : '',
    })),
    experience: (data.experience && data.experience.length ? data.experience : [{}]).map((e) => ({
      id: crypto.randomUUID(),
      company: e.company || '',
      position: e.position || '',
      description: e.description || '',
    })),
    skills: (data.skills && data.skills.length ? data.skills : [{}]).map((s) => ({
      id: crypto.randomUUID(),
      name: s.name || '',
    })),
    projects: (data.projects && data.projects.length ? data.projects : [{}]).map((p) => ({
      id: crypto.randomUUID(),
      name: p.name || '',
      description: p.description || '',
      link: p.link || '',
    })),
  }
}

function Editor() {
  const [resume, setResume] = useState(emptyResume)
  const [touched, setTouched] = useState({ fullName: false, email: false })
  const [downloading, setDownloading] = useState(false)

  // Состояние сохранения
  const [resumeId, setResumeId] = useState(null)
  const [savedList, setSavedList] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState('')

  const previewRef = useRef(null)

  // ===== Работа с формой =====
  const updateField = (field, value) => {
    setResume((prev) => ({ ...prev, [field]: value }))
  }

  const updateItem = (section, id, field, value) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addItem = (section, factory) => {
    setResume((prev) => ({ ...prev, [section]: [...prev[section], factory()] }))
  }

  const removeItem = (section, id) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }))
  }

  // ===== Работа с API =====
  const refreshList = async () => {
    setLoadingList(true)
    try {
      const list = await api.listResumes()
      setSavedList(list)
    } catch (err) {
      console.error('Не удалось загрузить список:', err)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleSave = async () => {
    setSaveError('')
    setSaveOk('')

    if (!resume.fullName.trim()) {
      setTouched((t) => ({ ...t, fullName: true }))
      setSaveError('ФИО обязательно для заполнения')
      return
    }
    if (resume.email && !isValidEmail(resume.email)) {
      setTouched((t) => ({ ...t, email: true }))
      setSaveError('Введите корректный email')
      return
    }

    setSaving(true)
    try {
      if (resumeId) {
        await api.updateResume(resumeId, resume)
        setSaveOk('Резюме обновлено в базе')
      } else {
        const { id } = await api.createResume(resume)
        setResumeId(id)
        setSaveOk(`Резюме сохранено в базе (id: ${id})`)
      }
      await refreshList()
    } catch (err) {
      setSaveError(err.message || 'Не удалось сохранить резюме')
    } finally {
      setSaving(false)
    }
  }

  const handleNew = () => {
    if (saving) return
    if (resumeId && !window.confirm('Создать новое резюме? Текущее останется в базе.')) {
      return
    }
    setResume(emptyResume())
    setResumeId(null)
    setTouched({ fullName: false, email: false })
    setSaveError('')
    setSaveOk('')
  }

  const handleLoad = async (id) => {
    setLoading(true)
    setSaveError('')
    setSaveOk('')
    try {
      const data = await api.getResume(id)
      setResume(normalizeResumeFromApi(data))
      setResumeId(id)
      setTouched({ fullName: false, email: false })
      setSaveOk(`Загружено резюме (id: ${id})`)
    } catch (err) {
      setSaveError(err.message || 'Не удалось загрузить резюме')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить это резюме из базы?')) return
    try {
      await api.deleteResume(id)
      if (resumeId === id) {
        setResume(emptyResume())
        setResumeId(null)
      }
      await refreshList()
      setSaveOk(`Резюме id=${id} удалено`)
    } catch (err) {
      setSaveError(err.message || 'Не удалось удалить резюме')
    }
  }

  // ===== PDF =====
  const handleDownloadPDF = async () => {
    if (!resume.fullName.trim()) {
      setTouched((t) => ({ ...t, fullName: true }))
      alert('Перед скачиванием PDF заполните ФИО')
      return
    }
    if (resume.email && !isValidEmail(resume.email)) {
      setTouched((t) => ({ ...t, email: true }))
      alert('Перед скачиванием PDF укажите корректный email')
      return
    }

    const source = previewRef.current
    if (!source) return

    setDownloading(true)

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '794px'
    container.style.background = '#ffffff'

    const clone = source.cloneNode(true)
    clone.style.boxShadow = 'none'
    clone.style.border = 'none'
    clone.style.borderRadius = '0'
    clone.style.minHeight = 'auto'
    clone.style.width = '100%'
    clone.style.overflow = 'visible'

    container.appendChild(clone)
    document.body.appendChild(container)

    const safeName = resume.fullName.trim().replace(/\s+/g, '_') || 'resume'

    try {
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${safeName}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(clone)
        .save()
    } catch (err) {
      console.error('Ошибка создания PDF:', err)
      alert('Не удалось создать PDF. Попробуйте ещё раз.')
    } finally {
      document.body.removeChild(container)
      setDownloading(false)
    }
  }

  const nameError = !resume.fullName.trim() ? 'ФИО обязательно для заполнения' : ''
  const emailError =
    resume.email && !isValidEmail(resume.email)
      ? 'Введите корректный email (например, user@mail.ru)'
      : ''

  return (
    <div className="editor-page">
      {/* Панель сохранения */}
      <div className="save-bar">
        <div>
          <h2 className="gradient-text">Редактор резюме</h2>
          <p className="editor-hint">
            {resumeId
              ? `Редактируется сохранённое резюме (id: ${resumeId})`
              : 'Новое резюме (ещё не сохранено в базе)'}
          </p>
        </div>
        <div className="save-actions">
          <button className="btn-secondary" onClick={handleNew} disabled={saving}>
            Новое
          </button>
          <button
            className="btn-download"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Сохраняем…' : resumeId ? 'Обновить в базе' : 'Сохранить в базу'}
          </button>
        </div>
      </div>

      {saveError && <p className="save-msg err">❌ {saveError}</p>}
      {saveOk && <p className="save-msg ok">✅ {saveOk}</p>}

      {/* Форма + предпросмотр */}
      <div className="editor-layout">
        <div className="editor-form">
          <h3 className="gradient-text">Заполните данные</h3>
          <p className="editor-hint">
            Предпросмотр справа обновляется автоматически.
          </p>

          <section className="form-section">
            <h3 className="gradient-text">Личная информация</h3>

            <label className="field">
              <span>ФИО *</span>
              <input
                type="text"
                value={resume.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                className={touched.fullName && nameError ? 'input-error' : ''}
                placeholder="Иванов Иван Иванович"
              />
              {touched.fullName && nameError && (
                <span className="error-text">{nameError}</span>
              )}
            </label>

            <label className="field">
              <span>Желаемая должность</span>
              <input
                type="text"
                value={resume.position}
                onChange={(e) => updateField('position', e.target.value)}
                placeholder="Frontend-разработчик"
              />
            </label>

            <label className="field">
              <span>Электронная почта</span>
              <input
                type="email"
                value={resume.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={touched.email && emailError ? 'input-error' : ''}
                placeholder="user@mail.ru"
              />
              {touched.email && emailError && (
                <span className="error-text">{emailError}</span>
              )}
            </label>

            <label className="field">
              <span>Телефон</span>
              <input
                type="tel"
                value={resume.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </label>

            <label className="field">
              <span>Информация о себе</span>
              <textarea
                rows={4}
                value={resume.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Кратко о вашем опыте, целях и сильных сторонах"
              />
            </label>
          </section>

          <section className="form-section">
            <h3 className="gradient-text">Образование</h3>
            {resume.education.map((item, index) => (
              <div key={item.id} className="list-item">
                <div className="list-item-header">
                  <span>Запись {index + 1}</span>
                  {resume.education.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem('education', item.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <label className="field">
                  <span>Учебное заведение</span>
                  <input
                    type="text"
                    value={item.institution}
                    onChange={(e) =>
                      updateItem('education', item.id, 'institution', e.target.value)
                    }
                    placeholder="МГУ им. М.В. Ломоносова"
                  />
                </label>
                <label className="field">
                  <span>Специальность</span>
                  <input
                    type="text"
                    value={item.specialty}
                    onChange={(e) =>
                      updateItem('education', item.id, 'specialty', e.target.value)
                    }
                    placeholder="Прикладная информатика"
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Год начала</span>
                    <input
                      type="number"
                      value={item.startYear}
                      onChange={(e) =>
                        updateItem('education', item.id, 'startYear', e.target.value)
                      }
                      placeholder="2019"
                    />
                  </label>
                  <label className="field">
                    <span>Год окончания</span>
                    <input
                      type="number"
                      value={item.endYear}
                      onChange={(e) =>
                        updateItem('education', item.id, 'endYear', e.target.value)
                      }
                      placeholder="2023"
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addItem('education', emptyEducation)}
            >
              + Добавить образование
            </button>
          </section>

          <section className="form-section">
            <h3 className="gradient-text">Опыт работы</h3>
            {resume.experience.map((item, index) => (
              <div key={item.id} className="list-item">
                <div className="list-item-header">
                  <span>Запись {index + 1}</span>
                  {resume.experience.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem('experience', item.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <label className="field">
                  <span>Компания</span>
                  <input
                    type="text"
                    value={item.company}
                    onChange={(e) =>
                      updateItem('experience', item.id, 'company', e.target.value)
                    }
                    placeholder="ООО Ромашка"
                  />
                </label>
                <label className="field">
                  <span>Должность</span>
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) =>
                      updateItem('experience', item.id, 'position', e.target.value)
                    }
                    placeholder="Frontend-разработчик"
                  />
                </label>
                <label className="field">
                  <span>Описание обязанностей</span>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) =>
                      updateItem('experience', item.id, 'description', e.target.value)
                    }
                    placeholder="Разработка интерфейсов на React, вёрстка, интеграция с API"
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addItem('experience', emptyExperience)}
            >
              + Добавить опыт
            </button>
          </section>

          <section className="form-section">
            <h3 className="gradient-text">Навыки</h3>
            {resume.skills.map((item, index) => (
              <div key={item.id} className="skill-row">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    updateItem('skills', item.id, 'name', e.target.value)
                  }
                  placeholder={`Навык ${index + 1} (например, JavaScript)`}
                />
                {resume.skills.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeItem('skills', item.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addItem('skills', emptySkill)}
            >
              + Добавить навык
            </button>
          </section>

          <section className="form-section">
            <h3 className="gradient-text">Проекты</h3>
            {resume.projects.map((item, index) => (
              <div key={item.id} className="list-item">
                <div className="list-item-header">
                  <span>Запись {index + 1}</span>
                  {resume.projects.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeItem('projects', item.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <label className="field">
                  <span>Название проекта</span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateItem('projects', item.id, 'name', e.target.value)
                    }
                    placeholder="ResumeCraft"
                  />
                </label>
                <label className="field">
                  <span>Описание</span>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      updateItem('projects', item.id, 'description', e.target.value)
                    }
                    placeholder="Сервис создания резюме с экспортом в PDF"
                  />
                </label>
                <label className="field">
                  <span>Ссылка</span>
                  <input
                    type="url"
                    value={item.link}
                    onChange={(e) =>
                      updateItem('projects', item.id, 'link', e.target.value)
                    }
                    placeholder="https://github.com/user/project"
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addItem('projects', emptyProject)}
            >
              + Добавить проект
            </button>
          </section>
        </div>

        {/* Правая колонка */}
        <div className="editor-preview">
          <div className="preview-toolbar">
            <div className="template-switcher">
              <span>Шаблон:</span>
              <button
                type="button"
                className={resume.template === 'classic' ? 'active' : ''}
                onClick={() => updateField('template', 'classic')}
              >
                Classic
              </button>
              <button
                type="button"
                className={resume.template === 'modern' ? 'active' : ''}
                onClick={() => updateField('template', 'modern')}
              >
                Modern
              </button>
            </div>

            <button
              type="button"
              className="btn-download"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? 'Готовим PDF…' : 'Скачать PDF'}
            </button>
          </div>

          <div className="resume-preview" ref={previewRef}>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>

      {/* Список сохранённых резюме */}
      <section className="saved-list-section">
        <h3 className="gradient-text">Сохранённые резюме в базе</h3>

        {loadingList && <p className="editor-hint">Загружаем список…</p>}
        {!loadingList && savedList.length === 0 && (
          <p className="editor-hint">Пока нет ни одного сохранённого резюме.</p>
        )}
        {!loadingList && savedList.length > 0 && (
          <ul className="saved-list">
            {savedList.map((item) => (
              <li
                key={item.id}
                className={`saved-item ${resumeId === item.id ? 'active' : ''}`}
              >
                <div className="saved-item-info">
                  <strong>{item.fullName || 'Без названия'}</strong>
                  <span>
                    {item.position || '—'} · шаблон: {item.template}
                  </span>
                </div>
                <div className="saved-item-actions">
                  <button
                    className="btn-secondary btn-small"
                    onClick={() => handleLoad(item.id)}
                    disabled={loading || saving}
                  >
                    {loading ? '…' : 'Загрузить'}
                  </button>
                  <button
                    className="btn-remove"
                    onClick={() => handleDelete(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Editor