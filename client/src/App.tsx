import { useState } from 'react'

type IconName = 'grid' | 'plus' | 'history' | 'spark' | 'mic' | 'send' | 'cart' | 'box' | 'trend' | 'clock' | 'arrow'

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, history: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5m4-1v5l3 2"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/></>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></>, send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    cart: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>,
    box: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5m-9 5v9"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <path d="M5 12h14m-7-7 7 7-7 7"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [active, setActive] = useState('Dashboard')
  const [message, setMessage] = useState('')
  const [started, setStarted] = useState(false)
  const [sentMessages, setSentMessages] = useState<string[]>([])
  function sendMessage() {
    const trimmed = message.trim()
    if (!trimmed) return
    setSentMessages((items) => [...items, trimmed]); setMessage(''); setStarted(true)
  }
  function newConversation() { setActive('New Conversation'); setSentMessages([]); setStarted(false) }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#dashboard" onClick={() => setActive('Dashboard')}><span className="brand-mark"><Icon name="spark" size={21}/></span><span className="brand-copy"><strong>retail<span>+</span></strong><small>AI ASSISTANT</small></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{[{name:'Dashboard',icon:'grid' as const},{name:'New Conversation',icon:'plus' as const},{name:'Conversation History',icon:'history' as const}].map(item=><button key={item.name} className={`nav-item ${active===item.name?'selected':''}`} onClick={()=>item.name==='New Conversation'?newConversation():setActive(item.name)}><Icon name={item.icon}/><span>{item.name}</span>{item.name==='Conversation History'&&<span className="nav-count">0</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Icon name="spark" size={16}/></div><strong>Here to help</strong><p>Your AI business partner is ready whenever you are.</p><button onClick={newConversation}>Start a chat <Icon name="arrow" size={14}/></button></div><div className="profile"><div className="avatar">RK</div><div className="profile-copy"><strong>Rajesh Kumar</strong><span>Retail partner</span></div><button className="more-button" aria-label="More profile options">Â·Â·Â·</button></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div><div className="topbar-right"><span className="online-dot"/> All systems operational <div className="topbar-divider"/><button className="date-button"><Icon name="clock" size={15}/> Today, 6 Nov 2026</button></div></header>
      <div className="page-wrap">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR BUSINESS, IN GOOD HANDS</div><h1>Good morning, Rajesh <span className="wave">âœ³</span></h1><p className="welcome-subtitle">Letâ€™s make today a little more productive.</p></div><button className="primary-button" onClick={newConversation}><Icon name="plus"/> New conversation</button></section>
        <section className="stats-grid" aria-label="Business overview"><article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><Icon name="cart"/></span><span className="stat-period">TODAY</span></div><div className="stat-value">â‚¹ 0 <span className="stat-change neutral">â€”</span></div><div className="stat-label">Orders placed</div><div className="stat-foot">Your orders will show up here</div></article><article className="stat-card"><div className="stat-top"><span className="stat-icon green"><Icon name="box"/></span><span className="stat-period">THIS WEEK</span></div><div className="stat-value">0 <span className="stat-unit">items</span></div><div className="stat-label">Products reordered</div><div className="stat-foot">Track your regular favourites</div></article><article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><Icon name="trend"/></span><span className="stat-period">THIS MONTH</span></div><div className="stat-value">â‚¹ 0 <span className="stat-change neutral">â€”</span></div><div className="stat-label">Total savings</div><div className="stat-foot">Your offers and savings at a glance</div></article></section>
        <div className="content-grid">
          <section className="conversation-card"><div className="card-heading"><div><div className="section-kicker">YOUR AI BUSINESS PARTNER</div><h2>What can I help you with?</h2><p>Ask about orders, products, offers, or anything else.</p></div><div className="assistant-badge"><span><Icon name="spark" size={16}/></span> AI assistant</div></div>
            <div className="chat-area">{!started&&sentMessages.length===0?<div className="empty-chat"><div className="assistant-avatar"><Icon name="spark" size={22}/><i/></div><strong>Your conversations start here</strong><span>Try asking me something to get started</span><div className="suggestion-list"><button onClick={()=>setMessage('Show me this weekâ€™s best offers')}>What are this weekâ€™s best offers? <Icon name="arrow" size={14}/></button><button onClick={()=>setMessage('Help me place a new order')}>Help me place a new order <Icon name="arrow" size={14}/></button></div></div>:<div className="messages"><div className="assistant-message"><div className="mini-assistant"><Icon name="spark" size={14}/></div><div><strong>Retail+ Assistant</strong><p>Hello Rajesh! Iâ€™m here to help with your business. What would you like to know?</p></div></div>{sentMessages.map((item,index)=><div className="user-message" key={`${item}-${index}`}>{item}</div>)}</div>}</div>
            <div className="composer-wrap"><div className="composer"><textarea aria-label="Message" placeholder="Type your message hereâ€¦" rows={1} value={message} onChange={event=>setMessage(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage()}}}/><div className="composer-actions"><button className="mic-button" aria-label="Microphone (coming soon)" title="Voice input coming in a future stage"><Icon name="mic" size={18}/></button><button className="send-button" aria-label="Send message" onClick={sendMessage}><Icon name="send" size={17}/></button></div></div><div className="composer-note"><span><span className="tiny-lock">âœ¦</span> Your conversations are private and secure</span><span>Press <kbd>Enter</kbd> to send</span></div></div>
            <div className="conversation-footer"><span className="footer-status"><i/> {started?'Conversation in progress':'Ready when you are'}</span><button className="start-button" onClick={()=>setStarted(true)}><Icon name="spark" size={16}/> Start conversation</button></div>
          </section>
          <aside className="summary-card"><div className="summary-heading"><div><div className="section-kicker">AT A GLANCE</div><h2>Conversation summary</h2></div><button className="more-button" aria-label="Summary options">Â·Â·Â·</button></div><div className="summary-placeholder"><div className="summary-art"><div className="art-circle"><Icon name="spark" size={22}/></div><span className="art-dot dot-one"/><span className="art-dot dot-two"/><span className="art-line line-one"/><span className="art-line line-two"/></div><strong>Your summary will appear here</strong><p>As we chat, Iâ€™ll keep track of the important details so you can pick up right where you left off.</p></div><div className="summary-bottom"><div className="summary-row"><span>Conversation status</span><span className="status-pill"><i/>{started?'In progress':'Not started'}</span></div><div className="summary-row"><span>Key topics</span><span className="muted-dash">â€”</span></div><div className="summary-row"><span>Last updated</span><span className="muted-dash">â€”</span></div></div><div className="privacy-note"><span className="privacy-check">âœ“</span><span>Your data is protected and only used to support your business.</span></div></aside>
        </div><footer className="page-footer"><span>Â© 2024 Retail+ <span className="footer-dot">Â·</span> Your partner in growth</span><span>Need a hand? <a href="mailto:support@example.com">Contact support</a></span></footer>
      </div>
    </main>
  </div>
}

export default App

