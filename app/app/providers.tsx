'use client';

import {CDPReactProvider, type Config} from '@coinbase/cdp-react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {useState, type ReactNode} from 'react';

/**
 * Hoisted out of the component so its identity never changes.
 *
 * As an inline literal this was a fresh object on every render of `Providers`,
 * which is the sort of thing an SDK re-initialises on — and a re-initialising
 * provider takes its subtree with it, resetting every piece of component state
 * below.
 *
 * Email is the only sign-in method on purpose. The social providers each want
 * their own OAuth app registered, and none of them make the demo easier to walk
 * into than an address you already have.
 */
const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
  appName: 'Pinkwhale playground',
  authMethods: ['email'],
  ethereum: {createOnLogin: 'eoa'}
};

export const Providers = ({children}: {children: ReactNode}) => {
  // Created once per mount rather than at module scope, so a client is never
  // shared between requests on the server.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <CDPReactProvider config={CDP_CONFIG}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </CDPReactProvider>
  );
};
