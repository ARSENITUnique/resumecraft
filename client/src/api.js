// Обёртки над fetch для общения с backend.
// Все пути идут на /api/... — Vite-прокси перенаправит на Express.

const BASE = '/api'

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Ошибка ${res.status}`)
  }
  return data
}

export const api = {
  listResumes: () => fetch(`${BASE}/resumes`).then(handle),

  getResume: (id) => fetch(`${BASE}/resumes/${id}`).then(handle),

  createResume: (data) =>
    fetch(`${BASE}/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),

  updateResume: (id, data) =>
    fetch(`${BASE}/resumes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),

  deleteResume: (id) =>
    fetch(`${BASE}/resumes/${id}`, { method: 'DELETE' }).then(handle),
}