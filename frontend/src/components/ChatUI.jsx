import { useState } from 'react';
import MessageStream from './MessageStream';
import ComposerBar from './ComposerBar';
import ThemeToggle from './ThemeToggle';

export default function ChatUI() {
  const [theme, setTheme] = useState('light');
  const [messages, setMessages] = useState([]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSendMessage = (message) => {
    // Message sending logic will go here
    console.log('Message sent:', message);
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      content: message, 
      role: 'user',
      timestamp: new Date()
    }]);
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-claude-bg-light dark:bg-claude-bg-dark text-claude-text-primary-light dark:text-claude-text-primary-dark transition-colors duration-200">
        {/* Header with theme toggle */}
        <header className="fixed top-0 left-0 right-0 z-10 border-b border-claude-border-light dark:border-claude-border-dark bg-claude-bg-light dark:bg-claude-bg-dark backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PP</span>
              </div>
              <h1 className="text-lg font-semibold">Paper Pipeline</h1>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Main chat area */}
        <main className="pt-14 pb-32">
          <div className="max-w-3xl mx-auto px-4">
            <MessageStream messages={messages} />
          </div>
        </main>

        {/* Fixed composer bar at bottom */}
        <ComposerBar onSend={handleSendMessage} />
      </div>
    </div>
  );
}
