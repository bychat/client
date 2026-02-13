import { Box, Avatar, Paper, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function MessageBubble({ content, role, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <PersonIcon sx={{ fontSize: 20 }} /> : <SmartToyIcon sx={{ fontSize: 20 }} />}
      </Avatar>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {isUser ? 'You' : 'Assistant'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.light' : 'background.paper',
            border: '1px solid',
            borderColor: isUser ? 'primary.main' : 'divider',
            borderRadius: 2,
          }}
        >
          {isUser ? (
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {content}
            </Typography>
          ) : (
            <Box
              sx={{
                '& p': { mb: 1, '&:last-child': { mb: 0 } },
                '& pre': {
                  bgcolor: 'rgba(0,0,0,0.05)',
                  p: 1,
                  borderRadius: 1,
                  overflow: 'auto',
                },
                '& code': {
                  bgcolor: 'rgba(0,0,0,0.05)',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontSize: '0.875em',
                },
              }}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
