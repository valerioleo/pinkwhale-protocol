'use client';

import {CDPReactProvider} from '@coinbase/cdp-react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState, type ReactNode} from 'react';

/**
 * Email is the only sign-in method on purpose. The social providers each want
 * their own OAuth app registered, and none of them make the demo easier to walk
 * into than an address you already have.
 */
export const Providers = ({children}: {children: ReactNode}) => {
  // Created once per mount rather than at module scope, so a client is never
  // shared between requests on the server.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CDPReactProvider
      config={{
        projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
        appName: 'Pinkwhale playground',
        authMethods: ['email'],
        ethereum: {createOnLogin: 'eoa'}
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </CDPReactProvider>
  );
};
