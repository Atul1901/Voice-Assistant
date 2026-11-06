import { Icon } from './Icon'

export function SummaryPanel({ started }: { started: boolean }) {
  return (
    <aside className="summary-card" aria-labelledby="summary-title">
      <div className="summary-heading">
        <div>
          <div className="section-kicker">AT A GLANCE</div>
          <h2 id="summary-title">Conversation summary</h2>
        </div>
        <button className="more-button" aria-label="Summary options">...</button>
      </div>
      <div className="summary-placeholder">
        <div className="summary-art">
          <div className="art-circle"><Icon name="spark" size={22} /></div>
          <span className="art-dot dot-one" />
          <span className="art-dot dot-two" />
          <span className="art-line line-one" />
          <span className="art-line line-two" />
        </div>
        <strong>Your summary will appear here</strong>
        <p>
          As we chat, key details will appear here so you can pick up where you
          left off.
        </p>
      </div>
      <div className="summary-bottom">
        <div className="summary-row">
          <span>Conversation status</span>
          <span className="status-pill">
            <i /> {started ? 'In progress' : 'Not started'}
          </span>
        </div>
        <div className="summary-row">
          <span>Key topics</span><span className="muted-dash">-</span>
        </div>
        <div className="summary-row">
          <span>Last updated</span><span className="muted-dash">-</span>
        </div>
      </div>
      <div className="privacy-note">
        <span className="privacy-check">&#10003;</span>
        <span>Conversation messages currently stay in this browser session.</span>
      </div>
    </aside>
  )
}
