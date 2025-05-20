require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import Stripe routes
const stripeRoutes = require('./routes/stripe');
app.use('/stripe', stripeRoutes);
console.log('✅ Stripe routes mounted at /stripe');

// Root endpoint to confirm server is running
app.get('/', (req, res) => {
  res.send('✅ KratosFinancial backend is live with Stripe');
});

// 404 fallback for unmatched routes
app.use((req, res) => {
  res.status(404).send("❌ Route not found");
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});