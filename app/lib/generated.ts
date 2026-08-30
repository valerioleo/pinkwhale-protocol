import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConduitController16
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
export const conduitController16Abi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'cancelOwnershipTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'createConduit',
    outputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'channelIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getChannel',
    outputs: [{ name: 'channel', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'channel', internalType: 'address', type: 'address' },
    ],
    name: 'getChannelStatus',
    outputs: [{ name: 'isOpen', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'getChannels',
    outputs: [
      { name: 'channels', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getConduit',
    outputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'exists', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getConduitCodeHashes',
    outputs: [
      { name: 'creationCodeHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'runtimeCodeHash', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'getKey',
    outputs: [{ name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'getPotentialOwner',
    outputs: [
      { name: 'potentialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'getTotalChannels',
    outputs: [
      { name: 'totalChannels', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'ownerOf',
    outputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'newPotentialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'channel', internalType: 'address', type: 'address' },
      { name: 'isOpen', internalType: 'bool', type: 'bool' },
    ],
    name: 'updateChannel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'conduit',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'conduitKey',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'NewConduit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'conduit',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newPotentialOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PotentialOwnerUpdated',
  },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'CallerIsNotNewPotentialOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'CallerIsNotOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'ChannelOutOfRange',
  },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'ConduitAlreadyExists',
  },
  { type: 'error', inputs: [], name: 'InvalidCreator' },
  { type: 'error', inputs: [], name: 'InvalidInitialOwner' },
  {
    type: 'error',
    inputs: [
      { name: 'conduit', internalType: 'address', type: 'address' },
      { name: 'newPotentialOwner', internalType: 'address', type: 'address' },
    ],
    name: 'NewPotentialOwnerAlreadySet',
  },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'NewPotentialOwnerIsZeroAddress',
  },
  { type: 'error', inputs: [], name: 'NoConduit' },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'NoPotentialOwnerCurrentlySet',
  },
] as const

/**
 *
 */
export const conduitController16Address = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const

/**
 *
 */
export const conduitController16Config = {
  address: conduitController16Address,
  abi: conduitController16Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CryptoPunks
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const cryptoPunksAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'baseTokenURI', internalType: 'string', type: 'string' },
      { name: 'size', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'collectionSize',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTokenCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'mintNext',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'mintRandom',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  { type: 'error', inputs: [], name: 'CollectionExhausted' },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const cryptoPunksAddress = {
  31337: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  84532: '0xf8a39dC6C55a324a2E0C16503547a108B5eaD949',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const cryptoPunksConfig = {
  address: cryptoPunksAddress,
  abi: cryptoPunksAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pinkwhale
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const pinkwhaleAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'seaportAddress', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'zoneParameters',
        internalType: 'struct ZoneParameters',
        type: 'tuple',
        components: [
          { name: 'orderHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'fulfiller', internalType: 'address', type: 'address' },
          { name: 'offerer', internalType: 'address', type: 'address' },
          {
            name: 'offer',
            internalType: 'struct SpentItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'consideration',
            internalType: 'struct ReceivedItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
          { name: 'orderHashes', internalType: 'bytes32[]', type: 'bytes32[]' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'authorizeOrder',
    outputs: [
      {
        name: 'authorizedOrderMagicValue',
        internalType: 'bytes4',
        type: 'bytes4',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'lenderOrder',
        internalType: 'struct AdvancedOrder',
        type: 'tuple',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'numerator', internalType: 'uint120', type: 'uint120' },
          { name: 'denominator', internalType: 'uint120', type: 'uint120' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'borrowerOrder',
        internalType: 'struct AdvancedOrder',
        type: 'tuple',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'numerator', internalType: 'uint120', type: 'uint120' },
          { name: 'denominator', internalType: 'uint120', type: 'uint120' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'lenderTerms',
        internalType: 'struct LenderRepaymentTerms',
        type: 'tuple',
        components: [
          {
            name: 'consideration',
            internalType: 'struct ConsiderationItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'borrowerTerms',
        internalType: 'struct BorrowerRepaymentTerms',
        type: 'tuple',
        components: [
          {
            name: 'offer',
            internalType: 'struct OfferItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          { name: 'duration', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'criteriaResolvers',
        internalType: 'struct CriteriaResolver[]',
        type: 'tuple[]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'side', internalType: 'enum Side', type: 'uint8' },
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          {
            name: 'criteriaProof',
            internalType: 'bytes32[]',
            type: 'bytes32[]',
          },
        ],
      },
      {
        name: 'fulfillments',
        internalType: 'struct Fulfillment[]',
        type: 'tuple[]',
        components: [
          {
            name: 'offerComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'considerationComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'executeLoan',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getSeaportMetadata',
    outputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      {
        name: 'schemas',
        internalType: 'struct Schema[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'metadata', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'seaport',
    outputs: [
      { name: '', internalType: 'contract SeaportInterface', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'zoneParameters',
        internalType: 'struct ZoneParameters',
        type: 'tuple',
        components: [
          { name: 'orderHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'fulfiller', internalType: 'address', type: 'address' },
          { name: 'offerer', internalType: 'address', type: 'address' },
          {
            name: 'offer',
            internalType: 'struct SpentItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'consideration',
            internalType: 'struct ReceivedItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
          { name: 'orderHashes', internalType: 'bytes32[]', type: 'bytes32[]' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'validateOrder',
    outputs: [
      { name: 'validOrderMagicValue', internalType: 'bytes4', type: 'bytes4' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'DefaultedCollateralClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loanId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'lender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'borrower',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'executor',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'collateral',
        internalType: 'struct ReceivedItem[]',
        type: 'tuple[]',
        components: [
          { name: 'itemType', internalType: 'enum ItemType', type: 'uint8' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
        ],
        indexed: false,
      },
      {
        name: 'principal',
        internalType: 'struct OfferItem[]',
        type: 'tuple[]',
        components: [
          { name: 'itemType', internalType: 'enum ItemType', type: 'uint8' },
          { name: 'token', internalType: 'address', type: 'address' },
          {
            name: 'identifierOrCriteria',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
      {
        name: 'repayment',
        internalType: 'struct ConsiderationItem[]',
        type: 'tuple[]',
        components: [
          { name: 'itemType', internalType: 'enum ItemType', type: 'uint8' },
          { name: 'token', internalType: 'address', type: 'address' },
          {
            name: 'identifierOrCriteria',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
        ],
        indexed: false,
      },
      {
        name: 'expiry',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'defaultOrderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'LoanExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'LoanRepaid',
  },
  { type: 'error', inputs: [], name: 'BorrowerTermsMismatch' },
  { type: 'error', inputs: [], name: 'DurationExceedsLenderMaximum' },
  { type: 'error', inputs: [], name: 'LenderTermsMismatch' },
  { type: 'error', inputs: [], name: 'NoCollateralReceived' },
  { type: 'error', inputs: [], name: 'OnlySeaport' },
  { type: 'error', inputs: [], name: 'RecipientMustBePinkwhale' },
  {
    type: 'error',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'TermsItemMismatch',
  },
  { type: 'error', inputs: [], name: 'TermsLengthMismatch' },
  { type: 'error', inputs: [], name: 'UpstreamOrderAlreadyFulfilled' },
  { type: 'error', inputs: [], name: 'UpstreamOrderNotValidated' },
  { type: 'error', inputs: [], name: 'ZoneHashMismatch' },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const pinkwhaleAddress = {
  31337: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  84532: '0x5C74E81A1bB4513F6C13DfCD322014Ba5d7eC225',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const pinkwhaleConfig = {
  address: pinkwhaleAddress,
  abi: pinkwhaleAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Seaport16
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const seaport16Abi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'conduitController', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: '__activateTstore',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'orders',
        internalType: 'struct OrderComponents[]',
        type: 'tuple[]',
        components: [
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'zone', internalType: 'address', type: 'address' },
          {
            name: 'offer',
            internalType: 'struct OfferItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'consideration',
            internalType: 'struct ConsiderationItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'orderType', internalType: 'enum OrderType', type: 'uint8' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'salt', internalType: 'uint256', type: 'uint256' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
          { name: 'counter', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'cancel',
    outputs: [{ name: 'cancelled', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct AdvancedOrder',
        type: 'tuple',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'numerator', internalType: 'uint120', type: 'uint120' },
          { name: 'denominator', internalType: 'uint120', type: 'uint120' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct CriteriaResolver[]',
        type: 'tuple[]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'side', internalType: 'enum Side', type: 'uint8' },
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          {
            name: 'criteriaProof',
            internalType: 'bytes32[]',
            type: 'bytes32[]',
          },
        ],
      },
      { name: 'fulfillerConduitKey', internalType: 'bytes32', type: 'bytes32' },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'fulfillAdvancedOrder',
    outputs: [{ name: 'fulfilled', internalType: 'bool', type: 'bool' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct AdvancedOrder[]',
        type: 'tuple[]',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'numerator', internalType: 'uint120', type: 'uint120' },
          { name: 'denominator', internalType: 'uint120', type: 'uint120' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct CriteriaResolver[]',
        type: 'tuple[]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'side', internalType: 'enum Side', type: 'uint8' },
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          {
            name: 'criteriaProof',
            internalType: 'bytes32[]',
            type: 'bytes32[]',
          },
        ],
      },
      {
        name: '',
        internalType: 'struct FulfillmentComponent[][]',
        type: 'tuple[][]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '',
        internalType: 'struct FulfillmentComponent[][]',
        type: 'tuple[][]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'fulfillerConduitKey', internalType: 'bytes32', type: 'bytes32' },
      { name: 'recipient', internalType: 'address', type: 'address' },
      { name: 'maximumFulfilled', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillAvailableAdvancedOrders',
    outputs: [
      { name: '', internalType: 'bool[]', type: 'bool[]' },
      {
        name: '',
        internalType: 'struct Execution[]',
        type: 'tuple[]',
        components: [
          {
            name: 'item',
            internalType: 'struct ReceivedItem',
            type: 'tuple',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct Order[]',
        type: 'tuple[]',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct FulfillmentComponent[][]',
        type: 'tuple[][]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '',
        internalType: 'struct FulfillmentComponent[][]',
        type: 'tuple[][]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'fulfillerConduitKey', internalType: 'bytes32', type: 'bytes32' },
      { name: 'maximumFulfilled', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fulfillAvailableOrders',
    outputs: [
      { name: '', internalType: 'bool[]', type: 'bool[]' },
      {
        name: '',
        internalType: 'struct Execution[]',
        type: 'tuple[]',
        components: [
          {
            name: 'item',
            internalType: 'struct ReceivedItem',
            type: 'tuple',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct BasicOrderParameters',
        type: 'tuple',
        components: [
          {
            name: 'considerationToken',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'considerationIdentifier',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'considerationAmount',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'offerer', internalType: 'address payable', type: 'address' },
          { name: 'zone', internalType: 'address', type: 'address' },
          { name: 'offerToken', internalType: 'address', type: 'address' },
          { name: 'offerIdentifier', internalType: 'uint256', type: 'uint256' },
          { name: 'offerAmount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'basicOrderType',
            internalType: 'enum BasicOrderType',
            type: 'uint8',
          },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'salt', internalType: 'uint256', type: 'uint256' },
          {
            name: 'offererConduitKey',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'fulfillerConduitKey',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'totalOriginalAdditionalRecipients',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'additionalRecipients',
            internalType: 'struct AdditionalRecipient[]',
            type: 'tuple[]',
            components: [
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'fulfillBasicOrder',
    outputs: [{ name: 'fulfilled', internalType: 'bool', type: 'bool' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct BasicOrderParameters',
        type: 'tuple',
        components: [
          {
            name: 'considerationToken',
            internalType: 'address',
            type: 'address',
          },
          {
            name: 'considerationIdentifier',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'considerationAmount',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'offerer', internalType: 'address payable', type: 'address' },
          { name: 'zone', internalType: 'address', type: 'address' },
          { name: 'offerToken', internalType: 'address', type: 'address' },
          { name: 'offerIdentifier', internalType: 'uint256', type: 'uint256' },
          { name: 'offerAmount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'basicOrderType',
            internalType: 'enum BasicOrderType',
            type: 'uint8',
          },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'salt', internalType: 'uint256', type: 'uint256' },
          {
            name: 'offererConduitKey',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'fulfillerConduitKey',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'totalOriginalAdditionalRecipients',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'additionalRecipients',
            internalType: 'struct AdditionalRecipient[]',
            type: 'tuple[]',
            components: [
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'fulfillBasicOrder_efficient_6GL6yc',
    outputs: [{ name: 'fulfilled', internalType: 'bool', type: 'bool' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct Order',
        type: 'tuple',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'fulfillerConduitKey', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'fulfillOrder',
    outputs: [{ name: 'fulfilled', internalType: 'bool', type: 'bool' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contractOfferer', internalType: 'address', type: 'address' },
    ],
    name: 'getContractOffererNonce',
    outputs: [{ name: 'nonce', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'offerer', internalType: 'address', type: 'address' }],
    name: 'getCounter',
    outputs: [{ name: 'counter', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct OrderComponents',
        type: 'tuple',
        components: [
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'zone', internalType: 'address', type: 'address' },
          {
            name: 'offer',
            internalType: 'struct OfferItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'consideration',
            internalType: 'struct ConsiderationItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'orderType', internalType: 'enum OrderType', type: 'uint8' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'salt', internalType: 'uint256', type: 'uint256' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
          { name: 'counter', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'getOrderHash',
    outputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getOrderStatus',
    outputs: [
      { name: 'isValidated', internalType: 'bool', type: 'bool' },
      { name: 'isCancelled', internalType: 'bool', type: 'bool' },
      { name: 'totalFilled', internalType: 'uint256', type: 'uint256' },
      { name: 'totalSize', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'incrementCounter',
    outputs: [{ name: 'newCounter', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'information',
    outputs: [
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'domainSeparator', internalType: 'bytes32', type: 'bytes32' },
      { name: 'conduitController', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct AdvancedOrder[]',
        type: 'tuple[]',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'numerator', internalType: 'uint120', type: 'uint120' },
          { name: 'denominator', internalType: 'uint120', type: 'uint120' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'extraData', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct CriteriaResolver[]',
        type: 'tuple[]',
        components: [
          { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
          { name: 'side', internalType: 'enum Side', type: 'uint8' },
          { name: 'index', internalType: 'uint256', type: 'uint256' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          {
            name: 'criteriaProof',
            internalType: 'bytes32[]',
            type: 'bytes32[]',
          },
        ],
      },
      {
        name: '',
        internalType: 'struct Fulfillment[]',
        type: 'tuple[]',
        components: [
          {
            name: 'offerComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'considerationComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
      { name: 'recipient', internalType: 'address', type: 'address' },
    ],
    name: 'matchAdvancedOrders',
    outputs: [
      {
        name: '',
        internalType: 'struct Execution[]',
        type: 'tuple[]',
        components: [
          {
            name: 'item',
            internalType: 'struct ReceivedItem',
            type: 'tuple',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct Order[]',
        type: 'tuple[]',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: '',
        internalType: 'struct Fulfillment[]',
        type: 'tuple[]',
        components: [
          {
            name: 'offerComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'considerationComponents',
            internalType: 'struct FulfillmentComponent[]',
            type: 'tuple[]',
            components: [
              { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
              { name: 'itemIndex', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    name: 'matchOrders',
    outputs: [
      {
        name: '',
        internalType: 'struct Execution[]',
        type: 'tuple[]',
        components: [
          {
            name: 'item',
            internalType: 'struct ReceivedItem',
            type: 'tuple',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              { name: 'identifier', internalType: 'uint256', type: 'uint256' },
              { name: 'amount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '',
        internalType: 'struct Order[]',
        type: 'tuple[]',
        components: [
          {
            name: 'parameters',
            internalType: 'struct OrderParameters',
            type: 'tuple',
            components: [
              { name: 'offerer', internalType: 'address', type: 'address' },
              { name: 'zone', internalType: 'address', type: 'address' },
              {
                name: 'offer',
                internalType: 'struct OfferItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                ],
              },
              {
                name: 'consideration',
                internalType: 'struct ConsiderationItem[]',
                type: 'tuple[]',
                components: [
                  {
                    name: 'itemType',
                    internalType: 'enum ItemType',
                    type: 'uint8',
                  },
                  { name: 'token', internalType: 'address', type: 'address' },
                  {
                    name: 'identifierOrCriteria',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'startAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'endAmount',
                    internalType: 'uint256',
                    type: 'uint256',
                  },
                  {
                    name: 'recipient',
                    internalType: 'address payable',
                    type: 'address',
                  },
                ],
              },
              {
                name: 'orderType',
                internalType: 'enum OrderType',
                type: 'uint8',
              },
              { name: 'startTime', internalType: 'uint256', type: 'uint256' },
              { name: 'endTime', internalType: 'uint256', type: 'uint256' },
              { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
              { name: 'salt', internalType: 'uint256', type: 'uint256' },
              { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'totalOriginalConsiderationItems',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'validate',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newCounter',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'offerer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CounterIncremented',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'offerer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'zone', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OrderCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'offerer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'zone', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'offer',
        internalType: 'struct SpentItem[]',
        type: 'tuple[]',
        components: [
          { name: 'itemType', internalType: 'enum ItemType', type: 'uint8' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        indexed: false,
      },
      {
        name: 'consideration',
        internalType: 'struct ReceivedItem[]',
        type: 'tuple[]',
        components: [
          { name: 'itemType', internalType: 'enum ItemType', type: 'uint8' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'identifier', internalType: 'uint256', type: 'uint256' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'recipient',
            internalType: 'address payable',
            type: 'address',
          },
        ],
        indexed: false,
      },
    ],
    name: 'OrderFulfilled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'orderParameters',
        internalType: 'struct OrderParameters',
        type: 'tuple',
        components: [
          { name: 'offerer', internalType: 'address', type: 'address' },
          { name: 'zone', internalType: 'address', type: 'address' },
          {
            name: 'offer',
            internalType: 'struct OfferItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'consideration',
            internalType: 'struct ConsiderationItem[]',
            type: 'tuple[]',
            components: [
              {
                name: 'itemType',
                internalType: 'enum ItemType',
                type: 'uint8',
              },
              { name: 'token', internalType: 'address', type: 'address' },
              {
                name: 'identifierOrCriteria',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'startAmount', internalType: 'uint256', type: 'uint256' },
              { name: 'endAmount', internalType: 'uint256', type: 'uint256' },
              {
                name: 'recipient',
                internalType: 'address payable',
                type: 'address',
              },
            ],
          },
          { name: 'orderType', internalType: 'enum OrderType', type: 'uint8' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'zoneHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'salt', internalType: 'uint256', type: 'uint256' },
          { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'totalOriginalConsiderationItems',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
        indexed: false,
      },
    ],
    name: 'OrderValidated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'orderHashes',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
        indexed: false,
      },
    ],
    name: 'OrdersMatched',
  },
  { type: 'error', inputs: [], name: 'BadContractSignature' },
  { type: 'error', inputs: [], name: 'BadFraction' },
  {
    type: 'error',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BadReturnValueFromERC20OnTransfer',
  },
  {
    type: 'error',
    inputs: [{ name: 'v', internalType: 'uint8', type: 'uint8' }],
    name: 'BadSignatureV',
  },
  { type: 'error', inputs: [], name: 'CannotCancelOrder' },
  {
    type: 'error',
    inputs: [],
    name: 'ConsiderationCriteriaResolverOutOfRange',
  },
  {
    type: 'error',
    inputs: [],
    name: 'ConsiderationLengthNotEqualToTotalOriginal',
  },
  {
    type: 'error',
    inputs: [
      { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'considerationIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'shortfallAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ConsiderationNotMet',
  },
  { type: 'error', inputs: [], name: 'CriteriaNotEnabledForItem' },
  {
    type: 'error',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'identifiers', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'ERC1155BatchTransferGenericFailure',
  },
  { type: 'error', inputs: [], name: 'InexactFraction' },
  { type: 'error', inputs: [], name: 'InsufficientNativeTokensSupplied' },
  { type: 'error', inputs: [], name: 'Invalid1155BatchTransferEncoding' },
  { type: 'error', inputs: [], name: 'InvalidBasicOrderParameterEncoding' },
  {
    type: 'error',
    inputs: [{ name: 'conduit', internalType: 'address', type: 'address' }],
    name: 'InvalidCallToConduit',
  },
  {
    type: 'error',
    inputs: [
      { name: 'conduitKey', internalType: 'bytes32', type: 'bytes32' },
      { name: 'conduit', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidConduit',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'InvalidContractOrder',
  },
  {
    type: 'error',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidERC721TransferAmount',
  },
  { type: 'error', inputs: [], name: 'InvalidFulfillmentComponentData' },
  {
    type: 'error',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMsgValue',
  },
  { type: 'error', inputs: [], name: 'InvalidNativeOfferItem' },
  { type: 'error', inputs: [], name: 'InvalidProof' },
  {
    type: 'error',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'InvalidRestrictedOrder',
  },
  { type: 'error', inputs: [], name: 'InvalidSignature' },
  { type: 'error', inputs: [], name: 'InvalidSigner' },
  {
    type: 'error',
    inputs: [
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidTime',
  },
  {
    type: 'error',
    inputs: [
      { name: 'fulfillmentIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'MismatchedFulfillmentOfferAndConsiderationComponents',
  },
  {
    type: 'error',
    inputs: [{ name: 'side', internalType: 'enum Side', type: 'uint8' }],
    name: 'MissingFulfillmentComponentOnAggregation',
  },
  { type: 'error', inputs: [], name: 'MissingItemAmount' },
  { type: 'error', inputs: [], name: 'MissingOriginalConsiderationItems' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'NativeTokenTransferGenericFailure',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'NoContract',
  },
  { type: 'error', inputs: [], name: 'NoReentrantCalls' },
  { type: 'error', inputs: [], name: 'NoSpecifiedOrdersAvailable' },
  {
    type: 'error',
    inputs: [],
    name: 'OfferAndConsiderationRequiredOnFulfillment',
  },
  { type: 'error', inputs: [], name: 'OfferCriteriaResolverOutOfRange' },
  {
    type: 'error',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'OrderAlreadyFilled',
  },
  {
    type: 'error',
    inputs: [{ name: 'side', internalType: 'enum Side', type: 'uint8' }],
    name: 'OrderCriteriaResolverOutOfRange',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'OrderIsCancelled',
  },
  {
    type: 'error',
    inputs: [{ name: 'orderHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'OrderPartiallyFilled',
  },
  { type: 'error', inputs: [], name: 'PartialFillsNotEnabledForOrder' },
  { type: 'error', inputs: [], name: 'TStoreAlreadyActivated' },
  { type: 'error', inputs: [], name: 'TStoreNotSupported' },
  { type: 'error', inputs: [], name: 'TloadTestContractDeploymentFailed' },
  {
    type: 'error',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'identifier', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TokenTransferGenericFailure',
  },
  {
    type: 'error',
    inputs: [
      { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'considerationIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'UnresolvedConsiderationCriteria',
  },
  {
    type: 'error',
    inputs: [
      { name: 'orderIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'offerIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'UnresolvedOfferCriteria',
  },
  { type: 'error', inputs: [], name: 'UnusedItemParameters' },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const seaport16Address = {
  31337: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  84532: '0x0000000000000068F116a894984e2DB1123eB395',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const seaport16Config = {
  address: seaport16Address,
  abi: seaport16Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// USDC
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const usdcAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
      { name: 'tokenDecimals', internalType: 'uint8', type: 'uint8' },
      { name: 'initialSupply', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const usdcAddress = {
  31337: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  84532: '0x1Aa78F7fdc5AceF5Cc94Dd7F30d4b46B9C283516',
} as const

/**
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const usdcConfig = { address: usdcAddress, abi: usdcAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__
 *
 *
 */
export const useReadConduitController16 = /*#__PURE__*/ createUseReadContract({
  abi: conduitController16Abi,
  address: conduitController16Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getChannel"`
 *
 *
 */
export const useReadConduitController16GetChannel =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getChannel',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getChannelStatus"`
 *
 *
 */
export const useReadConduitController16GetChannelStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getChannelStatus',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getChannels"`
 *
 *
 */
export const useReadConduitController16GetChannels =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getChannels',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getConduit"`
 *
 *
 */
export const useReadConduitController16GetConduit =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getConduit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getConduitCodeHashes"`
 *
 *
 */
export const useReadConduitController16GetConduitCodeHashes =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getConduitCodeHashes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getKey"`
 *
 *
 */
export const useReadConduitController16GetKey =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getKey',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getPotentialOwner"`
 *
 *
 */
export const useReadConduitController16GetPotentialOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getPotentialOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"getTotalChannels"`
 *
 *
 */
export const useReadConduitController16GetTotalChannels =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'getTotalChannels',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"ownerOf"`
 *
 *
 */
export const useReadConduitController16OwnerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'ownerOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__
 *
 *
 */
export const useWriteConduitController16 = /*#__PURE__*/ createUseWriteContract(
  { abi: conduitController16Abi, address: conduitController16Address },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"acceptOwnership"`
 *
 *
 */
export const useWriteConduitController16AcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 *
 *
 */
export const useWriteConduitController16CancelOwnershipTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"createConduit"`
 *
 *
 */
export const useWriteConduitController16CreateConduit =
  /*#__PURE__*/ createUseWriteContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'createConduit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useWriteConduitController16TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"updateChannel"`
 *
 *
 */
export const useWriteConduitController16UpdateChannel =
  /*#__PURE__*/ createUseWriteContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'updateChannel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__
 *
 *
 */
export const useSimulateConduitController16 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"acceptOwnership"`
 *
 *
 */
export const useSimulateConduitController16AcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"cancelOwnershipTransfer"`
 *
 *
 */
export const useSimulateConduitController16CancelOwnershipTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'cancelOwnershipTransfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"createConduit"`
 *
 *
 */
export const useSimulateConduitController16CreateConduit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'createConduit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"transferOwnership"`
 *
 *
 */
export const useSimulateConduitController16TransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conduitController16Abi}__ and `functionName` set to `"updateChannel"`
 *
 *
 */
export const useSimulateConduitController16UpdateChannel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conduitController16Abi,
    address: conduitController16Address,
    functionName: 'updateChannel',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conduitController16Abi}__
 *
 *
 */
export const useWatchConduitController16Event =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conduitController16Abi,
    address: conduitController16Address,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conduitController16Abi}__ and `eventName` set to `"NewConduit"`
 *
 *
 */
export const useWatchConduitController16NewConduitEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conduitController16Abi,
    address: conduitController16Address,
    eventName: 'NewConduit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conduitController16Abi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 *
 */
export const useWatchConduitController16OwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conduitController16Abi,
    address: conduitController16Address,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conduitController16Abi}__ and `eventName` set to `"PotentialOwnerUpdated"`
 *
 *
 */
export const useWatchConduitController16PotentialOwnerUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conduitController16Abi,
    address: conduitController16Address,
    eventName: 'PotentialOwnerUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunks = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"balanceOf"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"collectionSize"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksCollectionSize =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'collectionSize',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"getApproved"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"getTokenCount"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksGetTokenCount =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'getTokenCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"name"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksName = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"ownerOf"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"symbol"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksSymbol = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"tokenByIndex"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"tokenURI"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"totalSupply"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useReadCryptoPunksTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunks = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"approve"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksApprove = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mint"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksMint = /*#__PURE__*/ createUseWriteContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mintNext"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksMintNext = /*#__PURE__*/ createUseWriteContract(
  {
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'mintNext',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mintRandom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksMintRandom =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'mintRandom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"transferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWriteCryptoPunksTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunks = /*#__PURE__*/ createUseSimulateContract({
  abi: cryptoPunksAbi,
  address: cryptoPunksAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"approve"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mint"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mintNext"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksMintNext =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'mintNext',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"mintRandom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksMintRandom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'mintRandom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cryptoPunksAbi}__ and `functionName` set to `"transferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useSimulateCryptoPunksTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPunksAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWatchCryptoPunksEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPunksAbi}__ and `eventName` set to `"Approval"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWatchCryptoPunksApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPunksAbi}__ and `eventName` set to `"ApprovalForAll"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWatchCryptoPunksApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cryptoPunksAbi}__ and `eventName` set to `"Transfer"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xf8a39dc6c55a324a2e0c16503547a108b5ead949)
 */
export const useWatchCryptoPunksTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cryptoPunksAbi,
    address: cryptoPunksAddress,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhale = /*#__PURE__*/ createUseReadContract({
  abi: pinkwhaleAbi,
  address: pinkwhaleAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"authorizeOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhaleAuthorizeOrder =
  /*#__PURE__*/ createUseReadContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'authorizeOrder',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"getSeaportMetadata"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhaleGetSeaportMetadata =
  /*#__PURE__*/ createUseReadContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'getSeaportMetadata',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"onERC721Received"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhaleOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"seaport"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhaleSeaport = /*#__PURE__*/ createUseReadContract({
  abi: pinkwhaleAbi,
  address: pinkwhaleAddress,
  functionName: 'seaport',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"supportsInterface"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useReadPinkwhaleSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pinkwhaleAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWritePinkwhale = /*#__PURE__*/ createUseWriteContract({
  abi: pinkwhaleAbi,
  address: pinkwhaleAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"executeLoan"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWritePinkwhaleExecuteLoan =
  /*#__PURE__*/ createUseWriteContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'executeLoan',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWritePinkwhaleOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"onERC1155Received"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWritePinkwhaleOnErc1155Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"validateOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWritePinkwhaleValidateOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'validateOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pinkwhaleAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useSimulatePinkwhale = /*#__PURE__*/ createUseSimulateContract({
  abi: pinkwhaleAbi,
  address: pinkwhaleAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"executeLoan"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useSimulatePinkwhaleExecuteLoan =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'executeLoan',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useSimulatePinkwhaleOnErc1155BatchReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"onERC1155Received"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useSimulatePinkwhaleOnErc1155Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pinkwhaleAbi}__ and `functionName` set to `"validateOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useSimulatePinkwhaleValidateOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    functionName: 'validateOrder',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pinkwhaleAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWatchPinkwhaleEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: pinkwhaleAbi, address: pinkwhaleAddress },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pinkwhaleAbi}__ and `eventName` set to `"DefaultedCollateralClaimed"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWatchPinkwhaleDefaultedCollateralClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    eventName: 'DefaultedCollateralClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pinkwhaleAbi}__ and `eventName` set to `"LoanExecuted"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWatchPinkwhaleLoanExecutedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    eventName: 'LoanExecuted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pinkwhaleAbi}__ and `eventName` set to `"LoanRepaid"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5c74e81a1bb4513f6c13dfcd322014ba5d7ec225)
 */
export const useWatchPinkwhaleLoanRepaidEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pinkwhaleAbi,
    address: pinkwhaleAddress,
    eventName: 'LoanRepaid',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16 = /*#__PURE__*/ createUseReadContract({
  abi: seaport16Abi,
  address: seaport16Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"getContractOffererNonce"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16GetContractOffererNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'getContractOffererNonce',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"getCounter"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16GetCounter = /*#__PURE__*/ createUseReadContract({
  abi: seaport16Abi,
  address: seaport16Address,
  functionName: 'getCounter',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"getOrderHash"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16GetOrderHash = /*#__PURE__*/ createUseReadContract(
  {
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'getOrderHash',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"getOrderStatus"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16GetOrderStatus =
  /*#__PURE__*/ createUseReadContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'getOrderStatus',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"information"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16Information = /*#__PURE__*/ createUseReadContract({
  abi: seaport16Abi,
  address: seaport16Address,
  functionName: 'information',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"name"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useReadSeaport16Name = /*#__PURE__*/ createUseReadContract({
  abi: seaport16Abi,
  address: seaport16Address,
  functionName: 'name',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16 = /*#__PURE__*/ createUseWriteContract({
  abi: seaport16Abi,
  address: seaport16Address,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"__activateTstore"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16ActivateTstore =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: '__activateTstore',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"cancel"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16Cancel = /*#__PURE__*/ createUseWriteContract({
  abi: seaport16Abi,
  address: seaport16Address,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAdvancedOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillAdvancedOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAdvancedOrder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAvailableAdvancedOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillAvailableAdvancedOrders =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAvailableAdvancedOrders',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAvailableOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillAvailableOrders =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAvailableOrders',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillBasicOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillBasicOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillBasicOrder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillBasicOrder_efficient_6GL6yc"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillBasicOrderEfficient_6Gl6yc =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillBasicOrder_efficient_6GL6yc',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16FulfillOrder =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillOrder',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"incrementCounter"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16IncrementCounter =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'incrementCounter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"matchAdvancedOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16MatchAdvancedOrders =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'matchAdvancedOrders',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"matchOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16MatchOrders =
  /*#__PURE__*/ createUseWriteContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'matchOrders',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"validate"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWriteSeaport16Validate = /*#__PURE__*/ createUseWriteContract({
  abi: seaport16Abi,
  address: seaport16Address,
  functionName: 'validate',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16 = /*#__PURE__*/ createUseSimulateContract({
  abi: seaport16Abi,
  address: seaport16Address,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"__activateTstore"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16ActivateTstore =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: '__activateTstore',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"cancel"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16Cancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAdvancedOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillAdvancedOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAdvancedOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAvailableAdvancedOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillAvailableAdvancedOrders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAvailableAdvancedOrders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillAvailableOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillAvailableOrders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillAvailableOrders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillBasicOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillBasicOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillBasicOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillBasicOrder_efficient_6GL6yc"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillBasicOrderEfficient_6Gl6yc =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillBasicOrder_efficient_6GL6yc',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"fulfillOrder"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16FulfillOrder =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'fulfillOrder',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"incrementCounter"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16IncrementCounter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'incrementCounter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"matchAdvancedOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16MatchAdvancedOrders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'matchAdvancedOrders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"matchOrders"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16MatchOrders =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'matchOrders',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link seaport16Abi}__ and `functionName` set to `"validate"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useSimulateSeaport16Validate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: seaport16Abi,
    address: seaport16Address,
    functionName: 'validate',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16Event = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: seaport16Abi, address: seaport16Address },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__ and `eventName` set to `"CounterIncremented"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16CounterIncrementedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: seaport16Abi,
    address: seaport16Address,
    eventName: 'CounterIncremented',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__ and `eventName` set to `"OrderCancelled"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16OrderCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: seaport16Abi,
    address: seaport16Address,
    eventName: 'OrderCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__ and `eventName` set to `"OrderFulfilled"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16OrderFulfilledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: seaport16Abi,
    address: seaport16Address,
    eventName: 'OrderFulfilled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__ and `eventName` set to `"OrderValidated"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16OrderValidatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: seaport16Abi,
    address: seaport16Address,
    eventName: 'OrderValidated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link seaport16Abi}__ and `eventName` set to `"OrdersMatched"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x0000000000000068F116a894984e2DB1123eB395)
 */
export const useWatchSeaport16OrdersMatchedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: seaport16Abi,
    address: seaport16Address,
    eventName: 'OrdersMatched',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdc = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"allowance"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcAllowance = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"balanceOf"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"decimals"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcDecimals = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"name"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcName = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"symbol"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcSymbol = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"totalSupply"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useReadUsdcTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdc = /*#__PURE__*/ createUseWriteContract({
  abi: usdcAbi,
  address: usdcAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"approve"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcApprove = /*#__PURE__*/ createUseWriteContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"decreaseAllowance"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: usdcAbi,
    address: usdcAddress,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"increaseAllowance"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: usdcAbi,
    address: usdcAddress,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"mint"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcMint = /*#__PURE__*/ createUseWriteContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"transfer"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"transferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWriteUsdcTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdc = /*#__PURE__*/ createUseSimulateContract({
  abi: usdcAbi,
  address: usdcAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"approve"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"decreaseAllowance"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: usdcAbi,
    address: usdcAddress,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"increaseAllowance"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: usdcAbi,
    address: usdcAddress,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"mint"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcMint = /*#__PURE__*/ createUseSimulateContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"transfer"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: usdcAbi,
  address: usdcAddress,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link usdcAbi}__ and `functionName` set to `"transferFrom"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useSimulateUsdcTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: usdcAbi,
    address: usdcAddress,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link usdcAbi}__
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWatchUsdcEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: usdcAbi,
  address: usdcAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link usdcAbi}__ and `eventName` set to `"Approval"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWatchUsdcApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: usdcAbi,
    address: usdcAddress,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link usdcAbi}__ and `eventName` set to `"Transfer"`
 *
 * -
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x1aa78f7fdc5acef5cc94dd7f30d4b46b9c283516)
 */
export const useWatchUsdcTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: usdcAbi,
    address: usdcAddress,
    eventName: 'Transfer',
  })
