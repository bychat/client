import { Box, IconButton, Typography, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

interface ChatHeaderProps {
  userEmail?: string | null;
  onMenuClick: () => void;
  onNewChat: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export default function ChatHeader({
  userEmail,
  onMenuClick,
  onNewChat,
  onSettingsClick,
  onLogout,
}: ChatHeaderProps) {
  const getUserInitials = (email: string | null | undefined): string => {
    if (!email) return '?';
    // Extract username part before @ and take first character
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase();
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left Section: Menu and New Chat */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onMenuClick} size="small">
          <MenuIcon />
        </IconButton>
        
        <IconButton 
          onClick={onNewChat}
          size="small"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        
        <Typography variant="h6" fontWeight={600} sx={{ ml: 1 }}>
          ByChat
        </Typography>
      </Box>

      {/* Right Section: Settings, User Avatar, Logout */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onSettingsClick} size="small">
          <SettingsIcon />
        </IconButton>
        
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'secondary.main',
            fontSize: '0.875rem',
          }}
        >
          {getUserInitials(userEmail)}
        </Avatar>
        
        <IconButton onClick={onLogout} size="small" color="error">
          <LogoutIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
