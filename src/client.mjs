const BASE = 'https://clutchfn.com/data-api/v1';

export class ClutchApiError extends Error {
  constructor(status, retryAfter = null) {
    super(`Clutch API request failed (${status}).`);
    this.name = 'ClutchApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/** Server-side reference client. A valid customer key is required for live calls. */
export class ClutchClient {
  #apiKey;
  #fetch;

  constructor({ apiKey, fetchImpl = globalThis.fetch } = {}) {
    if (typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new TypeError('Provide your own Clutch API key.');
    }
    this.#apiKey = apiKey.trim();
    this.#fetch = fetchImpl;
  }

  async #get(path) {
    const response = await this.#fetch(`${BASE}${path}`, {
      headers: { 'x-api-key': this.#apiKey, accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    if (!response.ok) {
      throw new ClutchApiError(response.status, response.headers.get('retry-after'));
    }
    return response.json();
  }

  sessions({ limit = 25, offset = 0 } = {}) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError('limit must be an integer from 1 to 100.');
    }
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new RangeError('offset must be a non-negative integer.');
    }
    return this.#get(`/sessions?${new URLSearchParams({ limit, offset })}`);
  }

  match(matchId) {
    if (typeof matchId !== 'string' || !/^[a-f0-9]{32}$/i.test(matchId)) {
      throw new TypeError('matchId must be a 32-character hexadecimal match ID.');
    }
    return this.#get(`/matches/${matchId.toLowerCase()}`);
  }
}
