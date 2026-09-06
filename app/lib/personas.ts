'use client';

import {useCreateEvmEoaAccount, useEvmAccounts} from '@coinbase/cdp-hooks';
import {useMutation} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import type {Address} from 'viem';

export type Persona = 'lender' | 'borrower';

export type Personas = {lender: Address; borrower: Address} | null;

export const usePersonas = (): {personas: Personas} => {
  const {evmAccounts} = useEvmAccounts();
  const {createEvmEoaAccount} = useCreateEvmEoaAccount();

  const accounts = evmAccounts ?? [];
  const needsSecond = accounts.length === 1;

  const create = useMutation({mutationFn: () => createEvmEoaAccount()});

  useEffect(() => {
    if (needsSecond && create.isIdle) create.mutate();
  }, [needsSecond, create]);

  const [first, second] = accounts;

  const pair: Personas =
    first && second
      ? {lender: first.address as Address, borrower: second.address as Address}
      : null;

  /**
   * Latched, because `useEvmAccounts` reports `null` while it refreshes and null is
   * indistinguishable from 'not signed in' at the call site.
   *
   * Unlatched, that blink took `personas` to null, which took every query key with
   * it — `['holdings', undefined]`, `['loans', undefined]` are fresh cache entries
   * holding nothing, so the whole page dropped back to skeletons and recovered a
   * moment later, over and over. The addresses were never in doubt; only our
   * knowledge of them was.
   *
   * So the two answers are kept apart, exactly as `Balance.loaded` keeps 'empty'
   * apart from 'not yet read': null means CDP has not answered and the last answer
   * stands, while a list *is* the answer and replaces it.
   */
  const [latched, setLatched] = useState<Personas>(null);

  // Monotonic: it moves to another complete pair and never back to nothing. An
  // earlier version cleared on an empty list, which is indistinguishable from the
  // same refresh blink one value along. Sign-out is `isSignedIn`'s job, and the
  // page already hides everything on it.
  //
  // Adjusted during render rather than in an effect because this is derived state,
  // not a subscription: React re-runs the component and throws the first pass away,
  // so nothing downstream observes the stale pair.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (pair && (latched?.lender !== pair.lender || latched?.borrower !== pair.borrower)) {
    setLatched(pair);
  }

  return {personas: latched};
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
