import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
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

interface ModelSettingsProps {
  models: OllamaModel[];
  currentModel: string;
}

export default function ModelSettings({ models, currentModel }: ModelSettingsProps) {
  const [settings, setSettings] = useState<TitleGenerationSettings>({
    enabled: true,
    model: '',
    prompt: '',
  });
  const [defaultPrompt, setDefaultPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

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
      setTimeout(() => setSaved(false), 3000);
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
    <Box>
      {/* AI Title Generation Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            AI Title Generation
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
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Enable AI-powered title generation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  When enabled, a language model will generate descriptive titles for your chats.
                  When disabled, titles will be the first 30 characters of your message.
                </Typography>
              </Box>
            }
            sx={{ mb: 3, ml: 0, alignItems: 'flex-start' }}
          />

          {/* Model Selection */}
          <FormControl fullWidth disabled={!settings.enabled} sx={{ mb: 3 }}>
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

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a specific model for title generation, or leave empty to use the same model as your chat.
            Smaller/faster models work well for title generation.
          </Typography>

          {/* Custom Prompt */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Title Generation Prompt
              </Typography>
              <Button
                size="small"
                startIcon={<RestoreIcon />}
                onClick={handleRestoreDefaultPrompt}
                disabled={!settings.enabled}
                sx={{ textTransform: 'none' }}
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
            <Alert severity="success" sx={{ mb: 2 }}>
              Settings saved successfully!
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button
              onClick={loadSettings}
              variant="outlined"
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
