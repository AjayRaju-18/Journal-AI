export default function FileChips({ dataFiles, templateFile, onRemoveData, onRemoveTemplate }) {
  const hasFiles = dataFiles.length > 0 || templateFile;
  if (!hasFiles) return null;

  return (
    <div className="mb-2.5 flex flex-wrap gap-1.5 animate-panel-reveal">
      {dataFiles.map((file, index) => (
        <FileChip
          key={`data-${index}`}
          file={file}
          onRemove={() => onRemoveData(index)}
          type="data"
        />
      ))}
      {templateFile && (
        <FileChip
          file={templateFile}
          onRemove={onRemoveTemplate}
          type="template"
        />
      )}
    </div>
  );
}

function FileChip({ file, onRemove, type }) {
  const isData = type === 'data';

  return (
    <div
      className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-xs border transition-colors ${
        isData
          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
          : 'bg-violet-50 dark:bg-violet-950/40 border-violet-200/70 dark:border-violet-800/60 text-violet-700 dark:text-violet-300'
      }`}
    >
      {/* Coloured dot indicator */}
      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${isData ? 'bg-blue-500' : 'bg-violet-500'}`} />

      {/* File name — truncates at ~18ch on mobile, more on desktop */}
      <span className="font-medium max-w-[10rem] sm:max-w-[14rem] truncate leading-none">
        {file.name}
      </span>

      {/* File size */}
      <span className="opacity-60 tabular-nums">
        {formatFileSize(file.size)}
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors ${
          isData
            ? 'hover:bg-blue-200 dark:hover:bg-blue-800/60'
            : 'hover:bg-violet-200 dark:hover:bg-violet-800/60'
        }`}
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${+(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
