import { useEffect, useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const triggerSidebarRefresh = useCallback(() => setSidebarRefresh(n => n + 1), []);

  const {
    messages,
    sessionId,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    loadHistory,
    startNewChat,
    clearError,
  } = useChat(triggerSidebarRefresh);

  useEffect(() => {
    if (sessionId) loadHistory(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      loadHistory(id);
      setSidebarOpen(false);
    },
    [loadHistory],
  );

  const handleNewChat = useCallback(() => {
    startNewChat();
    triggerSidebarRefresh();
    setSidebarOpen(false);
  }, [startNewChat, triggerSidebarRefresh]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#0f0e17]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 md:relative md:flex md:shrink-0',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <Sidebar
          currentSessionId={sessionId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={() => setSidebarOpen(false)}
          refreshTrigger={sidebarRefresh}
          isDark={theme === 'dark'}
        />
      </div>

      {/* Chat */}
      <main className="flex flex-1 min-w-0 min-h-0 bg-white dark:bg-slate-950">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          isLoadingHistory={isLoadingHistory}
          error={error}
          onSend={sendMessage}
          onClearError={clearError}
          onMenuClick={() => setSidebarOpen(true)}
          onThemeToggle={toggle}
          isDark={theme === 'dark'}
        />
      </main>
    </div>
  );
}
