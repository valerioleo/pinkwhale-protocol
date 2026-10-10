/** A local teaching model. No wallets or transactions are involved. */
export const DAY = 86_400;
export const TERM = 30 * DAY;
export const HORIZON = TERM + 5 * DAY;
export const PRINCIPAL_USDC = 100;
export const INTEREST_USDC = 10;

export type LoanStatus = 'ready' | 'open' | 'repaid' | 'claimed';
export type Notice = {title: string; detail: string; code?: string; blocked?: boolean};
export type LoanState = {status: LoanStatus; elapsed: number; resolvedAt: number | null; notice: Notice | null};
export type LoanAction = {type: 'open' | 'repay' | 'claim' | 'reset'} | {type: 'advance'; elapsed: number};

export const initialLoan: LoanState = {status: 'ready', elapsed: 0, resolvedAt: null, notice: null};
export const amountDue = (elapsed: number) =>
  PRINCIPAL_USDC + (INTEREST_USDC * Math.min(TERM, Math.max(0, elapsed))) / TERM;

export function loanReducer(state: LoanState, action: LoanAction): LoanState {
  switch (action.type) {
    case 'reset': return initialLoan;
    case 'open':
      if (state.status !== 'ready') return state;
      return {...state, status: 'open', notice: {
        title: 'One match. Both futures are now written.',
        detail: 'The borrower has 100 USDC. Pinkwhale holds the ape and has created the repayment and default orders. Move the clock to see what changes.',
        code: 'LoanExecuted'
      }};
    case 'advance':
      if (state.status === 'ready' || !Number.isFinite(action.elapsed)) return state;
      return {...state, elapsed: Math.max(0, Math.min(HORIZON, Math.round(action.elapsed))), notice: null};
    case 'repay':
      if (state.status === 'ready') return state;
      if (state.status === 'repaid' || state.status === 'claimed') return {...state, notice: {
        title: 'This loan has already ended.',
        detail: 'Moving the clock does not undo a settled transfer. Start again to explore the other ending.', blocked: true
      }};
      // Seaport's endTime is exclusive. At TERM neither order is open.
      if (state.elapsed >= TERM) return {...state, notice: {
        title: 'The repayment window is closed.',
        detail: 'Seaport rejects the order on time alone, before Pinkwhale is even consulted.', code: 'InvalidTime', blocked: true
      }};
      return {...state, status: 'repaid', resolvedAt: state.elapsed, notice: {
        title: 'The ape goes home. The other future closes.',
        detail: `The borrower pays ${amountDue(state.elapsed).toFixed(2)} USDC to the lender. The default order still exists, but its link to this repayment makes it unfillable. Try claiming after expiry.`,
        code: 'LoanRepaid'
      }};
    case 'claim':
      if (state.status === 'ready') return state;
      if (state.status === 'claimed') return {...state, notice: {
        title: 'The collateral has already been claimed.',
        detail: 'An order can only be filled once. Start again to explore another outcome.', code: 'OrderAlreadyFilled', blocked: true
      }};
      if (state.elapsed < TERM + 1) return {...state, notice: {
        title: 'The lender has to wait.',
        detail: 'The default order opens one second after the repayment deadline. Move the clock past expiry and try again.', code: 'InvalidTime', blocked: true
      }};
      if (state.status === 'repaid') return {...state, notice: {
        title: 'Repaid means repaid. Even after expiry.',
        detail: 'Pinkwhale checks the linked repayment order. It was filled, so the claim is refused before any collateral moves.', code: 'UpstreamOrderAlreadyFulfilled', blocked: true
      }};
      return {...state, status: 'claimed', resolvedAt: state.elapsed, notice: {
        title: 'The lender takes the ape, for zero.',
        detail: 'The default order has an empty consideration array. There is nothing to pay, and no liquidation engine to call.', code: 'DefaultedCollateralClaimed'
      }};
  }
}
