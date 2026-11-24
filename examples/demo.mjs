import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../fixtures/sessions.json', import.meta.url), 'utf8'));
console.log('Clutch Data API: offline example');
console.log('Synthetic data. No requests are sent to Clutch.\n');
for (const session of data.sessions) {
  const percentage = session.matches ? Math.round(100 * session.parsed / session.matches) : 0;
  console.log(`${session.title} (${session.region}): ${session.parsed}/${session.matches} matches parsed (${percentage}%)`);
}
