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

  const hasFiles   = dataFiles.length > 0 || templateFile;
  const hasConfig  = config.style && config.citationFormat;

  // Template is optional — only data file + config are required
  const canSend =
    !isProcessing &&
    input.trim().length > 0 &&
    dataFiles.length > 0 &&
    hasConfig;

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

  // Auto-resize textarea — max 160 px on mobile, 200 px on desktop
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = window.innerWidth <= 640 ? 160 : 200;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [input]);

  // ── Hint text ─────────────────────────────────────────────────────────────
  let hint = null;
  if (!isProcessing) {
    if (!dataFiles.length) {
      hint = '📂 Upload a data file to get started';
    } else if (!hasConfig) {
      hint = '⚙️ Pick a journal style and citation format';
    } else if (canSend) {
      hint = 'Enter to send · Shift+Enter for new line';
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Fade-up gradient so messages bleed naturally into the composer */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-claude-bg-light dark:from-claude-bg-dark to-transparent" />

      <div className="bg-claude-bg-light/95 dark:bg-claude-bg-dark/95 backdrop-blur-sm border-t border-claude-border-light dark:border-claude-border-dark pb-safe">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-3 pb-2">
          <form onSubmit={handleSubmit}>

            {/* ── File chips (animated in) ────────────────────────── */}
            {hasFiles && (
              <FileChips
                dataFiles={dataFiles}
                templateFile={templateFile}
                onRemoveData={onRemoveData}
                onRemoveTemplate={onRemoveTemplate}
              />
            )}

            {/* ── Config pill-pickers (animated in when files present) ─ */}
            {hasFiles && (
              <ConfigForm config={config} onChange={setConfig} />
            )}

            {/* ── Input row ─────────────────────────────────────────── */}
            <div
              className={`relative flex items-end gap-1.5 bg-white dark:bg-claude-surface-dark rounded-2xl border transition-all duration-200 p-1.5 ${
                isProcessing
                  ? 'border-claude-border-light dark:border-claude-border-dark opacity-80'
                  : 'border-claude-border-light dark:border-claude-border-dark focus-within:border-indigo-400 dark:focus-within:border-indigo-500'
              }`}
            >
              {/* Attachment menu */}
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
                className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-claude-text-primary-light dark:text-claude-text-primary-dark placeholder-claude-text-secondary-light dark:placeholder-claude-text-secondary-dark py-2 px-1 scrollbar-thin disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
                style={{ minHeight: '36px' }}
              />

              {/* Send button */}
              <button
                type="submit"
                id="composer-send-btn"
                disabled={!canSend}
                title={
                  isProcessing ? 'Generating…'
                  : canSend ? 'Send (Enter)'
                  : 'Upload data & pick config first'
                }
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  canSend
                    ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white'
                    : 'bg-claude-surface-light dark:bg-claude-bg-dark text-claude-text-secondary-light dark:text-claude-text-secondary-dark cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>

            {/* ── Hint row ───────────────────────────────────────────── */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                hint ? 'max-h-8 mt-1.5 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="text-center text-[11px] text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
                {hint}
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
