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
 * The hue each role's blobatar is tinted to, taken from the two grounds
 * valeriohq is built on: rust for the warm one, teal for the dark one.
 *
 * These are OKLCh angles, which is what blobatar builds its palette in — an HSL
 * angle for the same colour lands somewhere else entirely.
 *
 *   #9a4a22 rust -> oklch h 45
 *   #022331 teal -> oklch h 231
 */
export const PERSONA_HUE: Record<Persona, number> = {
  borrower: 45,
  lender: 231
};
