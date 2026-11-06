import { useState, useEffect } from "react";
import { ChatWorkspace } from "./components/ChatWorkspace";
import { DashboardHeader } from "./components/DashboardHeader";
import { HistoryView } from "./components/HistoryView";
import { MetricCard, type Metric } from "./components/MetricCard";
import { Sidebar, type PageName } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import {
  createConversation,
  getConversation,
  getProducts,
  listConversations,
  sendConversationChat,
  type Conversation,
  type Product,
} from "./services/api";
import { ProductList } from "./components/ProductList";

const metrics: Metric[] = [
  {
    period: "TODAY",
    icon: "cart",
    tone: "blue",
    value: "Rs 0",
    label: "Orders placed",
    note: "Your orders will show up here",
  },
  {
    period: "THIS WEEK",
    icon: "box",
    tone: "green",
    value: "0",
    unit: "items",
    label: "Products reordered",
    note: "Track your regular favourites",
  },
  {
    period: "THIS MONTH",
    icon: "trend",
    tone: "violet",
    value: "Rs 0",
    label: "Total savings",
    note: "Your offers and savings at a glance",
  },
];

function App() {
  const [activePage, setActivePage] = useState<PageName>("Dashboard");
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [conversationError, setConversationError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    async function loadConversations() {
      try {
        const savedConversations = await listConversations();
        setConversations(savedConversations);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setConversationError("Unable to load conversation history.");
      } finally {
        setIsLoadingConversations(false);
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProductError("Unable to load products");
      }
    }

    loadProducts();
  }, []);

  function updateConversationList(conversation: Conversation) {
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ]);
  }

  const activeConversationId = activeConversation?.id ?? null;

  async function createAndActivateConversation(): Promise<Conversation> {
    const conversation = await createConversation();
    updateConversationList(conversation);
    setActiveConversation(conversation);
    return conversation;
  }

  async function startNewConversation() {
    setActivePage("New Conversation");
    setActiveConversation(null);
    setMessage("");
    setStarted(false);
    setConversationError("");
    setIsCreatingConversation(true);

    try {
      await createAndActivateConversation();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setConversationError("Unable to start a conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  }

  async function startConversation() {
    if (isCreatingConversation) return;

    setConversationError("");
    setIsCreatingConversation(true);
    try {
      if (!activeConversationId) {
        await createAndActivateConversation();
      }
      setStarted(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setConversationError("Unable to start a conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  }

  async function selectConversation(conversationId: string) {
    setLoadingConversationId(conversationId);
    setConversationError("");
    try {
      const conversation = await getConversation(conversationId);
      updateConversationList(conversation);
      setActiveConversation(conversation);
      setMessage("");
      setStarted(conversation.messages.length > 0);
      setActivePage("New Conversation");
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setConversationError("Unable to load this conversation. Please try again.");
    } finally {
      setLoadingConversationId(null);
    }
  }

  function navigate(page: PageName) {
    if (page === "New Conversation") void startNewConversation();
    else setActivePage(page);
  }

  async function sendMessage() {
    const content = message.trim();
    if (!content || isSendingMessage || isCreatingConversation) return;

    let conversationForRequest = activeConversation;
    let pendingMessageId: string | null = null;
    setIsSendingMessage(true);
    setConversationError("");
    try {
      if (!conversationForRequest) {
        conversationForRequest = await createAndActivateConversation();
      }

      const conversationId = conversationForRequest.id;
      pendingMessageId = `pending-${Date.now()}`;
      const pendingMessage = {
        id: pendingMessageId,
        role: "user" as const,
        content,
        timestamp: new Date().toISOString(),
      };
      setActiveConversation((current) =>
        current?.id === conversationId
          ? { ...current, messages: [...current.messages, pendingMessage] }
          : current,
      );
      setMessage("");
      setStarted(true);

      const result = await sendConversationChat(conversationId, content);
      updateConversationList(result.conversation);
      setActiveConversation((current) =>
        current?.id === conversationId ? result.conversation : current,
      );
    } catch (error) {
      console.error("Failed to get an assistant response:", error);
      if (conversationForRequest && pendingMessageId) {
        const failedConversationId = conversationForRequest.id;
        setActiveConversation((current) =>
          current?.id === failedConversationId
            ? {
                ...current,
                messages: current.messages.filter(
                  (item) => item.id !== pendingMessageId,
                ),
              }
            : current,
        );
        setStarted(conversationForRequest.messages.length > 0);
      }
      setConversationError(
        error instanceof Error
          ? error.message
          : "Unable to get an assistant response. Please try again.",
      );
      setMessage(content);
    } finally {
      setIsSendingMessage(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        historyCount={conversations.length}
        onNavigate={navigate}
      />
      <main className="main-content">
        <Topbar page={activePage} />
        <div className="page-wrap">
          {activePage === "Conversation History" ? (
            <HistoryView
              conversations={conversations}
              isLoading={isLoadingConversations}
              loadingConversationId={loadingConversationId}
              error={conversationError}
              onNewConversation={() => void startNewConversation()}
              onSelectConversation={(id) => void selectConversation(id)}
            />
          ) : activePage === "New Conversation" ? (
            <ChatWorkspace
              title={activeConversation?.title ?? "New conversation"}
              message={message}
              messages={activeConversation?.messages ?? []}
              started={started}
              isSending={isSendingMessage}
              error={conversationError}
              onMessageChange={setMessage}
              onSend={() => void sendMessage()}
              onStart={() => void startConversation()}
            />
          ) : (
            <>
              <DashboardHeader
                onNewConversation={() => void startNewConversation()}
              />
              <section className="stats-grid" aria-label="Business overview">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </section>
              <ProductList products={products} error={productError} />
              <footer className="page-footer">
                <span>
                  Retail+ <span className="footer-dot">|</span> Your partner in
                  growth
                </span>
                <span>
                  Need a hand?{" "}
                  <a href="mailto:support@example.com">Contact support</a>
                </span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
