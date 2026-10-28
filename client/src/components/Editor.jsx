import { useState } from 'react'
import ResumePreview from './ResumePreview'
import './Editor.css'

// Фабрики пустых записей (у каждой свой id для ключей React)
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

// Проверка email простым регулярным выражением
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

function Editor() {
  // Всё состояние резюме хранится здесь — при изменении любого поля
  // React автоматически перерисовывает форму И предпросмотр.
  const [resume, setResume] = useState({
    fullName: '',
    position: '',
    email: '',
    phone: '',
    about: '',
    education: [emptyEducation()],
    experience: [emptyExperience()],
    skills: [emptySkill()],
    projects: [emptyProject()],
  })

  // Отслеживаем, какие поля пользователь уже "трогал",
  // чтобы не показывать ошибки до первого ввода.
  const [touched, setTouched] = useState({ fullName: false, email: false })

  // Обновить поле верхнего уровня (ФИО, email и т.д.)
  const updateField = (field, value) => {
    setResume((prev) => ({ ...prev, [field]: value }))
  }

  // Обновить поле внутри записи списка (образование, опыт, навык, проект)
  const updateItem = (section, id, field, value) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  // Добавить новую запись в раздел
  const addItem = (section, factory) => {
    setResume((prev) => ({ ...prev, [section]: [...prev[section], factory()] }))
  }

  // Удалить запись по id
  const removeItem = (section, id) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }))
  }

  // Сообщения об ошибках
  const nameError = !resume.fullName.trim()
    ? 'ФИО обязательно для заполнения'
    : ''
  const emailError =
    resume.email && !isValidEmail(resume.email)
      ? 'Введите корректный email (например, user@mail.ru)'
      : ''

  return (
    <div className="editor-layout">
      {/* ===== ФОРМА ===== */}
      <div className="editor-form">
        <h2 className="gradient-text">Редактор резюме</h2>
        <p className="editor-hint">
          Заполните поля — предпросмотр справа обновится автоматически.
        </p>

        {/* --- Личная информация --- */}
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

        {/* --- Образование --- */}
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

        {/* --- Опыт работы --- */}
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

        {/* --- Навыки --- */}
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

        {/* --- Проекты --- */}
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

      {/* ===== ПРЕДПРОСМОТР ===== */}
      <div className="editor-preview">
        <ResumePreview resume={resume} />
      </div>
    </div>
  )
}

export default Editor