import { useState } from 'react';
import MessageStream from './MessageStream';
import ComposerBar from './ComposerBar';
import ThemeToggle from './ThemeToggle';
import { uploadFiles, generatePaper } from '../api/client';

export default function ChatUI() {
  const [theme, setTheme] = useState('light');
  const [messages, setMessages] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState({ data: [], template: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSendMessage = async (message, config) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Add user message to chat
    const userMessage = { 
      id: Date.now(), 
      content: message, 
      role: 'user',
      timestamp: new Date(),
      files: {
        data: [...attachedFiles.data],
        template: attachedFiles.template
      },
      config: config
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add initial assistant message
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      content: 'I\'ll start generating your research paper now...',
      role: 'assistant',
      timestamp: new Date(),
      jobId: null,
      isLoading: true
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // Step 1: Upload files
      console.log('Uploading files...');
      const uploadResponse = await uploadFiles(
        attachedFiles.data[0], // Primary data file
        attachedFiles.template
      );
      
      console.log('Upload response:', uploadResponse);
      const jobId = uploadResponse.job_id;
      
      // Step 2: Start paper generation
      console.log('Starting generation with job_id:', jobId);
      const generateResponse = await generatePaper(jobId, {
        style: config.style,
        citation_style: config.citationFormat,
      });
      
      console.log('Generate response:', generateResponse);
      
      // Update assistant message with jobId to start polling
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? { 
              ...msg, 
              jobId: jobId,
              isLoading: false,
              content: 'Generating your research paper...'
            }
          : msg
      ));
      
      // Clear attached files and reset form
      setAttachedFiles({ data: [], template: null });
      
    } catch (error) {
      console.error('Error during paper generation:', error);
      
      // Update assistant message with error
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId
          ? { 
              ...msg, 
              isLoading: false,
              content: `❌ Error: ${error.response?.data?.detail || error.message || 'Failed to generate paper. Please try again.'}`,
              error: true
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
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
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}
