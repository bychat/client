import { Box, Typography, IconButton, Divider, Paper, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ActionCard from '../common/ActionCard';

interface StudioAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  beta?: boolean;
}

interface StudioPanelProps {
  studioWidth: number;
  studioActions: StudioAction[];
  onActionClick: (actionId: string, actionLabel: string) => void;
  onActionEdit?: (actionId: string) => void;
}

export default function StudioPanel({
  studioWidth,
  studioActions,
  onActionClick,
  onActionEdit,
}: StudioPanelProps) {
  return (
    <Box
      sx={{
        width: studioWidth,
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Studio Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Studio
        </Typography>
        <IconButton size="small">
          <MenuIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Studio Actions Grid */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
          }}
        >
          {studioActions.map((action) => (
            <ActionCard
              key={action.id}
              label={action.label}
              icon={action.icon}
              color={action.color}
              bgColor={action.bgColor}
              beta={action.beta}
              onClick={() => onActionClick(action.id, action.label)}
              onEdit={onActionEdit ? () => onActionEdit(action.id) : undefined}
            />
          ))}
        </Box>

        {/* Deep Dive Section */}
        <Divider sx={{ my: 2 }} />
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Deep Dive
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Analyze and explore content in detail with advanced AI tools
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 2 }}
          >
            Explore Tools
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
