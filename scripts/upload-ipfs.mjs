import { readdir, readFile } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'out');
const JWT = process.argv[2] || process.env.PINATA_JWT;

if (!JWT) {
  console.error('Usage: node scripts/upload-ipfs.mjs <JWT>  (or set PINATA_JWT)');
  process.exit(1);
}

async function getAllFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...await getAllFiles(full));
    else files.push(full);
  }
  return files;
}

async function main() {
  console.log('\n📦 Uploading out/ to IPFS via Pinata...\n');

  const files = await getAllFiles(OUT_DIR);
  console.log(`  Found ${files.length} files (${OUT_DIR})\n`);

  const form = new FormData();
  for (const file of files) {
    const rel = relative(OUT_DIR, file);
    const bytes = await readFile(file);
    const blob = new Blob([bytes]);
    form.append('file', blob, `investfi-eth/${rel}`);
  }
  form.append(
    'pinataMetadata',
    JSON.stringify({ name: `investfi-eth-${new Date().toISOString().slice(0, 10)}` })
  );
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  console.log('  Uploading...\n');
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${JWT}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`  ✗ Upload failed (${res.status}): ${err}`);
    process.exit(1);
  }

  const data = await res.json();
  const cid = data.IpfsHash;

  console.log('✅ Uploaded successfully!\n');
  console.log(`   CID:      ${cid}`);
  console.log(`   Gateway:  https://ipfs.io/ipfs/${cid}`);
  console.log(`   Pinata:   https://gateway.pinata.cloud/ipfs/${cid}`);
  console.log(`\n   Set as ENS contenthash:`);
  console.log(`   ipfs://${cid}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
