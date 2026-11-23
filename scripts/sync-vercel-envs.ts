import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const envPath = path.resolve(process.cwd(), '.env.local');
const lines = fs.readFileSync(envPath, 'utf-8').split('\n');

const envsToSync: { key: string; val: string }[] = [];

lines.forEach((line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) {
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Unescape newlines for private key
    val = val.replace(/\\n/g, '\n');

    if (
      key &&
      !key.startsWith('#') &&
      !key.startsWith('VERCEL_') &&
      key !== 'NEXT_PUBLIC_APP_ENV' &&
      key !== 'NEXT_PUBLIC_APP_URL' &&
      key !== 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ) {
      if (key === 'NEXT_PUBLIC_USE_FIREBASE_EMULATOR') {
        val = 'false';
      }
      envsToSync.push({ key, val });
    }
  }
});

console.log(`Syncing ${envsToSync.length} variables to Vercel...`);

for (const { key, val } of envsToSync) {
  try {
    console.log(`Adding ${key}...`);
    execSync(`npx vercel env add ${key} --environment production,preview,development --force`, {
      input: val,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`✓ Added ${key}`);
  } catch (err: any) {
    // If it already exists, try update
    try {
      execSync(`npx vercel env update ${key} --environment production,preview,development`, {
        input: val,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      console.log(`✓ Updated ${key}`);
    } catch (updateErr: any) {
      console.warn(`! Notice on ${key}:`, updateErr.message?.slice(0, 100));
    }
  }
}

console.log('Finished syncing environment variables to Vercel.');
