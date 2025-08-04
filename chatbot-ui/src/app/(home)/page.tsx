import type { Metadata } from 'next';

import { JwtSignInView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Xp Team - Hackathon 2025',
  description:
    'Xp Team - Hackathon 2025',
};

export default function Page() {
  return <JwtSignInView />;
}
