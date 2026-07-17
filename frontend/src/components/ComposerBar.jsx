import { useState, useRef, useEffect } from 'react';
import AttachmentMenu from './AttachmentMenu';
import FileChips from './FileChips';
import ConfigForm from './ConfigForm';

export default function ComposerBar({
  onSend,
  onFileSelect,
  dataFiles,
  templateFile,
  onRemoveData,
  onRemoveTemplate,
  isProcessing,
}) {
  const [input, setInput] = useState('');
  const [config, setConfig] = useState({ style: '', citationFormat: '' });
  const textareaRef = useRef(null);

  // Template is optional — only data file + config are required
  const canSend =
    !isProcessing &&
    input.trim().length > 0 &&
    dataFiles.length > 0 &&
    config.style &&
    config.citationFormat;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(input.trim(), config);
    setInput('');
    setConfig({ style: '', citationFormat: '' });
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea up to 200 px
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, [input]);

  // ── helper text shown beneath the input ─────────────────────────────────
  let hint = null;
  if (isProcessing) {
    hint = null; // no hint while generating
  } else if (!dataFiles.length) {
    hint = <span>📂 Upload a data file to get started</span>;
  } else if (!config.style || !config.citationFormat) {
    hint = <span>⚙️ Select journal style and citation format</span>;
  } else {
    hint = (
      <>
        <span>Press Enter to send</span>
        <span className="text-claude-border-light dark:text-claude-border-dark">•</span>
        <span>Shift+Enter for new line</span>
      </>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-claude-bg-light dark:from-claude-bg-dark via-claude-bg-light dark:via-claude-bg-dark to-transparent pt-8 pb-4">
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="relative">

          {/* File chips */}
          <FileChips
            dataFiles={dataFiles}
            templateFile={templateFile}
            onRemoveData={onRemoveData}
            onRemoveTemplate={onRemoveTemplate}
          />

          {/* Config — only show when at least one file is attached */}
          {(dataFiles.length > 0 || templateFile) && (
            <ConfigForm config={config} onChange={setConfig} />
          )}

          {/* Input row */}
          <div className="relative flex items-end gap-2 bg-white dark:bg-claude-surface-dark rounded-3xl shadow-lg border border-claude-border-light dark:border-claude-border-dark p-2 focus-within:ring-2 focus-within:ring-claude-accent focus-within:ring-opacity-50 transition-all">

            {/* "+" attachment menu */}
            <AttachmentMenu onFileSelect={onFileSelect} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              id="composer-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isProcessing
                  ? 'Generating paper…'
                  : 'Describe your paper or ask a question…'
              }
              rows={1}
              disabled={isProcessing}
              className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-claude-text-primary-light dark:text-claude-text-primary-dark placeholder-claude-text-secondary-light dark:placeholder-claude-text-secondary-dark py-2 px-2 max-h-[200px] scrollbar-thin disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '36px' }}
            />

            {/* Send button */}
            <button
              type="submit"
              id="composer-send-btn"
              disabled={!canSend}
              title={
                isProcessing
                  ? 'Generating…'
                  : canSend
                  ? 'Send (Enter)'
                  : 'Upload data & select config first'
              }
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                canSend
                  ? 'bg-claude-accent hover:bg-indigo-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-claude-surface-light dark:bg-claude-bg-dark text-claude-text-secondary-light dark:text-claude-text-secondary-dark cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          {/* Hint row */}
          {hint && (
            <div className="mt-2 px-4 flex items-center justify-center gap-4 text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
              {hint}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
