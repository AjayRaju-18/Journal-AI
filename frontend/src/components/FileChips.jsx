export default function FileChips({ dataFiles, templateFile, onRemoveData, onRemoveTemplate }) {
  const hasFiles = dataFiles.length > 0 || templateFile;

  if (!hasFiles) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {/* Data file chips */}
      {dataFiles.map((file, index) => (
        <FileChip
          key={`data-${index}`}
          file={file}
          onRemove={() => onRemoveData(index)}
          type="data"
        />
      ))}

      {/* Template file chip */}
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
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
      isData
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
        : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    }`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${
        isData
          ? 'bg-blue-500 text-white'
          : 'bg-purple-500 text-white'
      }`}>
        {isData ? (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* File name */}
      <span className="font-medium max-w-[200px] truncate">
        {file.name}
      </span>

      {/* File size */}
      <span className="text-xs opacity-70">
        ({formatFileSize(file.size)})
      </span>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors ${
          isData
            ? 'hover:bg-blue-200 dark:hover:bg-blue-800'
            : 'hover:bg-purple-200 dark:hover:bg-purple-800'
        }`}
        title="Remove file"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
