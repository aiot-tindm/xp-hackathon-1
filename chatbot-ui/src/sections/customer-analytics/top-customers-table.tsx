import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

import type { CustomerSegment } from 'src/actions/customer-analytics';

// ----------------------------------------------------------------------

const SEGMENT_COLORS = {
  whale: 'secondary',
  vip: 'warning',
  regular: 'success',
  new: 'info',
  churn: 'error',
} as const;

type Customer = {
  customerId: number;
  customerName: string;
  segment: CustomerSegment;
  totalSpent: number;
  orderCount: number;
  clv: number;
  lastOrderDate: string;
};

type Props = {
  customers: Customer[];
};

export function TopCustomersTable({ customers }: Props) {
  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 3, pb: 0 }}>
        Top Customers by CLV
      </Typography>
      
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Segment</TableCell>
              <TableCell align="right">Total Spent</TableCell>
              <TableCell align="right">Orders</TableCell>
              <TableCell align="right">CLV</TableCell>
              <TableCell align="right">Last Order</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customerId} hover>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {customer.customerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Typography variant="subtitle2">
                        {customer.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {customer.customerId}
                      </Typography>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Label
                    variant="soft"
                    color={SEGMENT_COLORS[customer.segment]}
                  >
                    {customer.segment.toUpperCase()}
                  </Label>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {fCurrency(customer.totalSpent)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2">
                    {fNumber(customer.orderCount)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                    {fCurrency(customer.clv)}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {fDate(customer.lastOrderDate)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}