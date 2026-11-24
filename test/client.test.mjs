import test from 'node:test';
import assert from 'node:assert/strict';
import { ClutchClient, ClutchApiError } from '../src/client.mjs';

test('live requests require a supplied key', () => {
  assert.throws(() => new ClutchClient(), /Provide your own/);
  assert.throws(() => new ClutchClient({ apiKey: ' ' }), /Provide your own/);
});

test('session requests carry authentication, pagination and a bounded timeout', async () => {
  const payload = { sessions: [] };
  const client = new ClutchClient({ apiKey: 'test-key', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://clutchfn.com/data-api/v1/sessions?limit=5&offset=10');
    assert.equal(options.headers['x-api-key'], 'test-key');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.redirect, 'error');
    return Response.json(payload);
  } });
  assert.deepEqual(await client.sessions({ limit: 5, offset: 10 }), payload);
});

test('bad inputs are rejected before any request', () => {
  let calls = 0;
  const client = new ClutchClient({ apiKey: 'test-key', fetchImpl: () => { calls++; } });
  assert.throws(() => client.sessions({ limit: 101 }), RangeError);
  assert.throws(() => client.sessions({ offset: -1 }), RangeError);
  assert.throws(() => client.match('../admin'), TypeError);
  assert.equal(calls, 0);
});

test('auth and quota errors preserve status without echoing keys or response bodies', async () => {
  for (const status of [401, 403, 429]) {
    const client = new ClutchClient({ apiKey: 'test-key', fetchImpl: async () =>
      Response.json({ error: 'Private response detail' }, { status, headers: { 'retry-after': '60' } }) });
    await assert.rejects(client.sessions(), error => {
      assert.ok(error instanceof ClutchApiError);
      assert.equal(error.status, status);
      assert.equal(error.retryAfter, '60');
      assert.ok(!error.message.includes('test-key'));
      assert.ok(!error.message.includes('Private response detail'));
      return true;
    });
  }
});
