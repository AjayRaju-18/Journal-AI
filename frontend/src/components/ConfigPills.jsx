export default function ConfigPills({ style, citationFormat }) {
  if (!style && !citationFormat) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {style && (
        <Pill icon="style" label="Style" value={style} />
      )}
      {citationFormat && (
        <Pill icon="citation" label="Citation" value={citationFormat} />
      )}
    </div>
  );
}

function Pill({ icon, label, value }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-xs">
      {icon === 'style' && (
        <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )}
      {icon === 'citation' && (
        <svg className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <span className="text-indigo-700 dark:text-indigo-300 font-medium">
        {label}:
      </span>
      <span className="text-indigo-600 dark:text-indigo-400">
        {value}
      </span>
    </div>
  );
}
