import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, localhost],
  [publicProvider()]
)

// Configure connectors - use WalletConnect if projectId is provided, otherwise use injected wallets only
let connectors
if (projectId && projectId !== 'YOUR_PROJECT_ID' && projectId.trim() !== '' && projectId !== '00000000000000000000000000000000') {
  try {
    const wallets = getDefaultWallets({
      appName: 'Escrow Platform',
      projectId,
      chains,
    })
    connectors = wallets.connectors
  } catch (error) {
    console.warn('Failed to initialize WalletConnect, falling back to injected wallets:', error)
    // Fallback to injected wallets only
    connectors = [new InjectedConnector({ chains })]
  }
} else {
  // Without valid projectId, use injected wallets only (MetaMask, etc.)
  connectors = [new InjectedConnector({ chains })]
}

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }

