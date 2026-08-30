'use client';

import {useCreateEvmEoaAccount, useEvmAccounts} from '@coinbase/cdp-hooks';
import {useEffect, useState} from 'react';
import type {Address} from 'viem';

/**
 * A loan needs two addresses. Nothing in Pinkwhale requires it — there is no
 * `lender != borrower` guard — but a self-loan would demonstrate nothing, because
 * both resolution orders would then be fulfillable by the same person and the
 * whole locked-to-one-caller story disappears.
 *
 * CDP allows up to ten EOAs per signed-in user, so both personas live under one
 * email. Roles are fixed by position: the account that exists at sign-in lends,
 * the one created next borrows. Fixing them keeps "which of my two addresses is
 * this" from becoming a question the visitor has to hold in their head.
 */
export type Persona = 'lender' | 'borrower';

export type Personas = {lender: Address; borrower: Address} | null;

export const usePersonas = (): {personas: Personas; creating: boolean} => {
  const {evmAccounts} = useEvmAccounts();
  const {createEvmEoaAccount} = useCreateEvmEoaAccount();
  const [creating, setCreating] = useState(false);

  const accounts = evmAccounts ?? [];

  useEffect(() => {
    if (accounts.length !== 1 || creating) return;

    setCreating(true);
    createEvmEoaAccount().finally(() => setCreating(false));
    // `accounts.length` is the whole trigger; the callback identity is not stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length]);

  if (accounts.length < 2) return {personas: null, creating};

  return {
    personas: {
      lender: accounts[0]!.address as Address,
      borrower: accounts[1]!.address as Address
    },
    creating
  };
};
