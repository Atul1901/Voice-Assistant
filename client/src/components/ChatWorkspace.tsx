import type { ConversationMessage } from '../services/api'
import { ConversationPanel } from './ConversationPanel'
import { SummaryPanel } from './SummaryPanel'

interface ChatWorkspaceProps {
  title: string
  message: string
  messages: ConversationMessage[]
  started: boolean
  isSending: boolean
  error: string
  onMessageChange: (value: string) => void
  onSend: () => void
  onStart: () => void
}

export function ChatWorkspace({
  title,
  message,
  messages,
  started,
  isSending,
  error,
  onMessageChange,
  onSend,
  onStart,
}: ChatWorkspaceProps) {
  return (
    <section className="chat-workspace" aria-labelledby="chat-workspace-title">
      <header className="chat-workspace-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> CONVERSATION WORKSPACE
          </p>
          <h1 id="chat-workspace-title">{title}</h1>
          <p className="welcome-subtitle">
            Your messages are saved to this conversation.
          </p>
        </div>
      </header>
      {error && <p className="conversation-error" role="alert">{error}</p>}
      <div className="content-grid">
        <ConversationPanel
          message={message}
          messages={messages}
          started={started}
          isSending={isSending}
          onMessageChange={onMessageChange}
          onSend={onSend}
          onStart={onStart}
        />
        <SummaryPanel started={started} />
      </div>
    </section>
  )
}
