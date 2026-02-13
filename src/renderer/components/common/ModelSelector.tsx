import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, IconButton, Box, SelectChangeEvent } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface ModelSelectorProps {
  models: OllamaModel[];
  selectedModel: string;
  loading: boolean;
  error: string;
  onModelChange: (event: SelectChangeEvent<string>) => void;
  onRefresh: () => void;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

export default function ModelSelector({
  models,
  selectedModel,
  loading,
  error,
  onModelChange,
  onRefresh,
}: ModelSelectorProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <FormControl 
          fullWidth 
          size="small"
          disabled={loading}
          error={!!error}
        >
          <InputLabel>AI Model</InputLabel>
          <Select
            value={selectedModel}
            label="AI Model"
            onChange={onModelChange}
          >
            {models.length === 0 ? (
              <MenuItem disabled>No models available</MenuItem>
            ) : (
              models.map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  {model.name} ({formatBytes(model.size)})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        
        <IconButton
          onClick={onRefresh}
          disabled={loading}
          size="small"
          sx={{ mt: 0.5 }}
        >
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
