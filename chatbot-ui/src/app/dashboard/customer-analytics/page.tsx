import type { Metadata } from 'next';

import { CustomerAnalyticsView } from 'src/sections/customer-analytics';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: 'Customer Analytics' };

export default function Page() {
  return <CustomerAnalyticsView />;
}