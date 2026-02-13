import { Box, Typography, Divider, FormControlLabel, Switch, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';

export default function GeneralSettings() {
  return (
    <Box>
      {/* User Preferences Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            User Preferences
          </Typography>
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Save chat history
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Store your conversations locally for future reference
                </Typography>
              </Box>
            }
            sx={{ mb: 2, ml: 0, alignItems: 'flex-start' }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Show timestamps
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Display message timestamps in chat
                </Typography>
              </Box>
            }
            sx={{ ml: 0, alignItems: 'flex-start' }}
          />
        </Paper>
      </Box>

      {/* Notifications Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Desktop notifications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Show notifications when receiving new messages
                </Typography>
              </Box>
            }
            sx={{ mb: 2, ml: 0, alignItems: 'flex-start' }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={<Switch />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Sound alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Play sound when receiving notifications
                </Typography>
              </Box>
            }
            sx={{ ml: 0, alignItems: 'flex-start' }}
          />
        </Paper>
      </Box>

      {/* Privacy Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Privacy & Security
          </Typography>
        </Box>
        
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Local processing only
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All data stays on your device with Ollama
                </Typography>
              </Box>
            }
            sx={{ mb: 2, ml: 0, alignItems: 'flex-start' }}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={<Switch />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Clear cache on exit
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically clear temporary data when closing the app
                </Typography>
              </Box>
            }
            sx={{ ml: 0, alignItems: 'flex-start' }}
          />
        </Paper>
      </Box>
    </Box>
  );
}
