'use client';

import './pinkwhale.css';

import {useState} from 'react';
import {toFunctionSelector} from 'viem';

const REPO = 'https://github.com/valerioleo/pinkwhale-protocol/blob/main';

type Attack = {
  id: string;
  title: string;
  detail: string;
  /** The canonical error signature. The selector shown is derived from it, live. */
  signature: string;
  raisedBy: 'Pinkwhale' | 'Seaport';
  test: {file: string; name: string};
};

/**
 * Every attack here is a test in the repo. The selectors are not transcribed;
 * they are computed in the browser from the error signature with viem, which is
 * the same derivation `forge test` matches on.
 */
const ATTACKS: Attack[] = [
  {
    id: 'bypass',
    title: 'Match the two creation orders directly on Seaport',
    detail:
      'Skip executeLoan entirely. The orders are restricted to the Pinkwhale zone, so authorizeOrder fires, and creation orders carry empty extraData, so the abi.decode reverts. Seaport turns a zone revert with no reason data into InvalidRestrictedOrder.',
    signature: 'InvalidRestrictedOrder(bytes32)',
    raisedBy: 'Seaport',
    test: {file: 'test/Guards.t.sol', name: 'test_matchingCreationOrdersDirectly_reverts'}
  },
  {
    id: 'late',
    title: 'Repay after the loan expires',
    detail:
      "There is no repayment deadline to look up. The loan term is the repayment order's validity window, so Seaport rejects the call on time alone, before the zone is consulted.",
    signature: 'InvalidTime(uint256,uint256)',
    raisedBy: 'Seaport',
    test: {file: 'test/Guards.t.sol', name: 'test_repayAfterExpiry_revertsWithSeaportInvalidTime'}
  },
  {
    id: 'stranger-claims',
    title: 'A stranger claims the defaulted collateral',
    detail:
      "The default order's zoneHash is keccak256(upstreamOrderHash, lender). Seaport hands the zone the caller as fulfiller; hash anyone else and the result does not reproduce.",
    signature: 'ZoneHashMismatch()',
    raisedBy: 'Pinkwhale',
    test: {file: 'test/Guards.t.sol', name: 'test_default_byWrongActor_revertsWithZoneHashMismatch'}
  },
  {
    id: 'lender-repays',
    title: 'The lender fulfils the repayment order',
    detail:
      'Same guard, other direction. The repayment order is bound to the borrower, so the lender cannot buy the collateral out from under them at the agreed price.',
    signature: 'ZoneHashMismatch()',
    raisedBy: 'Pinkwhale',
    test: {file: 'test/Guards.t.sol', name: 'test_repayment_byWrongActor_revertsWithZoneHashMismatch'}
  },
  {
    id: 'replay',
    title: 'Replay a settled claim: repay, re-borrow, then fulfil the old default order',
    detail:
      "The nastiest one, and the reason the upstream check exists. Custody is pooled, so once the borrower takes a second loan on the same ape, Pinkwhale is holding it again and the lender's old default order is still a validated Seaport order pointing straight at it. authorizeOrder turns it away because the repayment order it names has been filled.",
    signature: 'UpstreamOrderAlreadyFulfilled()',
    raisedBy: 'Pinkwhale',
    test: {
      file: 'test/Guards.t.sol',
      name: 'test_defaultOrderFromRepaidLoan_cannotClaimLaterCollateral'
    }
  },
  {
    id: 'recipient',
    title: 'Point the collateral at yourself instead of Pinkwhale',
    detail:
      'executeLoan walks every consideration item on the lender order. Send one somewhere other than Pinkwhale and the collateral never enters custody, which would leave the resolution orders offering something the contract does not have.',
    signature: 'RecipientMustBePinkwhale()',
    raisedBy: 'Pinkwhale',
    test: {file: 'test/Guards.t.sol', name: 'test_collateralNotDirectedToPinkwhale_reverts'}
  },
  {
    id: 'duration',
    title: 'Give the borrower a longer term than the lender agreed to',
    detail:
      'The repayment window is built from the lender terms, so a longer borrower duration would quietly be ignored. It is caught up front instead.',
    signature: 'DurationExceedsLenderMaximum()',
    raisedBy: 'Pinkwhale',
    test: {file: 'test/Guards.t.sol', name: 'test_borrowerDurationLongerThanLenders_reverts'}
  },
  {
    id: 'spoof-events',
    title: 'Call validateOrder directly and emit a fake LoanRepaid',
    detail:
      'A zone hook that anyone can call is a zone hook that anyone can use to emit protocol events an indexer will take at face value. Both hooks require msg.sender to be Seaport.',
    signature: 'OnlySeaport()',
    raisedBy: 'Pinkwhale',
    test: {file: 'test/Guards.t.sol', name: 'test_validateOrder_revertsForNonSeaportCaller'}
  }
];

export const AttackPlayground = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="pw-widget pw-playground">
      <div className="pw-widget__body">
        <p className="pw-widget__lead">
          Every attack below is a real test in the repo. The 4-byte selectors are computed in your
          browser from the error signature, the same way <code>forge test</code> matches them.
        </p>

        <ul className="pw-attacks">
          {ATTACKS.map((attack) => {
            const selector = toFunctionSelector(attack.signature);
            const isOpen = open === attack.id;

            return (
              <li key={attack.id} className={isOpen ? 'pw-attack pw-attack--open' : 'pw-attack'}>
                <button
                  className="pw-attack__head"
                  onClick={() => setOpen(isOpen ? null : attack.id)}
                >
                  <span className="pw-attack__title">{attack.title}</span>
                  <span className="pw-attack__revert pw-hex">
                    {attack.signature.replace(/\(.*/, '')}
                    <span className="pw-attack__selector">{selector}</span>
                  </span>
                </button>

                {isOpen ? (
                  <div className="pw-attack__body">
                    <p>{attack.detail}</p>
                    <p className="pw-attack__meta">
                      raised by <strong>{attack.raisedBy}</strong>, proven by{' '}
                      <a href={`${REPO}/${attack.test.file}`}>
                        <code>{attack.test.name}</code>
                      </a>
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
};
