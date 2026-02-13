import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, FormControlLabel, Switch } from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import TextFieldsIcon from '@mui/icons-material/TextFields';

// Note: These settings are UI-only placeholders. 
// To make them functional, implement state management and theme switching logic.
export default function AppearanceSettings() {
  return (
    <Box>
      {/* Theme Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PaletteIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Theme
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
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel>Color Theme</InputLabel>
            <Select
              value="light"
              label="Color Theme"
              disabled
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark (Coming Soon)</MenuItem>
              <MenuItem value="auto">Auto (Coming Soon)</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            Choose your preferred color theme. Dark mode coming in a future update!
          </Typography>
        </Paper>
      </Box>

      {/* Display Settings */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextFieldsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Display
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
          <FormControl fullWidth sx={{ mb: 2.5 }}>
            <InputLabel>Font Size</InputLabel>
            <Select
              value="medium"
              label="Font Size"
              disabled
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Compact mode
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reduce spacing for more content on screen
                </Typography>
              </Box>
            }
            sx={{ mb: 2, ml: 0, alignItems: 'flex-start' }}
            disabled
          />
        </Paper>
      </Box>

      {/* Interface Preferences */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DarkModeIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Interface
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
                  Show Studio panel
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Display the AI Studio actions sidebar
                </Typography>
              </Box>
            }
            sx={{ mb: 2, ml: 0, alignItems: 'flex-start' }}
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Smooth animations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enable smooth transitions and animations
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
