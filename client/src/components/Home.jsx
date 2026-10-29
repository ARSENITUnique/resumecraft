import { useState } from 'react'

function Home({ onStart }) {
  const [health, setHealth] = useState(null)
  const [checking, setChecking] = useState(false)

  const checkHealth = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setHealth(data)
    } catch (err) {
      setHealth({ status: 'error', message: 'Сервер недоступен' })
    } finally {
      setChecking(false)
    }
  }

  return (
    <section className="hero">
      <h2 className="gradient-text">
        Создайте профессиональное резюме за минуты
      </h2>
      <p>
        ResumeCraft — простой и удобный сервис для создания резюме и портфолио.
        Заполните форму, выберите шаблон и скачайте готовый PDF.
      </p>
      <button className="btn-primary" onClick={onStart}>
        Создать резюме
      </button>

      <div className="features">
        <div className="feature-card">
          <h3 className="gradient-text">Удобный редактор</h3>
          <p>
            Заполняйте личные данные, образование, опыт, навыки и проекты в одном
            месте.
          </p>
        </div>
        <div className="feature-card">
          <h3 className="gradient-text">Живой предпросмотр</h3>
          <p>Резюме обновляется мгновенно по мере ввода данных.</p>
        </div>
        <div className="feature-card">
          <h3 className="gradient-text">Два шаблона</h3>
          <p>Classic и Modern — переключайтесь без потери данных.</p>
        </div>
        <div className="feature-card">
          <h3 className="gradient-text">Экспорт в PDF</h3>
          <p>Скачивайте готовое резюме в PDF с сохранением оформления.</p>
        </div>
      </div>

      {/* Проверка связи с backend (этап 5) */}
      <div className="health-check">
        <button className="btn-secondary" onClick={checkHealth} disabled={checking}>
          {checking ? 'Проверяем…' : 'Проверить сервер'}
        </button>
        {health && (
          <p className={`health-result ${health.status === 'ok' ? 'ok' : 'err'}`}>
            {health.status === 'ok'
              ? `✅ Сервер работает (${health.service})`
              : `❌ Ошибка: ${health.message || health.error || 'неизвестно'}`}
          </p>
        )}
      </div>
    </section>
  )
}

export default Home