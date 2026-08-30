'use client';

import {CDPReactProvider} from '@coinbase/cdp-react';
import type {ReactNode} from 'react';

/**
 * Email is the only sign-in method on purpose. The social providers each want
 * their own OAuth app registered, and none of them make the demo any easier to
 * walk into than typing an address you already have.
 */
export const Providers = ({children}: {children: ReactNode}) => (
  <CDPReactProvider
    config={{
      projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
      appName: 'Pinkwhale playground',
      authMethods: ['email'],
      ethereum: {createOnLogin: 'eoa'}
    }}
  >
    {children}
  </CDPReactProvider>
);
