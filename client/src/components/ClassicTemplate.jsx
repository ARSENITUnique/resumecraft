function ClassicTemplate({ resume }) {
  const hasEducation = resume.education.some(
    (e) => e.institution || e.specialty || e.startYear || e.endYear
  )
  const hasExperience = resume.experience.some(
    (e) => e.company || e.position || e.description
  )
  const hasSkills = resume.skills.some((s) => s.name.trim())
  const hasProjects = resume.projects.some(
    (p) => p.name || p.description || p.link
  )
  const hasContacts = resume.email || resume.phone

  return (
    <div className="classic-template">
      <header className="classic-header">
        <h1 className="classic-name">{resume.fullName || 'ФИО'}</h1>
        {resume.position && (
          <p className="classic-position">{resume.position}</p>
        )}
        {hasContacts && (
          <p className="classic-contacts">
            {resume.email && <span>{resume.email}</span>}
            {resume.email && resume.phone && <span> · </span>}
            {resume.phone && <span>{resume.phone}</span>}
          </p>
        )}
      </header>

      {resume.about && (
        <section className="classic-section">
          <h2 className="classic-section-title">О себе</h2>
          <p>{resume.about}</p>
        </section>
      )}

      {hasEducation && (
        <section className="classic-section">
          <h2 className="classic-section-title">Образование</h2>
          {resume.education
            .filter((e) => e.institution || e.specialty || e.startYear || e.endYear)
            .map((e) => (
              <div key={e.id} className="resume-item">
                {e.institution && <strong>{e.institution}</strong>}
                {e.specialty && <p>{e.specialty}</p>}
                {(e.startYear || e.endYear) && (
                  <p className="resume-meta">
                    {e.startYear}
                    {e.startYear && e.endYear ? ' — ' : ''}
                    {e.endYear}
                  </p>
                )}
              </div>
            ))}
        </section>
      )}

      {hasExperience && (
        <section className="classic-section">
          <h2 className="classic-section-title">Опыт работы</h2>
          {resume.experience
            .filter((e) => e.company || e.position || e.description)
            .map((e) => (
              <div key={e.id} className="resume-item">
                {e.position && <strong>{e.position}</strong>}
                {e.company && <p>{e.company}</p>}
                {e.description && <p className="resume-meta">{e.description}</p>}
              </div>
            ))}
        </section>
      )}

      {hasSkills && (
        <section className="classic-section">
          <h2 className="classic-section-title">Навыки</h2>
          <ul className="resume-skills">
            {resume.skills
              .filter((s) => s.name.trim())
              .map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
          </ul>
        </section>
      )}

      {hasProjects && (
        <section className="classic-section">
          <h2 className="classic-section-title">Проекты</h2>
          {resume.projects
            .filter((p) => p.name || p.description || p.link)
            .map((p) => (
              <div key={p.id} className="resume-item">
                {p.name && <strong>{p.name}</strong>}
                {p.description && <p>{p.description}</p>}
                {p.link && (
                  <p className="resume-meta">
                    <a href={p.link} target="_blank" rel="noreferrer">
                      {p.link}
                    </a>
                  </p>
                )}
              </div>
            ))}
        </section>
      )}
    </div>
  )
}

export default ClassicTemplate