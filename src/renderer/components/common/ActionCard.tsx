import { Paper, Box, Typography, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface ActionCardProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  beta?: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

export default function ActionCard({
  label,
  icon,
  color,
  bgColor,
  beta,
  onClick,
  onEdit,
}: ActionCardProps) {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: bgColor,
        cursor: 'pointer',
        position: 'relative',
        border: '1px solid transparent',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: color,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ color, mb: 1 }}>
          {icon}
        </Box>
        {onEdit && (
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{ p: 0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Typography variant="body2" fontWeight={500} sx={{ color: '#202124' }}>
        {label}
      </Typography>
      {beta && (
        <Chip
          label="BETA"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            height: 18,
            fontSize: '0.6rem',
            bgcolor: 'rgba(0,0,0,0.08)',
            color: '#5f6368',
          }}
        />
      )}
    </Paper>
  );
}
