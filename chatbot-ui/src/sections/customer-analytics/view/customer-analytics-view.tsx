'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { 
  getCustomerAnalyticsOverview, 
  getChurnPrediction,
  type CustomerAnalyticsOverview,
  type ChurnPrediction,
  type BusinessType,
  type CustomerSegment
} from 'src/actions/customer-analytics';

import { Iconify } from 'src/components/iconify';

import { CustomerSegmentCard } from '../customer-segment-card';
import { CustomerMetricsWidget } from '../customer-metrics-widget';
import { TopCustomersTable } from '../top-customers-table';
import { ChurnRiskChart } from '../churn-risk-chart';

// ----------------------------------------------------------------------

export function CustomerAnalyticsView() {
  const [analyticsData, setAnalyticsData] = useState<CustomerAnalyticsOverview | null>(null);
  const [churnData, setChurnData] = useState<ChurnPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState<BusinessType>('default');
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | ''>('');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching analytics with params:', { businessType, selectedSegment });

      const [analyticsResponse, churnResponse] = await Promise.all([
        getCustomerAnalyticsOverview({
          businessType,
          segment: selectedSegment || undefined,
          limit: 20,
        }),
        getChurnPrediction({
          businessType,
          days: 90,
        }),
      ]);

      console.log('Analytics response:', analyticsResponse);
      console.log('Churn response:', churnResponse);

      setAnalyticsData(analyticsResponse);
      setChurnData(churnResponse);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [businessType, selectedSegment]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleBusinessTypeChange = useCallback((newBusinessType: BusinessType) => {
    setBusinessType(newBusinessType);
  }, []);

  const handleSegmentChange = useCallback((newSegment: CustomerSegment | '') => {
    setSelectedSegment(newSegment);
  }, []);

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400 
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading customer analytics...
            </Typography>
          </Stack>
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent maxWidth="xl">
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Iconify icon="solar:danger-bold" width={48} color="error.main" />
            <Typography variant="h6" color="error">
              Failed to load analytics data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={fetchAnalytics}
              startIcon={<Iconify icon="solar:refresh-bold" />}
            >
              Retry
            </Button>
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack>
            <Typography variant="h4">Customer Analytics</Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive customer insights and segmentation analysis
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={businessType}
                label="Business Type"
                onChange={(e) => handleBusinessTypeChange(e.target.value as BusinessType)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="high_value">High Value</MenuItem>
                <MenuItem value="small_business">Small Business</MenuItem>
                <MenuItem value="high_frequency">High Frequency</MenuItem>
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="fashion_sports">Fashion & Sports</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Segment</InputLabel>
              <Select
                value={selectedSegment}
                label="Segment"
                onChange={(e) => handleSegmentChange(e.target.value as CustomerSegment | '')}
              >
                <MenuItem value="">All Segments</MenuItem>
                <MenuItem value="whale">Whale</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="churn">Churn</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={fetchAnalytics}
              startIcon={<Iconify icon="solar:refresh-bold" />}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {/* Overview Metrics */}
        {analyticsData && analyticsData.data && analyticsData.data.summary && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <CustomerMetricsWidget
                title="Total Customers"
                value={analyticsData.data.summary.totalCustomers || 0}
                icon="solar:users-group-rounded-bold"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <CustomerMetricsWidget
                title="Active Customers"
                value={analyticsData.data.summary.activeCustomers || 0}
                icon="solar:user-check-rounded-bold"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <CustomerMetricsWidget
                title="Total Revenue"
                value={analyticsData.data.summary.totalRevenue || 0}
                prefix="$"
                format="currency"
                icon="solar:dollar-minimalistic-bold"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <CustomerMetricsWidget
                title="Avg Order Value"
                value={analyticsData.data.summary.averageOrderValue || 0}
                prefix="$"
                format="currency"
                icon="solar:bag-4-bold"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <CustomerMetricsWidget
                title="Churn Rate"
                value={analyticsData.data.summary.churnRate || 0}
                suffix="%"
                format="percentage"
                icon="solar:logout-3-bold"
                color="error"
              />
            </Grid>
          </Grid>
        )}

        {/* Customer Segments */}
        {analyticsData && analyticsData.data && analyticsData.data.segments && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Customer Segments
              </Typography>
            </Grid>
            {Object.entries(analyticsData.data.segments).map(([segment, data]) => (
              <Grid item xs={12} sm={6} md={2.4} key={segment}>
                <CustomerSegmentCard
                  segment={segment as CustomerSegment}
                  data={data}
                  onClick={() => setSelectedSegment(segment as CustomerSegment)}
                  selected={selectedSegment === segment}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Charts and Tables */}
        <Grid container spacing={3}>
          {/* Top Customers */}
          <Grid item xs={12} lg={8}>
            {analyticsData && analyticsData.data && analyticsData.data.topCustomers && (
              <TopCustomersTable customers={analyticsData.data.topCustomers} />
            )}
          </Grid>

          {/* Churn Risk Chart */}
          <Grid item xs={12} lg={4}>
            {churnData && churnData.data && (
              <ChurnRiskChart churnData={churnData.data} />
            )}
          </Grid>
        </Grid>
      </Stack>
    </DashboardContent>
  );
}