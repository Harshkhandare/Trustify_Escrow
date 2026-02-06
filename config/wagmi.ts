import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, localhost],
  [publicProvider()]
)

// Configure connectors - use WalletConnect if projectId is provided
let connectors
if (projectId && projectId !== 'YOUR_PROJECT_ID' && projectId.trim() !== '') {
  const wallets = getDefaultWallets({
    appName: 'Escrow Platform',
    projectId,
    chains,
  })
  connectors = wallets.connectors
} else {
  // Without projectId, WalletConnect will show a warning but injected wallets still work
  // Using a placeholder projectId to avoid errors - WalletConnect features won't work
  // but MetaMask and other injected wallets will still function
  const wallets = getDefaultWallets({
    appName: 'Escrow Platform',
    projectId: '00000000000000000000000000000000', // Placeholder - WalletConnect will warn but app works
    chains,
  })
  connectors = wallets.connectors
}

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }

