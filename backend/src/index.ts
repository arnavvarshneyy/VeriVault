import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { pinFile, pinJSON } from './pinata';

const PORT = Number(process.env.PORT || 4000);
const PINATA_JWT = process.env.PINATA_JWT || '';
const RPC_URL = process.env.RPC_URL || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Minimal ABI for reads
const ABI = [
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function verify(uint256 tokenId) view returns (address owner, string uri, bool revoked, bytes32 fileHash)'
];

function getProvider() {
  if (!RPC_URL) throw new Error('RPC_URL not set');
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getContract() {
  if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS not set');
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, getProvider());
}

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.get('/test-env', (_req: Request, res: Response) => {
  res.json({
    PINATA_JWT: process.env.PINATA_JWT ? 'SET' : 'NOT SET',
    RPC_URL: process.env.RPC_URL ? 'SET' : 'NOT SET',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS ? 'SET' : 'NOT SET',
    IPFS_GATEWAY: process.env.IPFS_GATEWAY || 'DEFAULT'
  });
});

// Upload certificate file to IPFS via Pinata
app.post('/api/ipfs/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!PINATA_JWT) return res.status(500).json({ error: 'PINATA_JWT not configured' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file is required' });

    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const pinned = await pinFile(file, PINATA_JWT);
    const cid = pinned.IpfsHash;

    return res.json({ cid, file_hash_sha256: `0x${hash}` });
  } catch (err: any) {
    console.error('Upload failed:', err?.response?.status, err?.response?.data || err?.message || err);
    return res.status(500).json({
      error: err?.response?.data || err?.message || 'upload failed'
    });
  }
});

// Pin NFT metadata JSON to IPFS
app.post('/api/ipfs/metadata', async (req: Request, res: Response) => {
  try {
    if (!PINATA_JWT) return res.status(500).json({ error: 'PINATA_JWT not configured' });
    const meta = req.body || {};
    const pinned = await pinJSON(meta, PINATA_JWT);
    const cid = pinned.IpfsHash;
    return res.json({ cid });
  } catch (err: any) {
    console.error('Pin metadata failed:', err?.response?.status, err?.response?.data || err?.message || err);
    return res.status(500).json({ error: err?.response?.data || err?.message || 'pin metadata failed' });
  }
});

// Verify a tokenId: reads on-chain and IPFS metadata
app.get('/api/verify/:tokenId', async (req: Request, res: Response) => {
  try {
    const tokenId = req.params.tokenId;
    const c = getContract();
    const v = await c.verify(tokenId);
    const tokenUri: string = v.uri || (await c.tokenURI(tokenId));

    // Resolve ipfs:// to gateway URL
    const metadataUrl = tokenUri.startsWith('ipfs://')
      ? IPFS_GATEWAY + tokenUri.replace('ipfs://', '')
      : tokenUri;

    let metadata: any = null;
    try {
      const resp = await fetch(metadataUrl);
      if (resp.ok) metadata = await resp.json();
    } catch {}

    return res.json({
      tokenId,
      owner: v.owner,
      revoked: v.revoked,
      fileHash: v.fileHash,
      tokenURI: tokenUri,
      metadata
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
