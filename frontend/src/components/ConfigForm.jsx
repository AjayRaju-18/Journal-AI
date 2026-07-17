export default function ConfigForm({ config, onChange }) {
  const journalStyles = [
    { value: 'ieee', label: 'IEEE' },
    { value: 'elsevier', label: 'Elsevier' },
    { value: 'springer', label: 'Springer' },
    { value: 'custom', label: 'Custom' },
  ];

  const citationFormats = [
    { value: 'apa', label: 'APA' },
    { value: 'mla', label: 'MLA' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'ieee', label: 'IEEE' },
    { value: 'harvard', label: 'Harvard' },
  ];

  return (
    <div className="mb-3 p-3 rounded-xl bg-claude-surface-light dark:bg-claude-surface-dark border border-claude-border-light dark:border-claude-border-dark">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-sm font-medium text-claude-text-primary-light dark:text-claude-text-primary-dark">
          Paper Configuration
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Journal Style */}
        <div>
          <label className="block text-xs font-medium text-claude-text-secondary-light dark:text-claude-text-secondary-dark mb-1.5">
            Journal Style
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-claude-bg-dark border border-claude-border-light dark:border-claude-border-dark text-claude-text-primary-light dark:text-claude-text-primary-dark focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select style...</option>
            {journalStyles.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* Citation Format */}
        <div>
          <label className="block text-xs font-medium text-claude-text-secondary-light dark:text-claude-text-secondary-dark mb-1.5">
            Citation Format
          </label>
          <select
            value={config.citationFormat}
            onChange={(e) => onChange({ ...config, citationFormat: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-claude-bg-dark border border-claude-border-light dark:border-claude-border-dark text-claude-text-primary-light dark:text-claude-text-primary-dark focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">Select format...</option>
            {citationFormats.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-2 flex items-start gap-1.5 text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Choose the formatting style for your research paper</span>
      </div>
    </div>
  );
}
