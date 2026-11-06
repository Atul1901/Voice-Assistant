import { Icon } from './Icon'
import type { PageName } from './Sidebar'

export function Topbar({ page }: { page: PageName }) {
  const currentDate = new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <header className="topbar">
      <div className="breadcrumb">
        Workspace <span>/</span> <strong>{page}</strong>
      </div>
      <div className="topbar-right">
        <span className="online-dot" aria-hidden="true" />
        <span>Prototype workspace</span>
        <div className="topbar-divider" />
        <span className="date-label">
          <Icon name="clock" size={15} /> {currentDate}
        </span>
      </div>
    </header>
  )
}
