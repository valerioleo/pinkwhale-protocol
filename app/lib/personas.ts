'use client';

import {useCreateEvmEoaAccount, useEvmAccounts} from '@coinbase/cdp-hooks';
import {useMutation} from '@tanstack/react-query';
import {useEffect} from 'react';
import type {Address} from 'viem';

export type Persona = 'lender' | 'borrower';

export type Personas = {lender: Address; borrower: Address} | null;

export const usePersonas = (): {personas: Personas; creating: boolean} => {
  const {evmAccounts} = useEvmAccounts();
  const {createEvmEoaAccount} = useCreateEvmEoaAccount();

  const accounts = evmAccounts ?? [];
  const needsSecond = accounts.length === 1;

  const create = useMutation({mutationFn: () => createEvmEoaAccount()});

  useEffect(() => {
    if (needsSecond && create.isIdle) create.mutate();
  }, [needsSecond, create]);

  if (accounts.length < 2) return {personas: null, creating: create.isPending};

  return {
    personas: {
      lender: accounts[0]!.address as Address,
      borrower: accounts[1]!.address as Address
    },
    creating: false
  };
};

/**
 * The accent each role wears, and the hue its blobatar is tinted to.
 *
 * Derived from the same two colours the article uses, so a persona looks like
 * itself in the stripe down its card and in the face at the top of it.
 */
export const PERSONA_HUE: Record<Persona, number> = {
  borrower: 36,
  lender: 185
};
