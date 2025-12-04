// Standalone server file without build process
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Payment routes
function assertEnv() {
  const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
  const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  
  if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
    const error = new Error('Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment.');
    error.code = 'MISSING_KEYS';
    error.status = 500;
    throw error;
  }
  
  return { RZP_KEY_ID, RZP_KEY_SECRET };
}

// Get config
app.get('/api/payments/config', (req, res) => {
  const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
  const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  
  res.status(200).json({ 
    keyId: RZP_KEY_ID, 
    hasSecret: Boolean(RZP_KEY_SECRET) 
  });
});

// Create order
app.post('/api/payments/order', async (req, res) => {
  try {
    const { RZP_KEY_ID, RZP_KEY_SECRET } = assertEnv();
    const { amount, currency = 'INR', receipt } = req.body || {};
    const amt = Number(amount);
    
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const subunits = Math.round(amt * 100);
    const basicAuth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: subunits,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ 
        message: 'Failed to create order', 
        details: text 
      });
    }

    const data = await response.json();

    return res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: RZP_KEY_ID,
      receipt: data.receipt,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ 
      message: err.message || 'Internal Server Error' 
    });
  }
});

// Verify payment
app.post('/api/payments/verify', async (req, res) => {
  try {
    const { RZP_KEY_ID, RZP_KEY_SECRET } = assertEnv();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing verification fields' });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', RZP_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const verified = expected === razorpay_signature;

    return res.status(200).json({ verified });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ 
      message: err.message || 'Internal Server Error' 
    });
  }
});

// Serve static files with proper MIME types
const distPath = path.join(__dirname, 'dist', 'spa');

// Custom middleware to set correct MIME types - placed BEFORE static middleware
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  
  // Handle static files with correct MIME types
  if (req.path.includes('.')) {
    const ext = path.extname(req.path).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
  next();
});

// Serve static files
app.use(express.static(distPath));

// Handle React Router - MUST be after static middleware
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Payment Gateway server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});