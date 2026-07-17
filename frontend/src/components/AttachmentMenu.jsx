import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/** True while window width ≤ 640 px (Tailwind's `sm` breakpoint). */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function AttachmentMenu({ onFileSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dataInputRef     = useRef(null);
  const templateInputRef = useRef(null);
  const imageInputRef    = useRef(null);
  const isMobile = useIsMobile();

  // Close on outside click (desktop popover only)
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, isMobile]);

  // Lock body scroll while sheet is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, isOpen]);

  const close = useCallback(() => setIsOpen(false), []);

  const handleDataClick     = () => { dataInputRef.current?.click();     close(); };
  const handleTemplateClick = () => { templateInputRef.current?.click(); close(); };
  const handleImageClick    = () => { imageInputRef.current?.click();    close(); };

  const handleDataChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFileSelect({ type: 'data', files });
    e.target.value = '';
  };
  const handleTemplateChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFileSelect({ type: 'template', files });
    e.target.value = '';
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFileSelect({ type: 'image', files });
    e.target.value = '';
  };

  // ── Shared menu items ────────────────────────────────────────────────────
  const MenuItem = ({ onClick, gradient, icon, title, subtitle, chevron = true }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-claude-surface-light dark:hover:bg-claude-bg-dark transition-colors text-left group"
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-claude-text-primary-light dark:text-claude-text-primary-dark">{title}</div>
        <div className="text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark mt-0.5">{subtitle}</div>
      </div>
      {chevron && (
        <svg className="w-4 h-4 text-claude-text-secondary-light dark:text-claude-text-secondary-dark flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );

  const MenuItems = () => (
    <>
      {/* Data file */}
      <MenuItem
        onClick={handleDataClick}
        gradient="from-blue-500 to-cyan-500"
        icon={
          <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Data file"
        subtitle="CSV, Excel, or text · max 50 MB"
      />

      <div className="h-px mx-4 bg-claude-border-light dark:bg-claude-border-dark" />

      {/* Template */}
      <MenuItem
        onClick={handleTemplateClick}
        gradient="from-purple-500 to-pink-500"
        icon={
          <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
        title={<>Template <span className="text-xs font-normal text-claude-text-secondary-light dark:text-claude-text-secondary-dark">(optional)</span></>}
        subtitle="DOCX · max 10 MB"
      />

      <div className="h-px mx-4 bg-claude-border-light dark:bg-claude-border-dark" />

      {/* Images / Graphs */}
      <MenuItem
        onClick={handleImageClick}
        gradient="from-amber-500 to-orange-500"
        icon={
          <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title={<>Graphs / Figures <span className="text-xs font-normal text-claude-text-secondary-light dark:text-claude-text-secondary-dark">(optional)</span></>}
        subtitle="PNG, JPG, WebP · up to 5 images · max 10 MB each"
      />
    </>
  );

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger button ───────────────────────────────────────── */}
      <button
        type="button"
        id="attachment-menu-btn"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Add files"
        className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isOpen
            ? 'bg-claude-accent text-white'
            : 'text-claude-text-secondary-light dark:text-claude-text-secondary-dark hover:bg-claude-surface-light dark:hover:bg-claude-bg-dark'
        }`}
      >
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* ── Desktop popover ───────────────────────────────────────── */}
      {!isMobile && isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-claude-surface-dark rounded-2xl border border-claude-border-light dark:border-claude-border-dark overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-panel-reveal">
          <MenuItems />
        </div>
      )}

      {/* ── Mobile bottom sheet (portalled to body) ───────────────── */}
      {isMobile && isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-black/30 animate-backdrop-in" onClick={close} aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-0 z-50 animate-sheet-up">
            <div className="bg-white dark:bg-claude-surface-dark rounded-t-3xl border-t border-claude-border-light dark:border-claude-border-dark overflow-hidden">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-claude-border-light dark:bg-claude-border-dark" />
              </div>
              <div className="px-5 pb-3 pt-2">
                <p className="text-sm font-semibold text-claude-text-primary-light dark:text-claude-text-primary-dark">Add files</p>
              </div>
              <div className="h-px mx-5 bg-claude-border-light dark:bg-claude-border-dark mb-1" />
              <MenuItems />
              <div className="pb-safe" />
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Hidden file inputs */}
      <input ref={dataInputRef}     type="file" accept=".csv,.xlsx,.xls,.txt" multiple onChange={handleDataChange}     className="hidden" />
      <input ref={templateInputRef} type="file" accept=".docx"                         onChange={handleTemplateChange} className="hidden" />
      <input ref={imageInputRef}    type="file" accept=".png,.jpg,.jpeg,.webp" multiple onChange={handleImageChange}    className="hidden" />
    </div>
  );
}
