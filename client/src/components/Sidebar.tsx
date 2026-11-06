import { Icon, type IconName } from './Icon'

export type PageName = 'Dashboard' | 'New Conversation' | 'Conversation History'

const navigation: { label: PageName; icon: IconName }[] = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'New Conversation', icon: 'plus' },
  { label: 'Conversation History', icon: 'history' },
]

interface SidebarProps {
  activePage: PageName
  historyCount: number
  onNavigate: (page: PageName) => void
}

export function Sidebar({ activePage, historyCount, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
        className="brand"
        onClick={() => onNavigate('Dashboard')}
        aria-label="Retail Plus dashboard"
      >
        <span className="brand-mark"><Icon name="spark" size={21} /></span>
        <span className="brand-copy">
          <strong>retail<span>+</span></strong>
          <small>AI ASSISTANT</small>
        </span>
      </button>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon }) => (
          <button
            key={label}
            className={`nav-item ${activePage === label ? 'selected' : ''}`}
            aria-current={activePage === label ? 'page' : undefined}
            onClick={() => onNavigate(label)}
          >
            <Icon name={icon} />
            <span>{label}</span>
            {label === 'Conversation History' && (
              <span className="nav-count">{historyCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><Icon name="spark" size={16} /></div>
          <strong>Here to help</strong>
          <p>Your AI business partner is ready whenever you are.</p>
          <button onClick={() => onNavigate('New Conversation')}>
            Start a chat <Icon name="arrow" size={14} />
          </button>
        </div>
        <div className="profile">
          <div className="avatar" aria-hidden="true">RK</div>
          <div className="profile-copy">
            <strong>Rajesh Kumar</strong>
            <span>Retail partner</span>
          </div>
          <button className="more-button" aria-label="More profile options">...</button>
        </div>
      </div>
    </aside>
  )
}
