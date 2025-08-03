import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { AnalyticsChatView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Chat | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AnalyticsChatView />;
}
