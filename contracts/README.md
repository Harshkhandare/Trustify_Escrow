# Smart Contracts

This directory contains the Solidity smart contracts for the Escrow platform.

## Contracts

### Escrow.sol
Main escrow contract that handles:
- Creating escrow agreements
- Funding escrows with ETH
- Releasing funds to sellers
- Refunding funds to buyers
- Filing disputes
- Arbiter resolution

## Deployment

### Prerequisites
- Node.js 20+
- Hardhat or Foundry
- MetaMask or other wallet

### Using Hardhat

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Using Foundry

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Build:
```bash
forge build
```

3. Deploy:
```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

## Integration

After deployment, update your frontend configuration with the contract address:

```typescript
// config/contracts.ts
export const ESCROW_CONTRACT_ADDRESS = "0x..." // Your deployed address
export const ESCROW_ABI = [...] // Contract ABI
```

## Testing

Run tests:
```bash
# Hardhat
npx hardhat test

# Foundry
forge test
```

## Security

⚠️ **Important**: These contracts are for demonstration purposes. Before deploying to mainnet:
- Get a professional audit
- Test thoroughly on testnets
- Review all security best practices
- Consider using OpenZeppelin's battle-tested contracts

