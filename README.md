# Escrow Platform - Production Ready

A production-ready, decentralized escrow platform built with Next.js 14, TypeScript, PostgreSQL, and Web3 technologies.

## 🚀 Features

- 🔐 **Secure JWT-based authentication** with httpOnly cookies
- 💰 **Create and manage escrow transactions** with multi-step wizard
- 👥 **Support for buyer, seller, and arbiter roles**
- 📊 **Advanced search, filtering, and pagination**
- 📈 **Activity timeline and transaction history**
- 🔒 **Security headers and rate limiting**
- 📱 **Fully responsive design**
- ♿ **Accessibility compliant**
- 🧪 **Comprehensive testing setup**
- 🐳 **Docker support**
- 📝 **Admin dashboard**

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Web3**: Wagmi, Viem, RainbowKit
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest, Playwright

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

## 🚀 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd escrow-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/escrow_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
```

4. **Set up the database:**
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Production Deployment

### Using Docker

1. **Build and start services:**
```bash
docker-compose up -d
```

2. **Run migrations:**
```bash
docker-compose exec app npm run db:migrate
```

3. **Access the application:**
- App: http://localhost:3000
- Database: localhost:5432

### Manual Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── escrows/        # Escrow CRUD endpoints
│   │   └── admin/          # Admin endpoints
│   ├── create/             # Create escrow page
│   ├── escrows/            # Escrow list and detail pages
│   ├── my-escrows/         # User's escrows
│   ├── admin/              # Admin dashboard
│   └── ...
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   └── wizard/             # Multi-step form components
├── lib/                    # Utilities and helpers
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Database client
│   ├── validations.ts      # Zod schemas
│   └── ...
├── prisma/                 # Database schema
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Database seed script
└── types/                  # TypeScript types
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Input validation with Zod
- Rate limiting on API routes
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- SQL injection prevention (Prisma)
- CSRF protection ready

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User**: User accounts with email/password authentication
- **Escrow**: Escrow transactions with full details
- **Milestone**: Milestone tracking for milestone-based escrows
- **Activity**: Activity log for escrow events
- **Session**: User sessions for authentication

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `NEXT_PUBLIC_APP_URL`: Application URL

**Optional:**
- `SMTP_*`: Email configuration for notifications
- `SENTRY_DSN`: Error tracking
- `RATE_LIMIT_*`: Rate limiting configuration

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Escrows
- `GET /api/escrows` - List all escrows (with pagination, filters)
- `POST /api/escrows` - Create new escrow
- `GET /api/escrows/[id]` - Get escrow details
- `PUT /api/escrows/[id]` - Update escrow (with actions: fund, release, refund, dispute)
- `DELETE /api/escrows/[id]` - Delete escrow

### Admin
- `GET /api/admin/stats` - Get platform statistics

### Health
- `GET /api/health` - Health check endpoint

## 🎨 Features Overview

### Multi-Step Escrow Creation
- Step 1: Escrow Basics (Title, Type)
- Step 2: Parties Involved (Payer, Payee)
- Step 3: Payment Details (Amount, Token, Fees)
- Step 4: Release Conditions (Manual, Auto, Milestone)
- Step 5: Work Details (Description, Deliverables)
- Step 6: Dispute & Safety
- Step 7: Review & Confirm

### Escrow Management
- Fund escrow
- Release funds to seller
- Request refund
- File dispute
- Arbiter resolution

### Search & Filtering
- Search by title, description, addresses
- Filter by status
- Sort by date, amount
- Pagination support

## 🚢 Deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Docker
```bash
docker-compose up -d
```

### Self-Hosted
1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run build && npm start`

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.
