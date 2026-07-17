import { useState, useRef, useEffect } from 'react';

export default function AttachmentMenu({ onFileSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dataInputRef = useRef(null);
  const templateInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleDataClick = () => {
    dataInputRef.current?.click();
    setIsOpen(false);
  };

  const handleTemplateClick = () => {
    templateInputRef.current?.click();
    setIsOpen(false);
  };

  const handleDataChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect({ type: 'data', files });
    }
    e.target.value = ''; // Reset input
  };

  const handleTemplateChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect({ type: 'template', files });
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Plus button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
          isOpen
            ? 'bg-claude-accent text-white shadow-md'
            : 'hover:bg-claude-surface-light dark:hover:bg-claude-bg-dark text-claude-text-secondary-light dark:text-claude-text-secondary-dark'
        }`}
        title="Add files"
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Popover menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-claude-surface-dark rounded-2xl shadow-2xl border border-claude-border-light dark:border-claude-border-dark overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Data option */}
          <button
            type="button"
            onClick={handleDataClick}
            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-claude-surface-light dark:hover:bg-claude-bg-dark transition-colors text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-claude-text-primary-light dark:text-claude-text-primary-dark">
                Add Data
              </div>
              <div className="text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark mt-0.5">
                Upload CSV, Excel, or text files
              </div>
            </div>
            <div className="flex-shrink-0 text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Divider */}
          <div className="h-px bg-claude-border-light dark:bg-claude-border-dark" />

          {/* Template option */}
          <button
            type="button"
            onClick={handleTemplateClick}
            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-claude-surface-light dark:hover:bg-claude-bg-dark transition-colors text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-claude-text-primary-light dark:text-claude-text-primary-dark">
                Add Template
              </div>
              <div className="text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark mt-0.5">
                Upload DOCX template (optional)
              </div>
            </div>
            <div className="flex-shrink-0 text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Footer hint */}
          <div className="px-4 py-2 bg-claude-surface-light dark:bg-claude-bg-dark border-t border-claude-border-light dark:border-claude-border-dark">
            <p className="text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
              Max file size: 50MB for data, 10MB for templates
            </p>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={dataInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        multiple
        onChange={handleDataChange}
        className="hidden"
      />
      <input
        ref={templateInputRef}
        type="file"
        accept=".docx"
        onChange={handleTemplateChange}
        className="hidden"
      />
    </div>
  );
}
