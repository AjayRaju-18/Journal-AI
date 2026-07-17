const JOURNAL_STYLES = [
  { value: 'ieee',      label: 'IEEE' },
  { value: 'elsevier',  label: 'Elsevier' },
  { value: 'springer',  label: 'Springer' },
  { value: 'custom',    label: 'Custom' },
];

const CITATION_FORMATS = [
  { value: 'apa',      label: 'APA' },
  { value: 'mla',      label: 'MLA' },
  { value: 'chicago',  label: 'Chicago' },
  { value: 'ieee',     label: 'IEEE' },
  { value: 'harvard',  label: 'Harvard' },
];

/** A scrollable horizontal pill-picker row. */
function PillPicker({ options, value, onChange, placeholder }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(active ? '' : opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
              active
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-transparent border-claude-border-light dark:border-claude-border-dark text-claude-text-secondary-light dark:text-claude-text-secondary-dark hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ConfigForm({ config, onChange }) {
  return (
    <div className="mb-2.5 p-3 rounded-xl bg-claude-surface-light dark:bg-claude-surface-dark border border-claude-border-light dark:border-claude-border-dark animate-panel-reveal">

      <div className="space-y-3">
        {/* Journal Style */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-claude-text-secondary-light dark:text-claude-text-secondary-dark mb-1.5">
            Journal style
          </label>
          <PillPicker
            options={JOURNAL_STYLES}
            value={config.style}
            onChange={(v) => onChange({ ...config, style: v })}
          />
        </div>

        {/* Citation Format */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wide text-claude-text-secondary-light dark:text-claude-text-secondary-dark mb-1.5">
            Citation format
          </label>
          <PillPicker
            options={CITATION_FORMATS}
            value={config.citationFormat}
            onChange={(v) => onChange({ ...config, citationFormat: v })}
          />
        </div>
      </div>
    </div>
  );
}
