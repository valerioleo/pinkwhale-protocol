/**
 * The CDP server account that deploys, and that the faucet mints from.
 *
 * Addressed by name: `getOrCreateAccount` hands back the same account for the same
 * name within a CDP project, so the deploy script and the faucet endpoint sign as one
 * account without either being told its address.
 */
export const ADMIN_ACCOUNT = 'pinkwhale-admin';
