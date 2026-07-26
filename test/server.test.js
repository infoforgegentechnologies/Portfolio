const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { app } = require('../server');

test('POST /api/contact returns success for a valid submission', async () => {
  const server = app.listen(0);
  await once(server, 'listening');

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        projectType: 'Landing Page',
        budgetRange: 'Under ₹15,000',
        message: 'Hello from the test suite.'
      })
    });

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.success, true);
    assert.match(data.message, /received/i);
  } finally {
    server.close();
  }
});
