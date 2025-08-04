import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { fCurrency, fNumber, fPercent } from 'src/utils/format-number';

import type { CustomerSegment } from 'src/actions/customer-analytics';

// ----------------------------------------------------------------------

const SEGMENT_CONFIG = {
  whale: {
    label: 'Whale',
    color: '#7C3AED',
    icon: '🐋',
  },
  vip: {
    label: 'VIP',
    color: '#F59E0B',
    icon: '👑',
  },
  regular: {
    label: 'Regular',
    color: '#10B981',
    icon: '👤',
  },
  new: {
    label: 'New',
    color: '#3B82F6',
    icon: '🌟',
  },
  churn: {
    label: 'Churn Risk',
    color: '#EF4444',
    icon: '⚠️',
  },
} as const;

type Props = {
  segment: CustomerSegment;
  data: {
    count: number;
    percentage: number;
    totalRevenue: number;
    avgClv: number;
  };
  onClick?: () => void;
  selected?: boolean;
};

export function CustomerSegmentCard({ segment, data, onClick, selected = false }: Props) {
  const config = SEGMENT_CONFIG[segment];
  
  return (
    <Card
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        border: selected ? 2 : 1,
        borderColor: selected ? `${config.color}` : 'divider',
        bgcolor: selected ? alpha(config.color, 0.08) : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8],
        } : {},
      }}
      onClick={onClick}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" component="span">
              {config.icon}
            </Typography>
            <Typography variant="h6" sx={{ color: config.color }}>
              {config.label}
            </Typography>
          </Stack>
          <Typography variant="h3" sx={{ color: config.color }}>
            {fNumber(data.count)}
          </Typography>
        </Box>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Percentage
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {fPercent(data.percentage)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Revenue
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {fCurrency(data.totalRevenue)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Avg CLV
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {fCurrency(data.avgClv)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}