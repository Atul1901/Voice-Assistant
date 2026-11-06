import { useState } from 'react'
import { ConversationPanel } from './components/ConversationPanel'
import { DashboardHeader } from './components/DashboardHeader'
import { HistoryView } from './components/HistoryView'
import { MetricCard, type Metric } from './components/MetricCard'
import { Sidebar, type PageName } from './components/Sidebar'
import { SummaryPanel } from './components/SummaryPanel'
import { Topbar } from './components/Topbar'

const metrics: Metric[] = [
  {
    period: 'TODAY', icon: 'cart', tone: 'blue', value: 'Rs 0',
    label: 'Orders placed', note: 'Your orders will show up here',
  },
  {
    period: 'THIS WEEK', icon: 'box', tone: 'green', value: '0', unit: 'items',
    label: 'Products reordered', note: 'Track your regular favourites',
  },
  {
    period: 'THIS MONTH', icon: 'trend', tone: 'violet', value: 'Rs 0',
    label: 'Total savings', note: 'Your offers and savings at a glance',
  },
]

function App() {
  const [activePage, setActivePage] = useState<PageName>('Dashboard')
  const [message, setMessage] = useState('')
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  function startNewConversation() {
    setMessages([])
    setMessage('')
    setStarted(false)
    setActivePage('New Conversation')
  }

  function navigate(page: PageName) {
    if (page === 'New Conversation') startNewConversation()
    else setActivePage(page)
  }

  function sendMessage() {
    const content = message.trim()
    if (!content) return
    setMessages(current => [...current, content])
    setMessage('')
    setStarted(true)
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        historyCount={0}
        onNavigate={navigate}
      />
      <main className="main-content">
        <Topbar page={activePage} />
        {activePage === 'Conversation History' ? (
          <div className="page-wrap">
            <HistoryView onNewConversation={startNewConversation} />
          </div>
        ) : (
          <div className="page-wrap">
            <DashboardHeader onNewConversation={startNewConversation} />
            <section className="stats-grid" aria-label="Business overview">
              {metrics.map(metric => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>
            <div className="content-grid">
              <ConversationPanel
                message={message}
                messages={messages}
                started={started}
                onMessageChange={setMessage}
                onSend={sendMessage}
                onStart={() => setStarted(true)}
              />
              <SummaryPanel started={started} />
            </div>
            <footer className="page-footer">
              <span>Retail+ <span className="footer-dot">|</span> Your partner in growth</span>
              <span>
                Need a hand? <a href="mailto:support@example.com">Contact support</a>
              </span>
            </footer>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
