import type { RiskLevel } from 'src/actions/customer-analytics';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type ChurnCustomer = {
  customerId: number;
  customerName: string;
  churnRisk: number;
  riskLevel: RiskLevel;
  revenueAtRisk: number;
};

type Props = {
  churnData: ChurnCustomer[];
};

export function ChurnRiskChart({ churnData }: Props) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!Array.isArray(churnData) || churnData.length === 0) {
      return [
        { label: 'High Risk', value: 0, color: theme.palette.error.main },
        { label: 'Medium Risk', value: 0, color: theme.palette.warning.main },
        { label: 'Low Risk', value: 0, color: theme.palette.success.main },
      ];
    }

    const riskLevels = churnData.reduce(
      (acc, customer) => {
        acc[customer.riskLevel] += 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    return [
      { label: 'High Risk', value: riskLevels.high, color: theme.palette.error.main },
      { label: 'Medium Risk', value: riskLevels.medium, color: theme.palette.warning.main },
      { label: 'Low Risk', value: riskLevels.low, color: theme.palette.success.main },
    ];
  }, [churnData, theme.palette]);

  const totalRevenueAtRisk = useMemo(() => {
    if (!Array.isArray(churnData) || churnData.length === 0) {
      return 0;
    }
    return churnData
      .filter(customer => customer.riskLevel === 'high')
      .reduce((total, customer) => total + customer.revenueAtRisk, 0);
  }, [churnData]);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartData.map(item => item.color),
    labels: chartData.map(item => item.label),
    stroke: { width: 0 },
    dataLabels: { enabled: true, style: { colors: ['#fff'] } },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} customers`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => fNumber(Array.isArray(churnData) ? churnData.length : 0),
            },
          },
        },
      },
    },
  });

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h6">Churn Risk Analysis</Typography>

        <Chart
          type="donut"
          series={chartData.map(item => item.value)}
          options={{
            ...chartOptions,
            chart: {
              ...(chartOptions?.chart ?? {}),
              height: 240,
            },
          }}
        />

        <Stack spacing={2}>
          {chartData.map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Stack>
              <Typography variant="subtitle2">
                {fNumber(item.value)}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="error.dark">
              Revenue at Risk (High Risk)
            </Typography>
            <Typography variant="h4" color="error.main">
              {fCurrency(totalRevenueAtRisk)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Potential revenue loss from high-risk customers
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}