/**
 * scripts/fetch_trains.js
 *
 * Fetches the remote train_data.js and parses the `arrTrainList` var into JSON.
 *
 * Writes file: lib/constants/trains.json (at repo root)
 *
 * Usage:
 *   node scripts/fetch_trains.js
 *   node scripts/fetch_trains.js --input samples/train_data.js
 *
 * Env:
 *   TRAIN_DATA_URL optionally overrides the default fetch URL.
 *   REPO_ROOT can force the repository root path.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';
import { fileURLToPath } from 'url';

// ---------- Config ----------
const DEFAULT_URL = process.env.TRAIN_DATA_URL ||
  'https://enquiry.indianrail.gov.in/mntes/javascripts/train_data.js';

// ---------- Resolve repo root and output paths (robust) ----------
const scriptFilename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptFilename);

const candidates = [
  process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : null,
  path.resolve(scriptDir, '..'),
].filter(Boolean);

function looksLikeRepoRoot(dir) {
  try {
    if (!fsSync.existsSync(dir)) return false;
    if (fsSync.existsSync(path.join(dir, 'package.json'))) return true;
    if (fsSync.existsSync(path.join(dir, '.git'))) return true;
    return false;
  } catch (e) {
    return false;
  }
}

let ROOT = null;
for (const c of candidates) {
  if (looksLikeRepoRoot(c)) { ROOT = c; break; }
}
if (!ROOT) ROOT = process.cwd(); // fallback

const OUT_DIR = path.resolve(ROOT, 'lib/constants');
const OUT_FILE = path.resolve(OUT_DIR, 'trains.json');

// Debug
console.log('DEBUG: script file:', scriptFilename);
console.log('DEBUG: scriptDir:', scriptDir);
console.log('DEBUG: process.cwd():', process.cwd());
console.log('DEBUG: repo root candidates:', candidates);
console.log('DEBUG: selected ROOT:', ROOT);
console.log('DEBUG: OUT_DIR:', OUT_DIR);
console.log('DEBUG: OUT_FILE:', OUT_FILE);

// ---------- CLI args ----------
const argv = process.argv.slice(2);
let inputFile = null;
for (let i = 0; i < argv.length; i++) {
  if ((argv[i] === '--input' || argv[i] === '-i') && argv[i + 1]) {
    inputFile = argv[i + 1];
    i++;
  }
}

// ---------- Fetch helper ----------
function fetchUrl(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: { 'User-Agent': 'github-action-train-fetcher/1.0' },
        timeout: timeoutMs
      };
      const req = https.get(opts, (res) => {
        let data = '';
        res.on('data', c => data += c.toString('utf8'));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode} when fetching ${url}`));
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error('Request timed out'));
      });
    } catch (err) {
      reject(err);
    }
  });
}

// ---------- Extraction & parsing ----------
function extractArrayVar(jsText, varName = 'arrTrainList') {
  // Try multiple patterns to be robust against small variations
  const patterns = [
    new RegExp(`${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];?`, 'i'),
    new RegExp(`var\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\];?`, 'i'),
    new RegExp(`${varName}\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i') // if some object style
  ];
  for (const re of patterns) {
    const m = jsText.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

function extractStringsFromArrayContent(content) {
  if (!content) return [];
  const strings = [];
  // Matches "..." or '...' capturing inner content; s flag to include newlines
  const re = /(["'])(.*?)\1/gms;
  let match;
  while ((match = re.exec(content)) !== null) {
    strings.push(match[2]);
  }
  return strings;
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/^[,]+|[,]+$/g, '').trim();

  // Try to extract the first digit group (train number usually numeric with leading zeros)
  const firstDigit = s.match(/\d{1,6}/);
  if (firstDigit) {
    const idx = s.indexOf(firstDigit[0]);
    // Prefer hyphen after the number
    const hyphenAfter = s.indexOf('-', idx + firstDigit[0].length);
    if (hyphenAfter > -1) {
      const trainNo = s.slice(idx, hyphenAfter).trim();
      const trainName = s.slice(hyphenAfter + 1).trim();
      return {
        trainNo: trainNo.replace(/\D/g, '').padStart(trainNo.length, '0') || trainNo,
        trainName: (trainName || '').replace(/^[\s\-\:,]+|[\s\-\:,]+$/g, '').trim()
      };
    }
  }

  // Fallback: split on first hyphen anywhere
  const firstHyphen = s.indexOf('-');
  if (firstHyphen > -1) {
    const trainNo = s.slice(0, firstHyphen).trim();
    const trainName = s.slice(firstHyphen + 1).trim();
    return {
      trainNo: (trainNo || '').replace(/\D/g, ''),
      trainName: (trainName || '').replace(/^[\s\-\:,]+|[\s\-\:,]+$/g, '').trim()
    };
  }

  // Final fallback: first token is number, rest is name
  const parts = s.split(/\s+/);
  const trainNo = parts.shift() || '';
  const trainName = parts.join(' ').trim();
  return {
    trainNo: (trainNo || '').replace(/\D/g, ''),
    trainName: trainName.replace(/^[\s\-\:,]+|[\s\-\:,]+$/g, '').trim()
  };
}

async function parseFromText(jsText) {
  const arrContent = extractArrayVar(jsText, 'arrTrainList');
  if (!arrContent) {
    throw new Error('Could not find arrTrainList variable in provided JS text.');
  }

  const items = extractStringsFromArrayContent(arrContent);
  const cleaned = items
    .map(i => i.replace(/\r?\n/g, ' ').trim())
    .filter(i => i && i.length >= 3);

  const parsed = [];
  for (const raw of cleaned) {
    const entry = normalizeEntry(raw);
    if (!entry) continue;
    if ((!entry.trainNo || entry.trainNo.length === 0) && (!entry.trainName || entry.trainName.length === 0)) continue;
    // keep leading zeros by treating trainNo as string; ensure a minimal format
    const trainNo = String(entry.trainNo).trim();
    const trainName = String(entry.trainName || '').replace(/\s+/g, ' ').trim();
    parsed.push({ trainNo, trainName });
  }

  // dedupe preserving order
  const uniq = [];
  const seen = new Set();
  for (const p of parsed) {
    const key = `${p.trainNo}||${p.trainName}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(p);
    }
  }
  return uniq;
}

// ---------- Main ----------
async function main() {
  try {
    console.log('Starting fetch_trains.js');
    let jsText;
    if (inputFile) {
      const abs = path.resolve(process.cwd(), inputFile);
      console.log('Reading from local file (for testing):', abs);
      jsText = await fs.readFile(abs, 'utf8');
    } else {
      console.log('Fetching from network:', DEFAULT_URL);
      jsText = await fetchUrl(DEFAULT_URL);
    }

    const parsed = await parseFromText(jsText);
    if (!parsed || parsed.length === 0) {
      throw new Error('Parsing succeeded but produced zero train entries.');
    }

    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(OUT_FILE, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${OUT_FILE} with ${parsed.length} records.`);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err && err.message ? err.message : err);
    if (inputFile) {
      try {
        const sample = await fs.readFile(path.resolve(process.cwd(), inputFile), 'utf8');
        console.error('--- start of sample file (first 1000 chars) ---');
        console.error(sample.slice(0, 1000));
        console.error('--- end of sample file ---');
      } catch (e) {
        // ignore
      }
    }
    process.exit(2);
  }
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] && process.argv[1].endsWith('fetch_trains.js'))) {
  main();
}
