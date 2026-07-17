export default function FileChips({
  dataFiles,
  templateFile,
  imageFiles = [],
  onRemoveData,
  onRemoveTemplate,
  onRemoveImage,
}) {
  const hasFiles = dataFiles.length > 0 || templateFile || imageFiles.length > 0;
  if (!hasFiles) return null;

  return (
    <div className="mb-2.5 flex flex-wrap gap-1.5 animate-panel-reveal">
      {/* Data file chips */}
      {dataFiles.map((file, index) => (
        <FileChip key={`data-${index}`} file={file} onRemove={() => onRemoveData(index)} type="data" />
      ))}

      {/* Template chip */}
      {templateFile && (
        <FileChip file={templateFile} onRemove={onRemoveTemplate} type="template" />
      )}

      {/* Image chips — show tiny thumbnail */}
      {imageFiles.map((file, index) => (
        <ImageChip key={`image-${index}`} file={file} onRemove={() => onRemoveImage(index)} />
      ))}
    </div>
  );
}

/* ── Text-based chip (data / template) ─────────────────────────────────── */
function FileChip({ file, onRemove, type }) {
  const isData = type === 'data';

  const colours = isData
    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
    : 'bg-violet-50 dark:bg-violet-950/40 border-violet-200/70 dark:border-violet-800/60 text-violet-700 dark:text-violet-300';

  const dotColour = isData ? 'bg-blue-500' : 'bg-violet-500';

  const hoverRemove = isData
    ? 'hover:bg-blue-200 dark:hover:bg-blue-800/60'
    : 'hover:bg-violet-200 dark:hover:bg-violet-800/60';

  return (
    <div className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-xs border transition-colors ${colours}`}>
      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotColour}`} />
      <span className="font-medium max-w-[10rem] sm:max-w-[14rem] truncate leading-none">{file.name}</span>
      <span className="opacity-60 tabular-nums">{formatFileSize(file.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors ${hoverRemove}`}
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Image chip with thumbnail preview ──────────────────────────────────── */
function ImageChip({ file, onRemove }) {
  const src = URL.createObjectURL(file);

  return (
    <div className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-lg text-xs border border-amber-200/70 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 transition-colors">
      {/* Thumbnail */}
      <img
        src={src}
        alt={file.name}
        onLoad={() => URL.revokeObjectURL(src)}
        className="w-5 h-5 rounded object-cover flex-shrink-0"
      />
      <span className="font-medium max-w-[8rem] sm:max-w-[12rem] truncate leading-none">{file.name}</span>
      <span className="opacity-60 tabular-nums">{formatFileSize(file.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors hover:bg-amber-200 dark:hover:bg-amber-800/60"
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
