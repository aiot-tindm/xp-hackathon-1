import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency, fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  title: string;
  value: number;
  icon: string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percentage';
};

export function CustomerMetricsWidget({
  title,
  value,
  icon,
  color = 'primary',
  prefix = '',
  suffix = '',
  format = 'number',
}: Props) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return fCurrency(value);
      case 'percentage':
        return fPercent(value);
      default:
        return `${prefix}${fNumber(value)}${suffix}`;
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: `${color}.lighter`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon={icon} width={24} sx={{ color: `${color}.main` }} />
          </Box>
        </Box>
        
        <Typography variant="h3" component="div">
          {formatValue()}
        </Typography>
      </Stack>
    </Card>
  );
}