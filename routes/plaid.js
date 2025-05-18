const express = require('express');
const router = express.Router();
const plaid = require('plaid');

const client = new plaid.PlaidApi(new plaid.Configuration({
  basePath: plaid.PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

// Create a link token
router.post('/create-link-token', async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id-123' },
      client_name: 'KratosFinancial',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange a public token for a Stripe bank account token
router.post('/exchange-token', async (req, res) => {
  try {
    const { public_token, account_id } = req.body;

    const tokenResponse = await client.itemPublicTokenExchange({ public_token });
    const access_token = tokenResponse.data.access_token;

    const stripeToken = await client.processorStripeBankAccountTokenCreate({
      access_token,
      account_id,
    });

    res.json({ bank_account_token: stripeToken.data.stripe_bank_account_token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;