import { useState } from 'react';
import MessageStream from './MessageStream';
import ComposerBar from './ComposerBar';
import ThemeToggle from './ThemeToggle';

export default function ChatUI() {
  const [theme, setTheme] = useState('light');
  const [messages, setMessages] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState({ data: [], template: null });

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

  const handleFileSelect = ({ type, files }) => {
    console.log('Files selected:', type, files);
    
    if (type === 'data') {
      setAttachedFiles(prev => ({
        ...prev,
        data: [...prev.data, ...files]
      }));
      
      // Add system message about uploaded files
      const fileNames = files.map(f => f.name).join(', ');
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: `📊 Data files uploaded: ${fileNames}`,
        role: 'system',
        timestamp: new Date()
      }]);
    } else if (type === 'template') {
      setAttachedFiles(prev => ({
        ...prev,
        template: files[0]
      }));
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: `📄 Template uploaded: ${files[0].name}`,
        role: 'system',
        timestamp: new Date()
      }]);
    }
  };

  const handleRemoveData = (index) => {
    const removedFile = attachedFiles.data[index];
    setAttachedFiles(prev => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index)
    }));
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: `🗑️ Removed data file: ${removedFile.name}`,
      role: 'system',
      timestamp: new Date()
    }]);
  };

  const handleRemoveTemplate = () => {
    const removedFile = attachedFiles.template;
    setAttachedFiles(prev => ({
      ...prev,
      template: null
    }));
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: `🗑️ Removed template: ${removedFile.name}`,
      role: 'system',
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
        <ComposerBar 
          onSend={handleSendMessage} 
          onFileSelect={handleFileSelect}
          dataFiles={attachedFiles.data}
          templateFile={attachedFiles.template}
          onRemoveData={handleRemoveData}
          onRemoveTemplate={handleRemoveTemplate}
        />
      </div>
    </div>
  );
}
