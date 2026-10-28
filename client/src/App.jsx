import { useState } from 'react'
import Home from './components/Home'
import Editor from './components/Editor'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="logo gradient-text" onClick={() => setPage('home')}>
            ResumeCraft
          </h1>
          <nav className="nav">
            <button
              className={`nav-btn ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
            >
              Главная
            </button>
            <button
              className={`nav-btn ${page === 'editor' ? 'active' : ''}`}
              onClick={() => setPage('editor')}
            >
              Редактор
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === 'home' ? (
          <Home onStart={() => setPage('editor')} />
        ) : (
          <Editor />
        )}
      </main>

      <footer className="footer">
        <p className="gradient-text">
          ResumeCraft — учебный проект по созданию резюме с экспортом в PDF
        </p>
      </footer>
    </div>
  )
}

export default App