import { Icon } from './Icon'

export function DashboardHeader({ onNewConversation }: { onNewConversation: () => void }) {
  return (
    <section className="welcome-row">
      <div>
        <div className="eyebrow">
          <span className="eyebrow-line" /> YOUR BUSINESS, IN GOOD HANDS
        </div>
        <h1>
          Good morning, Rajesh{' '}
          <span className="wave" aria-hidden="true">
            <Icon name="spark" size={18} />
          </span>
        </h1>
        <p className="welcome-subtitle">Let's make today a little more productive.</p>
      </div>
      <button className="primary-button" onClick={onNewConversation}>
        <Icon name="plus" /> New conversation
      </button>
    </section>
  )
}
