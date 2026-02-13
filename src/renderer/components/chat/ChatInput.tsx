import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  input: string;
  loading: boolean;
  disabled: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ChatInput({
  input,
  loading,
  disabled,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          bgcolor: 'background.default',
          borderRadius: 3,
          px: 2,
          py: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          '&:focus-within': {
            borderColor: 'primary.main',
          },
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={disabled || loading}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: { px: 1 },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!input.trim() || loading || disabled}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
