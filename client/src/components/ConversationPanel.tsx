import type { KeyboardEvent } from 'react'
import { Icon } from './Icon'

interface ConversationPanelProps {
  message: string
  messages: string[]
  started: boolean
  onMessageChange: (value: string) => void
  onSend: () => void
  onStart: () => void
}

export function ConversationPanel({ message, messages, started, onMessageChange, onSend, onStart }: ConversationPanelProps) {
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
            {messages.map((text, index) => (
              <div className="user-message" key={`${index}-${text}`}>{text}</div>
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
              disabled={!message.trim()}
            >
              <Icon name="send" size={17} />
            </button>
          </div>
        </div>
        <div className="composer-note">
          <span><span className="tiny-lock">*</span> Messages are only stored in this page for now</span>
          <span>Press <kbd>Enter</kbd> to send</span>
        </div>
      </div>
      <div className="conversation-footer">
        <span className="footer-status">
          <i /> {started ? 'Conversation in progress' : 'Ready when you are'}
        </span>
        <button className="start-button" onClick={onStart} disabled={started}>
          <Icon name="spark" size={16} />
          {started ? 'Conversation started' : 'Start conversation'}
        </button>
      </div>
    </section>
  )
}
