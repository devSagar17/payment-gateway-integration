# Razorpay Payment Gateway Integration

A production-ready full-stack React application with integrated Express server for handling Razorpay payments.

## Features

- ✅ Production-ready build configuration
- ✅ Secure Razorpay payment processing
- ✅ Order creation and payment verification
- ✅ Responsive UI with TailwindCSS
- ✅ Environment-based configuration
- ✅ Health check endpoint

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Razorpay credentials:
   ```env
   RAZORPAY_KEY_ID=your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   PORT=3000
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Production Build

Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Payment Routes

- `GET /api/payments/config` - Get Razorpay configuration
- `POST /api/payments/order` - Create a new payment order
- `POST /api/payments/verify` - Verify payment signature

### Health Check

- `GET /api/health` - Application health status

## Deployment

### Environment Variables

Set the following environment variables in your production environment:

```env
RAZORPAY_KEY_ID=your_production_key_id
RAZORPAY_KEY_SECRET=your_production_key_secret
PORT=3000
NODE_ENV=production
```

### Hosting Options

#### Traditional Hosting
1. Build the application: `npm run build`
2. Upload the `dist/` directory to your server
3. Set environment variables on your server
4. Run: `node dist/server/node-build.mjs`

#### Platform-as-a-Service (Heroku, Render, etc.)
1. Push the code to your platform
2. Set environment variables in your platform's dashboard
3. Configure the build command: `npm run build`
4. Configure the start command: `npm start`

## Security

- 🔒 All Razorpay API calls are server-side
- 🔐 Razorpay secrets are never exposed to the client
- ✅ HMAC signature verification for payment confirmation
- 🛡️ CORS enabled for secure cross-origin requests

## Folder Structure

```
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared types between client and server
├── dist/                # Production build output
│   ├── spa/             # Static client files
│   └── server/          # Server bundle
└── public/              # Public assets
```

## License

MIT