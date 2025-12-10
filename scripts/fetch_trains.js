/**
 * scripts/fetch_trains.js
 *
 * Fetches the remote train_data.js and parses the `arrTrainList` var into JSON.
 *
 * Writes file: lib/constants/trains.json
 *
 * Usage in GH Actions: node scripts/fetch_trains.js
 * You can override URL by setting env TRAIN_DATA_URL.
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { URL } from 'url';

const DEFAULT_URL = process.env.TRAIN_DATA_URL || 'https://enquiry.indianrail.gov.in/mntes/javascripts/train_data.js?v=2025121010';

// === CHANGE: write into existing library constants folder ===
const OUT_DIR = 'lib/constants';
const OUT_FILE = path.join(OUT_DIR, 'trains.json');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'github-action-train-fetcher/1.0 (+https://github.com)'
        }
      };
      https.get(opts, (res) => {
        let data = '';
        res.on('data', c => data += c.toString('utf8'));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode}`));
        });
      }).on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

function extractArrayVar(jsText, varName = 'arrTrainList') {
  // find arrTrainList = [ ... ];
  const re = new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];?`, 'i');
  const m = jsText.match(re);
  if (!m) return null;
  return m[1]; // content inside brackets
}

function extractStringsFromArrayContent(content) {
  // Find double-quoted strings and single-quoted strings.
  const strings = [];
  const re = /(["'])(.*?)\1/gms;
  let match;
  while ((match = re.exec(content)) !== null) {
    strings.push(match[2]);
  }
  return strings;
}

function normalizeEntry(raw) {
  // replace non-breaking spaces, trim & collapse multiple spaces
  let s = raw.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();

  // Trim stray commas/punctuation at ends
  s = s.replace(/^[,]+|[,]+$/g, '').trim();

  const hyphenIndex = s.indexOf('-');
  if (hyphenIndex > 0) {
    const rawNo = s.slice(0, hyphenIndex).trim();
    let name = s.slice(hyphenIndex + 1).trim();

    // If trainNo contains spaces, take first token as number
    let trainNo = rawNo.split(/\s+/)[0];

    // Fallback: find first digit-group if trainNo weird
    const dMatch = trainNo.match(/\d+/);
    if (dMatch) trainNo = dMatch[0];

    name = name.replace(/^[\s\-\:,]+|[\s\-\:,]+$/g, '').trim();
    return { trainNo, trainName: name };
  } else {
    const parts = s.split(/\s+/);
    let trainNo = parts.shift() || '';
    const name = parts.join(' ').trim();
    return { trainNo: trainNo.trim(), trainName: name };
  }
}

async function main() {
  try {
    console.log('Fetching', DEFAULT_URL);
    const js = await fetchUrl(DEFAULT_URL);

    const arrContent = extractArrayVar(js, 'arrTrainList');
    if (!arrContent) {
      throw new Error('Could not find arrTrainList variable in response');
    }

    const items = extractStringsFromArrayContent(arrContent);
    const cleaned = items
      .map(i => i.replace(/\r?\n/g, ' ').trim())
      .filter(i => i && i.length >= 3);

    const parsed = [];
    for (const raw of cleaned) {
      const entry = normalizeEntry(raw);
      if ((!entry.trainNo || entry.trainNo.length === 0) && (!entry.trainName || entry.trainName.length === 0)) {
        continue;
      }
      const trainNo = String(entry.trainNo).trim();
      const trainName = String(entry.trainName || '').replace(/\s+/g, ' ').trim();
      parsed.push({ trainNo, trainName });
    }

    // remove duplicates
    const uniq = [];
    const seen = new Set();
    for (const p of parsed) {
      const key = `${p.trainNo}||${p.trainName}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniq.push(p);
      }
    }

    // Ensure out dir exists
    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(OUT_FILE, JSON.stringify(uniq, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${OUT_FILE} with ${uniq.length} records.`);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(2);
  }
}

// If executed directly
if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('fetch_trains.js'))) {
  main();
}
