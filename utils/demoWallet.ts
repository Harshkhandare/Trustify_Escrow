// Demo wallet utilities for auto-connection

export const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
export const DEMO_WALLET_BALANCE = '2.547'

export interface DemoWalletInfo {
  address: string
  balance: string
  network: string
  isDemo: boolean
}

export function getDemoWalletInfo(): DemoWalletInfo {
  return {
    address: DEMO_WALLET_ADDRESS,
    balance: DEMO_WALLET_BALANCE,
    network: 'Ethereum Mainnet',
    isDemo: true,
  }
}

export function formatDemoAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

