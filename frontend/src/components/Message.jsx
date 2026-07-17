export default function Message({ message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

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
