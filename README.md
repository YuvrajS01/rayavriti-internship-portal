# Rayavriti Learning Platform

A modern Learning Management System (LMS) built with Next.js 16, featuring course management, user authentication, payment verification, and certificate generation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Credentials provider)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or [Neon](https://neon.tech) for serverless)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `UPI_ID` and `UPI_MERCHANT_NAME`: Payment configuration
   - `NEXT_PUBLIC_APP_URL`: Your application URL

4. **Set up the database**
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Apply migrations
   npm run db:migrate
   
   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:push` | Push schema changes (development) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with sample data |

## Production Deployment

### Vercel (Recommended)

1. **Push to GitHub** and connect your repository to Vercel

2. **Set environment variables** in Vercel dashboard:
   - `DATABASE_URL` - Neon connection pooling URL
   - `AUTH_SECRET` - Strong secret (32+ characters)
   - `UPI_ID` - Your UPI ID
   - `UPI_MERCHANT_NAME` - Merchant name
   - `NEXT_PUBLIC_APP_URL` - Production URL (e.g., `https://yourdomain.com`)
   - `NEXT_PUBLIC_APP_NAME` - App name

3. **Database**: Use [Neon](https://neon.tech) for serverless PostgreSQL
   - Create a new project
   - Use the **pooled connection string** for `DATABASE_URL`
   - Run migrations: `npm run db:migrate`

4. **Deploy**: Vercel will automatically deploy on push to main

### Health Check

The application includes a health check endpoint for monitoring:

```bash
curl https://yourdomain.com/api/health
```

Response includes database status, environment validation, and latency metrics.

## Security Features

- **Rate Limiting**: Auth endpoints protected against brute-force attacks
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Input Validation**: All inputs validated with Zod schemas
- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure session management with 30-day expiry

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── courses/           # Course pages
│   └── dashboard/         # User dashboard
├── components/            # React components
├── db/                    # Database schema and config
│   ├── schema.ts          # Drizzle schema
│   ├── index.ts           # Database connection
│   └── seed.ts            # Seed data
├── lib/                   # Utilities
│   ├── api.ts             # API response helpers
│   ├── env.ts             # Environment validation
│   ├── logger.ts          # Structured logging
│   ├── ratelimit.ts       # Rate limiting
│   ├── utils.ts           # General utilities
│   └── validations.ts     # Zod schemas
└── types/                 # TypeScript types
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:run`
4. Run lint: `npm run lint`
5. Submit a pull request

## License

Private - All rights reserved
