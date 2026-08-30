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
 * The hue each role's blobatar is tinted to.
 *
 * These are OKLCh angles, not the HSL ones the same two colours give — blobatar
 * builds its palette in OKLCh, and feeding it an HSL angle lands somewhere else
 * entirely, which is why the borrower came out pink against an amber accent.
 *
 *   #e0a144 -> oklch(0.753 0.131 74)
 *   #35b9c4 -> oklch(0.722 0.110 203)
 */
export const PERSONA_HUE: Record<Persona, number> = {
  borrower: 74,
  lender: 203
};
