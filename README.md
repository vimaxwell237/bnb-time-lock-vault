# BNB Time-Lock Vault

Testnet-only dashboard for locking native tBNB on BSC Testnet (chain ID 97). The existing vault contract, native deposit flow, maturity checks, withdrawal flow, lock list, and vault statistics are preserved.

## Local setup

Install dependencies and create the local environment file:

```powershell
npm install
Copy-Item .env.local.example .env.local
```

Set these values in `.env.local`:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=d088481ea899320482b1ddcb90e47540
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0x3Bb9bd4D6dFD7bd2031DEE1D47215390ecb38fE4
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
```

`NEXT_PUBLIC_REOWN_PROJECT_ID` enables Reown AppKit wallet connections. The configured wallet UI supports injected wallets such as MetaMask, WalletConnect QR and mobile deep links, and wallets such as Trust Wallet. Email and social login are disabled.

Start the app with:

```powershell
npm run dev
```

Open `http://localhost:3000`, connect a wallet, switch it to BSC Testnet, and use funded testnet BNB. The configured RPC URL falls back to the BNB Chain public BSC Testnet endpoint when the environment variable is absent.

## Vercel deployment

Add the public variables in the Vercel project under **Settings > Environment Variables** for each environment that should run the app:

- **Production**: production domain URL in `NEXT_PUBLIC_APP_URL`
- **Preview**: preview URL or the project URL in `NEXT_PUBLIC_APP_URL`
- **Development**: `http://localhost:3000` in `NEXT_PUBLIC_APP_URL`

Add `NEXT_PUBLIC_REOWN_PROJECT_ID`, `NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS`, and `NEXT_PUBLIC_BSC_TESTNET_RPC_URL` to **Production**, **Preview**, and **Development** as appropriate. Public environment variables are embedded during the build, so redeploy after changing them.

The app only allows BSC Testnet (chain ID 97) and links transactions to [BSC Testnet Explorer](https://testnet.bscscan.com/).

## Testing wallet connections

- Desktop: test an injected MetaMask connection and the WalletConnect QR flow.
- Mobile: test the QR/deep-link flow from Android Chrome and iOS Safari, then test MetaMask Mobile and Trust Wallet.
- Network: confirm that a wallet on another chain receives the BSC Testnet warning and that deposit/withdraw actions remain disabled until chain 97 is active.
- Configuration: confirm a missing project ID shows a clear setup message instead of crashing the page.

## Verification commands

```powershell
npm run lint
npm run build
```
