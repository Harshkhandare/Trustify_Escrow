export const ESCROW_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  // localhost: 31337
  31337: '0x0000000000000000000000000000000000000000',
  // sepolia: 11155111
  11155111: '0x0000000000000000000000000000000000000000',
  // mainnet: 1
  1: '0x0000000000000000000000000000000000000000',
}

export const ESCROW_ABI = [
  {
    type: 'function',
    name: 'createEscrow',
    stateMutability: 'payable',
    inputs: [
      { name: '_seller', type: 'address' },
      { name: '_arbiter', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'fundEscrow',
    stateMutability: 'payable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'releaseEscrow',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'refundEscrow',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'fileDispute',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getEscrow',
    stateMutability: 'view',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'buyer', type: 'address' },
          { name: 'seller', type: 'address' },
          { name: 'arbiter', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'funded', type: 'bool' },
          { name: 'released', type: 'bool' },
          { name: 'refunded', type: 'bool' },
          { name: 'disputed', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'fundedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getEscrowStatus',
    stateMutability: 'view',
    inputs: [{ name: 'escrowId', type: 'uint256' }],
    outputs: [
      { name: 'funded', type: 'bool' },
      { name: 'released', type: 'bool' },
      { name: 'refunded', type: 'bool' },
      { name: 'disputed', type: 'bool' },
    ],
  },
] as const


