'use client'

import { useChainId } from 'wagmi'
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESSES } from '@/config/contracts'

export function useEscrowContractConfig() {
  const chainId = useChainId()
  const address = ESCROW_CONTRACT_ADDRESSES[chainId]
  return {
    chainId,
    address,
    abi: ESCROW_ABI,
    isConfigured:
      !!address && address !== '0x0000000000000000000000000000000000000000',
  }
}


