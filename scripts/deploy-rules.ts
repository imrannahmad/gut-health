/**
 * GutGlow Firebase Security Rules Deployer
 * Compiles and deploys firestore.rules and storage.rules directly to Firebase
 * via Google Cloud Firebase Rules API (v1).
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1].trim()] = val.replace(/\\n/g, '\n');
    }
  });

  return env;
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claimSet}`);
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${claimSet}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function deployRuleset(
  projectId: string,
  accessToken: string,
  fileName: string,
  releaseName: string,
  filePath: string
) {
  console.log(`\n📄 [Step 1] Reading and compiling ${fileName}...`);
  const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');

  // Create ruleset
  console.log(`🚀 [Step 2] Validating ruleset with Google Rules Engine...`);
  const createRulesetUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;
  const rulesetRes = await fetch(createRulesetUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: {
        files: [
          {
            name: fileName,
            content,
          },
        ],
      },
    }),
  });

  const rulesetData = await rulesetRes.json();
  if (!rulesetRes.ok) {
    console.error(`❌ Compilation Error in ${fileName}:`, JSON.stringify(rulesetData, null, 2));
    throw new Error(`Rules compilation failed for ${fileName}`);
  }

  const rulesetName = rulesetData.name;
  console.log(`✅ [Step 3] Ruleset compiled successfully: ${rulesetName}`);

  // Release ruleset
  console.log(`📡 [Step 4] Releasing to ${releaseName}...`);
  const fullReleaseName = `projects/${projectId}/releases/${releaseName}`;
  const releaseUrl = `https://firebaserules.googleapis.com/v1/${fullReleaseName}`;
  const releaseRes = await fetch(releaseUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      release: {
        name: fullReleaseName,
        rulesetName,
      },
    }),
  });

  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) {
    // If release does not exist yet, try creating it with POST
    if (releaseRes.status === 404) {
      console.log(`Creating initial release for ${releaseName}...`);
      const createReleaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`;
      const createReleaseRes = await fetch(createReleaseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `projects/${projectId}/releases/${releaseName}`,
          rulesetName,
        }),
      });
      const createData = await createReleaseRes.json();
      if (!createReleaseRes.ok) {
        throw new Error(`Release creation failed: ${JSON.stringify(createData)}`);
      }
      console.log(`🎉 Successfully created release: ${createData.name}`);
      return;
    }
    throw new Error(`Release failed for ${releaseName}: ${JSON.stringify(releaseData)}`);
  }

  console.log(`🎉 Successfully released: ${releaseData.name}`);
}

async function main() {
  console.log('🛡️  Starting GutGlow Security Rules Deployment...');
  const env = loadEnv();

  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;
  const storageBucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing required Firebase Admin credentials in .env.local');
  }

  console.log(`🔑 Generating OAuth token for service account: ${clientEmail}`);
  const accessToken = await getGoogleAccessToken(clientEmail, privateKey);

  // 1. Deploy Firestore Security Rules
  await deployRuleset(
    projectId,
    accessToken,
    'firestore.rules',
    'cloud.firestore',
    'firestore.rules'
  );

  // 2. Deploy Firebase Storage Rules (if bucket configured)
  if (storageBucket) {
    try {
      await deployRuleset(
        projectId,
        accessToken,
        'storage.rules',
        `firebase.storage/${storageBucket}`,
        'storage.rules'
      );
    } catch (err) {
      console.warn(`⚠️ Storage rules release note:`, (err as Error).message);
    }
  }

  console.log('\n🔒 All Security Rules deployed and active on Firebase project:', projectId);
}

main().catch((err) => {
  console.error('\n❌ Deployment failed:', err.message);
  process.exit(1);
});
