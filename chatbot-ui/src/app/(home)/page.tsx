import type { Metadata } from 'next';

import { JwtSignInView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Minimals UI: The starting point for your next project',
  description:
    'The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style',
};

export default function Page() {
  return <JwtSignInView />;
}
