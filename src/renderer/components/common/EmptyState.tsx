import { Box, Typography, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  title = 'Start a conversation',
  description = 'Select a model and send a message to begin chatting with AI',
  icon
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 480,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            bgcolor: 'primary.light',
            borderRadius: 3,
            mb: 3,
          }}
        >
          {icon || <SmartToyIcon sx={{ fontSize: 40, color: 'primary.dark' }} />}
        </Box>
        
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </Box>
  );
}
