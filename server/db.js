import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'resumecraft.db')

// Встроенный SQLite из Node.js — не требует компиляции и Visual Studio
const db = new DatabaseSync(dbPath)

// Включаем внешние ключи (нужно для ON DELETE CASCADE)
db.exec('PRAGMA foreign_keys = ON')

// Создаём таблицы, если их ещё нет
db.exec(`
  CREATE TABLE IF NOT EXISTS RESUME (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    about TEXT,
    template TEXT DEFAULT 'classic',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS EDUCATION (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    institution TEXT,
    specialty TEXT,
    start_year TEXT,
    end_year TEXT,
    FOREIGN KEY (resume_id) REFERENCES RESUME(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS EXPERIENCE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    company TEXT,
    position TEXT,
    description TEXT,
    FOREIGN KEY (resume_id) REFERENCES RESUME(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS SKILL (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    name TEXT,
    FOREIGN KEY (resume_id) REFERENCES RESUME(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS PROJECT (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id INTEGER NOT NULL,
    name TEXT,
    description TEXT,
    link TEXT,
    FOREIGN KEY (resume_id) REFERENCES RESUME(id) ON DELETE CASCADE
  );
`)

console.log(`SQLite подключён: ${dbPath}`)

export default db