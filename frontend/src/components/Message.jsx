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
