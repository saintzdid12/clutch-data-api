# Clutch: Fortnite Stats & Tournament Data API

A Fortnite stats API for FNCS, Cash Cups and competitive tournament data: player statistics, match results, leaderboards, replay analysis and zone-luck estimates.

**[Clutch](https://clutchfn.com) · [API documentation](https://clutchfn.com/developers) · [Methodology](https://clutchfn.com/info) · [Data coverage](https://clutchfn.com/status)**

I'm building Clutch as a competitive Fortnite tracker for players, fans and developers. The website and customer integrations use the same authenticated JSON API for tournament standings, per-match statistics and player performance analysis.

This is the public project overview and example client. The hosted API requires an account API key; cloning this repository does not grant access. The production server, replay parser, databases and trained models are kept outside this repository.

## What you can build

Use Fortnite tournament statistics for Discord bots, Twitch stream overlays, player scouting, stat cards and esports analytics tools.

Click a thumbnail for full size.

| Scouting | Stat cards | Stream overlays | Zone luck |
| --- | --- | --- | --- |
| <a href="assets/player.webp"><img src="assets/player.webp" width="160" alt="Player scouting and form"></a> | <a href="assets/statcard.webp"><img src="assets/statcard.webp" width="160" alt="Tournament summary card"></a> | <a href="assets/overlay.webp"><img src="assets/overlay.webp" width="160" alt="Watch-party qualification overlay"></a> | <a href="assets/zoneluck.webp"><img src="assets/zoneluck.webp" width="160" alt="Zone luck and alternative circles"></a> |
| **Fight maps** | **Drop ratings** | **Replay viewer*** | **Win probability*** |
| <a href="assets/fights.webp"><img src="assets/fights.webp" width="160" alt="Match fight map"></a> | <a href="assets/drops.webp"><img src="assets/drops.webp" width="160" alt="Drop spot ratings"></a> | <a href="assets/replay.webp"><img src="assets/replay.webp" width="160" alt="Website replay viewer"></a> | <a href="assets/winprob.webp"><img src="assets/winprob.webp" width="160" alt="Website win-probability chart"></a> |

*Replay viewing and second-by-second win probability are website-only. Other API features depend on your plan.

## Fortnite statistics and replay analysis

- **Replay processing:** turn tournament server replays into stored match and per-player statistics, with live tournament work taking priority.
- **Tournament summaries:** combine saved matches into player totals, stat rankings, weapon summaries and fight statistics.
- **Coverage reporting:** expose which matches are available so partial tournament data can be identified.
- **Expected performance:** estimate placement points from a player's situation and compare actual circle pulls with alternative directions to estimate zone luck.
- **A hosted stats API:** authenticated JSON endpoints, account-level quotas and access to advanced stats by plan.

Zone luck and expected points are model estimates. They have documented limitations and are not guarantees about an individual player's outcome. [How the estimates work](https://clutchfn.com/info).

## How the system fits together

```mermaid
flowchart LR
    A[Tournament server replays] --> B[Parsing workers]
    B --> C[Stored match statistics]
    C --> D[Background session summaries]
    C --> E[Authenticated JSON API]
    D --> E
    E --> F[Clutch website]
    E --> G[Customer integrations]
```

The backend uses Node.js, SQLite and object storage. The web application uses Next.js and TypeScript. Parsing and aggregation run separately from API requests, so a page or stats request can read saved results instead of processing a replay on demand.

Coverage is source-dependent and can be incomplete. Player histories describe stored matches, not every match a player has ever played.

## Try the offline example

Requires Node.js 20 or newer. No packages, API key or network access are needed for the default demo.

```sh
npm run demo
npm test
```

The demo reads [a synthetic response](fixtures/sessions.json) and prints a small coverage summary. Its tournament names and figures are invented examples, not production results.

## JavaScript / Node.js API example

For an actual integration, get your own key from your [Clutch account](https://clutchfn.com/account?tab=api). API requests are subject to your plan and consume its request allowance.

```js
import { ClutchClient } from './src/client.mjs';

// Run on your server. Keep the key in an environment variable.
const clutch = new ClutchClient({ apiKey: process.env.CLUTCH_API_KEY });
const result = await clutch.sessions({ limit: 5 });

for (const session of result.sessions) {
  console.log(`${session.title}: ${session.parsed}/${session.matches} matches parsed`);
}
```

The client includes session listing and match-stat requests. It is a small reference integration, not a complete SDK. Production API keys belong on your server, never in browser bundles or committed files.

## Fortnite API endpoints

Base URL: `https://clutchfn.com/data-api/v1`

| Endpoint | Purpose |
| --- | --- |
| `GET /sessions` | Stored tournament sessions and parsing counts |
| `GET /sessions/{eventId}/{windowId}/standings` | Tournament standings |
| `GET /sessions/{eventId}/{windowId}/coverage` | Parsing coverage for a session |
| `GET /matches/{matchId}` | Saved match statistics |
| `GET /sessions/{eventId}/{windowId}/luck` | Model-based luck and performance summaries; plan restrictions apply |

The [live documentation](https://clutchfn.com/developers) is the reference for available endpoints, parameters, plans and limits. Customer API access covers statistics; raw replays, movement tracks and website replay viewing are not provided by this example client.

## Repository contents

```text
src/client.mjs         Small server-side API client
examples/demo.mjs      Offline coverage demo
fixtures/sessions.json  Clearly labelled synthetic data
test/client.test.mjs   Request, authentication and error-handling checks
assets/               Screenshots used on Clutch's API page
```

This project is in active development. Clutch is not affiliated with Epic Games.
