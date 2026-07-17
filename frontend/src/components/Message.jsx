import FileChips from './FileChips';
import ConfigPills from './ConfigPills';
import StatusCard from './StatusCard';

export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  // System messages (file uploads, status updates)
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-claude-surface-light dark:bg-claude-surface-dark rounded-full text-xs text-claude-text-secondary-light dark:text-claude-text-secondary-dark border border-claude-border-light dark:border-claude-border-dark">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : ''}`}>
      {/* Avatar for assistant */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-semibold text-xs">PP</span>
        </div>
      )}

      {/* Message content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`w-full ${isUser ? 'flex flex-col items-end' : ''}`}>
          {/* Main message bubble */}
          <div className={`rounded-2xl px-5 py-3 ${
            isUser 
              ? 'bg-claude-accent text-white' 
              : 'bg-claude-surface-light dark:bg-claude-surface-dark'
          }`}>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
              isUser ? 'text-white' : 'text-claude-text-primary-light dark:text-claude-text-primary-dark'
            }`}>
              {message.content}
            </p>
          </div>

          {/* User message: Show file chips and config pills below message */}
          {isUser && (message.files || message.config) && (
            <div className="mt-2 flex flex-col items-end gap-2 w-full">
              {/* File chips */}
              {message.files && (message.files.data?.length > 0 || message.files.template) && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {message.files.data?.map((file, index) => (
                    <div key={`data-${index}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ))}
                  {message.files.template && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-xs text-purple-700 dark:text-purple-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{message.files.template.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Config pills */}
              {message.config && (
                <ConfigPills 
                  style={message.config.style} 
                  citationFormat={message.config.citationFormat} 
                />
              )}
            </div>
          )}

          {/* Assistant message: Show status card below message */}
          {isAssistant && message.jobId && !message.error && (
            <StatusCard jobId={message.jobId} />
          )}
          
          {/* Assistant message: Show error state */}
          {isAssistant && message.error && (
            <div className="mt-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Please check your configuration and try again.</span>
              </div>
            </div>
          )}
          
          {/* Assistant message: Show loading state */}
          {isAssistant && message.isLoading && (
            <div className="mt-3 p-4 rounded-2xl bg-claude-surface-light dark:bg-claude-surface-dark border border-claude-border-light dark:border-claude-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
                  Uploading files and initializing...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <span className="text-white font-semibold text-xs">U</span>
        </div>
      )}
    </div>
  );
}
