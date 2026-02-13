import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';

interface TitleGenerationSettings {
  enabled: boolean;
  model: string;
  prompt: string;
}

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface TitleSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  models: OllamaModel[];
  currentModel: string;
}

export default function TitleSettingsDialog({
  open,
  onClose,
  models,
  currentModel,
}: TitleSettingsDialogProps) {
  const [settings, setSettings] = useState<TitleGenerationSettings>({
    enabled: true,
    model: '',
    prompt: '',
  });
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings when dialog opens
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    try {
      const [settingsResult, promptResult] = await Promise.all([
        window.electronAPI.getTitleSettings(),
        window.electronAPI.getDefaultTitlePrompt(),
      ]);
      
      if (settingsResult.settings) {
        setSettings(settingsResult.settings);
      }
      if (promptResult.prompt) {
        setDefaultPrompt(promptResult.prompt);
      }
    } catch (error) {
      console.error('Failed to load title settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await window.electronAPI.setTitleSettings(settings);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to save title settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefaultPrompt = () => {
    setSettings((prev) => ({ ...prev, prompt: defaultPrompt }));
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSettings((prev) => ({ ...prev, model: event.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Title Generation Settings</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Enable/Disable Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                color="primary"
              />
            }
            label="Enable AI-powered title generation"
          />

          <Typography variant="body2" color="text.secondary">
            When enabled, a language model will generate descriptive titles for your chats.
            When disabled, titles will be the first 30 characters of your message.
          </Typography>

          {/* Model Selection */}
          <FormControl fullWidth disabled={!settings.enabled}>
            <InputLabel>Model for Title Generation</InputLabel>
            <Select
              value={settings.model}
              label="Model for Title Generation"
              onChange={handleModelChange}
            >
              <MenuItem value="">
                <em>Use current chat model ({currentModel || 'none selected'})</em>
              </MenuItem>
              {models.map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            Select a specific model for title generation, or leave empty to use the same model as your chat.
            Smaller/faster models work well for title generation.
          </Typography>

          {/* Custom Prompt */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">Title Generation Prompt</Typography>
              <Button
                size="small"
                startIcon={<RestoreIcon />}
                onClick={handleRestoreDefaultPrompt}
                disabled={!settings.enabled}
              >
                Restore Default
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={settings.prompt}
              onChange={(e) => setSettings((prev) => ({ ...prev, prompt: e.target.value }))}
              placeholder={defaultPrompt}
              disabled={!settings.enabled}
              helperText="Use {message} as a placeholder for the first user message"
            />
          </Box>

          {saved && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Settings saved successfully!
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
