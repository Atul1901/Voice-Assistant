import type { KeyboardEvent } from 'react'
import { Icon } from './Icon'
import type { ConversationMessage } from '../services/api'

interface ConversationPanelProps {
  message: string
  messages: ConversationMessage[]
  started: boolean
  isSending: boolean
  onMessageChange: (value: string) => void
  onSend: () => void
  onStart: () => void
}

export function ConversationPanel({ message, messages, started, isSending, onMessageChange, onSend, onStart }: ConversationPanelProps) {
  function formatTimestamp(value: string) {
    const timestamp = new Date(value)
    if (Number.isNaN(timestamp.getTime())) return ''

    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(timestamp)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <section className="conversation-card" aria-labelledby="conversation-title">
      <div className="card-heading">
        <div>
          <div className="section-kicker">YOUR AI BUSINESS PARTNER</div>
          <h2 id="conversation-title">What can I help you with?</h2>
          <p>Ask about orders, products, offers, or anything else.</p>
        </div>
        <div className="assistant-badge">
          <span><Icon name="spark" size={16} /></span> AI assistant
        </div>
      </div>
      <div className="chat-area" aria-live="polite">
        {!started && messages.length === 0 ? (
          <div className="empty-chat">
            <div className="assistant-avatar">
              <Icon name="spark" size={22} /><i />
            </div>
            <strong>Your conversations start here</strong>
            <span>Try asking me something to get started</span>
            <div className="suggestion-list">
              <button onClick={() => onMessageChange("Show me this week's best offers")}>
                What are this week's best offers? <Icon name="arrow" size={14} />
              </button>
              <button onClick={() => onMessageChange('Help me place a new order')}>
                Help me place a new order <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="messages">
            <div className="assistant-message">
              <div className="mini-assistant"><Icon name="spark" size={14} /></div>
              <div>
                <strong>Stage 1 prototype</strong>
                <p>Your messages appear here. AI replies will be available in a later stage.</p>
              </div>
            </div>
            {messages.map((item) => (
              item.role === 'user' ? (
                <div className="user-message" key={item.id}>
                  <span>{item.content}</span>
                  <time className="message-timestamp" dateTime={item.timestamp}>
                    {formatTimestamp(item.timestamp)}
                  </time>
                </div>
              ) : (
                <div className="assistant-message" key={item.id}>
                  <div className="mini-assistant"><Icon name="spark" size={14} /></div>
                  <div>
                    <strong>Retail+ Assistant</strong>
                    <p>{item.content}</p>
                    <time className="message-timestamp" dateTime={item.timestamp}>
                      {formatTimestamp(item.timestamp)}
                    </time>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
      <div className="composer-wrap">
        <div className="composer">
          <textarea
            aria-label="Message"
            placeholder="Type your message here..."
            rows={1}
            value={message}
            onChange={event => onMessageChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="composer-actions">
            <button
              className="mic-button"
              aria-label="Voice input coming soon"
              title="Voice input will be available in a later stage"
              disabled
            >
              <Icon name="mic" size={18} />
            </button>
            <button
              className="send-button"
              aria-label="Send message"
              onClick={onSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? '...' : <Icon name="send" size={17} />}
            </button>
          </div>
        </div>
        <div className="composer-note">
          <span><span className="tiny-lock">*</span> Messages are saved to your conversation history</span>
          <span>Press <kbd>Enter</kbd> to send</span>
        </div>
      </div>
      <div className="conversation-footer">
        <span className="footer-status">
          <i /> {started ? 'Conversation in progress' : 'Ready when you are'}
        </span>
        <button className="start-button" onClick={onStart} disabled={started || isSending}>
          <Icon name="spark" size={16} />
          {started ? 'Conversation started' : isSending ? 'Saving...' : 'Start conversation'}
        </button>
      </div>
    </section>
  )
}
