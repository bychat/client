import { Box } from '@mui/material';
import MessageBubble from '../common/MessageBubble';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, py: 3 }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          role={message.role}
          timestamp={message.timestamp}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}
