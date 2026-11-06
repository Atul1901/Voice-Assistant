import { Icon } from './Icon'

export function HistoryView({ onNewConversation }: { onNewConversation: () => void }) {
  return (
    <section className="history-view" aria-labelledby="history-title">
      <div className="history-icon"><Icon name="history" size={22} /></div>
      <h2 id="history-title">No conversations yet</h2>
      <p>
        Your recent assistant conversations will be listed here when history is
        available.
      </p>
      <button className="primary-button" onClick={onNewConversation}>
        <Icon name="plus" /> Start a conversation
      </button>
    </section>
  )
}
