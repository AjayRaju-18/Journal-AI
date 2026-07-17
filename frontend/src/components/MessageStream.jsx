import EmptyState from './EmptyState';
import Message from './Message';

export default function MessageStream({ messages, onRetryFor }) {
  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 py-8 scrollbar-thin">
      {messages.map((message) => (
        <Message key={message.id} message={message} onRetryFor={onRetryFor} />
      ))}
    </div>
  );
}
