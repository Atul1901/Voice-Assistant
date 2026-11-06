import { Icon } from './Icon'
import type { Conversation } from '../services/api'

interface HistoryViewProps {
  conversations: Conversation[]
  isLoading: boolean
  loadingConversationId: string | null
  error: string
  onNewConversation: () => void
  onSelectConversation: (conversationId: string) => void
}

export function HistoryView({
  conversations,
  isLoading,
  loadingConversationId,
  error,
  onNewConversation,
  onSelectConversation,
}: HistoryViewProps) {
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))

  return (
    <section className="history-view" aria-labelledby="history-title">
      <div className="history-view-heading">
        <div>
          <p className="section-kicker">YOUR WORKSPACE</p>
          <h2 id="history-title">Conversation history</h2>
          <p>Open a previous conversation or start a new one.</p>
        </div>
        <button className="primary-button" onClick={onNewConversation}>
          <Icon name="plus" /> New conversation
        </button>
      </div>

      {error && <p className="conversation-error" role="alert">{error}</p>}
      {isLoading ? (
        <p className="history-status" role="status">Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <div className="history-empty">
          <div className="history-icon"><Icon name="history" size={22} /></div>
          <h3>No conversations yet</h3>
          <p>Your saved conversations will appear here.</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              className="conversation-list-item"
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              disabled={loadingConversationId !== null}
            >
              <span className="history-icon"><Icon name="history" size={18} /></span>
              <span className="conversation-list-copy">
                <strong>{conversation.title}</strong>
                <span>{conversation.messages.length} messages</span>
              </span>
              <span className="conversation-list-date">{formatDate(conversation.updated_at)}</span>
              {loadingConversationId === conversation.id && (
                <span className="conversation-list-loading">Opening...</span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
