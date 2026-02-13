import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GeneralSettings from './settings/GeneralSettings';
import ModelSettings from './settings/ModelSettings';
import AppearanceSettings from './settings/AppearanceSettings';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  models: OllamaModel[];
  currentModel: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SettingsDialog({
  open,
  onClose,
  models,
  currentModel,
}: SettingsDialogProps) {
  const [tabValue, setTabValue] = useState(0);

  // Reset to first tab when dialog opens
  useEffect(() => {
    if (open) {
      setTabValue(0);
    }
  }, [open]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '500px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ px: 3 }}
        >
          <Tab 
            icon={<SettingsIcon fontSize="small" />} 
            iconPosition="start" 
            label="General" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<SmartToyIcon fontSize="small" />} 
            iconPosition="start" 
            label="AI Models" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<PaletteIcon fontSize="small" />} 
            iconPosition="start" 
            label="Appearance" 
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ px: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <GeneralSettings />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ModelSettings models={models} currentModel={currentModel} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <AppearanceSettings />
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}
