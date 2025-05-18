const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Log the Stripe key being used
console.log('🔑 Stripe key being used:', process.env.STRIPE_SECRET_KEY);

//
// ✅ Payment Intent Endpoint
//
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//
// ✅ Create Express Connected Account + Onboarding Link
//
router.post('/create-connected-account', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/reauth',
      return_url: 'http://localhost:3000/success',
      type: 'account_onboarding',
    });

    res.json({
      url: accountLink.url,
      accountId: account.id,
    });
  } catch (error) {
    console.error("Error creating connected account:", error);
    res.status(500).json({ error: error.message });
  }
});

//
// ✅ Final export
//
module.exports = router;