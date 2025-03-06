# GSDT - Global South Digital Token

![GSDT Logo](https://img.shields.io/badge/GSDT-Global%20South%20Digital%20Token-4c1d95?style=for-the-badge)

GSDT is a revolutionary stablecoin backed by a basket of BRICS currencies, providing a stable and efficient means of cross-border transactions while promoting economic cooperation among BRICS nations.

## 🌟 Features

- **Currency Basket**: Backed by a weighted basket of BRICS currencies (CNH, RUB, INR, BRL, ZAR, IDR)
- **Smart Contract Security**: Built on robust blockchain technology with multiple security layers
- **KYC Verification**: Integrated KYC process for regulatory compliance
- **Real-time Exchange Rates**: Up-to-date exchange rates for BRICS currencies
- **Admin Dashboard**: Comprehensive admin interface for managing users, KYC requests, and roles
- **Proof of Reserves**: Transparent reporting of reserve assets

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Key Components](#key-components)
- [Smart Contract](#smart-contract)
- [Admin Features](#admin-features)
- [Technologies Used](#technologies-used)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gsdt-stablecoin.git
   cd gsdt-stablecoin
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

## 📁 Project Structure

```
gsdt-stablecoin/
├── app/                  # Next.js app directory (legacy)
├── contracts/            # Smart contract source code
├── public/               # Static assets
├── src/                  # Source files
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and libraries
│   ├── pages/            # Page components
│   ├── services/         # API and service functions
│   └── App.tsx           # Main App component
├── supabase/             # Supabase migrations and configuration
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.ts        # Vite configuration
```

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run preview` - Serves the production build locally

## 🧩 Key Components

### User-Facing Features

- **Dashboard**: View token balance, exchange rates, and proof of reserves
- **Token Minting**: Mint GSDT tokens using fiat currencies or crypto
- **KYC Verification**: Submit KYC documents for verification
- **Transaction History**: View past transactions and their status

### Admin Features

- **KYC Management**: Approve or reject KYC requests
- **Role Management**: Assign and manage smart contract roles
- **Contact Message Management**: Handle user inquiries
- **Transaction Monitoring**: Monitor and flag suspicious transactions

## 💼 Smart Contract

The GSDT token is implemented as an ERC-20 token with additional features:

- **Role-Based Access Control**: Different roles for minting, burning, and price updates
- **KYC Verification**: Only KYC-approved addresses can hold and transfer tokens
- **Redemption Mechanism**: Process for redeeming GSDT tokens
- **Price Updates**: Mechanism to update the token price based on the currency basket

### Contract Roles

- **SUPER_ADMIN**: Full access to all functions
- **MINTER_ROLE**: Can mint new tokens
- **BURNER_ROLE**: Can burn tokens and process redemptions
- **PAUSER_ROLE**: Can pause/unpause contract operations
- **PRICE_UPDATER_ROLE**: Can update token price

## 🔧 Technologies Used

- **Frontend**:
  - React
  - Vite
  - Tailwind CSS
  - Framer Motion
  - Wagmi/Web3Modal

- **Backend**:
  - Supabase (Database and Authentication)
  - Ethers.js (Blockchain Interaction)

- **Smart Contract**:
  - Solidity
  - OpenZeppelin Contracts
  - Hardhat

## 🌐 Deployment

The application can be deployed to various platforms:

### Frontend

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Netlify, Vercel, or another hosting service.

### Smart Contract

1. Compile the contract:
   ```bash
   npx hardhat compile
   ```

2. Deploy to your chosen network:
   ```bash
   npx hardhat run scripts/deploy.ts --network <network-name>
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any inquiries, please reach out through the contact form on our website or email us at support@gsdt.com.

---

&copy; 2025 Global South Digital Token. All rights reserved.