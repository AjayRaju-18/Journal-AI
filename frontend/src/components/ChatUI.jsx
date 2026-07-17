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

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // ── Main send handler: upload → generate → hand job_id to StatusCard ────
  const handleSendMessage = async (message, config) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Append user bubble immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      files: { data: [...attachedFiles.data], template: attachedFiles.template },
      config,
    };
    setMessages(prev => [...prev, userMessage]);

    // 2. Append a placeholder assistant bubble (shows upload spinner)
    const assistantId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: "I'll generate your research paper now…",
        timestamp: new Date(),
        jobId: null,
        isLoading: true,
      },
    ]);

    try {
      // ── Step 1: upload files ─────────────────────────────────────────
      const uploadResp = await uploadFiles(
        attachedFiles.data[0],   // required data file
        attachedFiles.template   // optional template
      );
      const jobId = uploadResp.job_id;

      // ── Step 2: trigger generation ───────────────────────────────────
      await generatePaper(jobId, {
        style: config.style,
        citation_style: config.citationFormat,
      });

      // ── Step 3: hand job_id to StatusCard — it polls every 2 s ───────
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? {
                ...msg,
                jobId,
                isLoading: false,
                content: 'Generating your research paper…',
                retryConfig: { jobId, style: config.style, citationFormat: config.citationFormat },
              }
            : msg
        )
      );

      // Clear attached files
      setAttachedFiles({ data: [], template: null });

    } catch (err) {
      const detail =
        err?.response?.data?.detail || err.message || 'Something went wrong. Please try again.';

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantId
            ? { ...msg, isLoading: false, content: `❌ Error: ${detail}`, error: true }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Retry: re-call /generate with the same job's already-uploaded files ──
  const handleRetryFor = (retryConfig) => async () => {
    const { jobId, style, citationFormat } = retryConfig;
    await generatePaper(jobId, { style, citation_style: citationFormat });
  };

  // ── File attachment handlers ─────────────────────────────────────────────
  const handleFileSelect = ({ type, files }) => {
    if (type === 'data') {
      setAttachedFiles(prev => ({ ...prev, data: [...prev.data, ...files] }));
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'system',
          content: `📊 Data file attached: ${files.map(f => f.name).join(', ')}`,
          timestamp: new Date(),
        },
      ]);
    } else if (type === 'template') {
      setAttachedFiles(prev => ({ ...prev, template: files[0] }));
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'system',
          content: `📄 Template attached: ${files[0].name}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleRemoveData = (index) => {
    const removed = attachedFiles.data[index];
    setAttachedFiles(prev => ({ ...prev, data: prev.data.filter((_, i) => i !== index) }));
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'system', content: `🗑️ Removed: ${removed.name}`, timestamp: new Date() },
    ]);
  };

  const handleRemoveTemplate = () => {
    const removed = attachedFiles.template;
    setAttachedFiles(prev => ({ ...prev, template: null }));
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'system', content: `🗑️ Removed template: ${removed.name}`, timestamp: new Date() },
    ]);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={theme}>
      <div className="min-h-screen bg-claude-bg-light dark:bg-claude-bg-dark text-claude-text-primary-light dark:text-claude-text-primary-dark transition-colors duration-200">

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-10 border-b border-claude-border-light dark:border-claude-border-dark bg-claude-bg-light/90 dark:bg-claude-bg-dark/90 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RF</span>
              </div>
              <h1 className="text-lg font-semibold">ResearchForge</h1>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Message stream */}
        <main className="pt-14 pb-40">
          <div className="max-w-3xl mx-auto px-4">
            <MessageStream messages={messages} onRetryFor={handleRetryFor} />
          </div>
        </main>

        {/* Fixed composer */}
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
