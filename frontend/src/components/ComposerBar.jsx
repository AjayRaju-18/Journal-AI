import { useState, useRef, useEffect } from 'react';
import AttachmentMenu from './AttachmentMenu';

export default function ComposerBar({ onSend, onFileSelect }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-claude-bg-light dark:from-claude-bg-dark via-claude-bg-light dark:via-claude-bg-dark to-transparent pt-8 pb-4">
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="relative">
          {/* Input container */}
          <div className="relative flex items-end gap-2 bg-white dark:bg-claude-surface-dark rounded-3xl shadow-lg border border-claude-border-light dark:border-claude-border-dark p-2 focus-within:ring-2 focus-within:ring-claude-accent focus-within:ring-opacity-50 transition-all">
            {/* Attachment menu */}
            <AttachmentMenu onFileSelect={onFileSelect} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-claude-text-primary-light dark:text-claude-text-primary-dark placeholder-claude-text-secondary-light dark:placeholder-claude-text-secondary-dark py-2 px-2 max-h-[200px] scrollbar-thin"
              style={{ minHeight: '36px' }}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                input.trim()
                  ? 'bg-claude-accent hover:bg-indigo-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-claude-surface-light dark:bg-claude-bg-dark text-claude-text-secondary-light dark:text-claude-text-secondary-dark cursor-not-allowed'
              }`}
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Helper text */}
          <div className="mt-2 px-4 flex items-center justify-center gap-4 text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
            <span>Press Enter to send</span>
            <span className="text-claude-border-light dark:text-claude-border-dark">•</span>
            <span>Shift+Enter for new line</span>
          </div>
        </form>
      </div>
    </div>
  );
}
