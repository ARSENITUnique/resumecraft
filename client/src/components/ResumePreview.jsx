import ClassicTemplate from './ClassicTemplate'
import ModernTemplate from './ModernTemplate'

// Просто выбирает нужный шаблон по полю resume.template.
function ResumePreview({ resume }) {
  if (resume.template === 'modern') {
    return <ModernTemplate resume={resume} />
  }
  return <ClassicTemplate resume={resume} />
}

export default ResumePreview