function Home({ onStart }) {
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
    </section>
  )
}

export default Home