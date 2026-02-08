import { useMemo, useState, type ChangeEvent } from 'react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { VERIVAULT_ABI } from '../abi/VeriVault'
import { parseEventLogs } from 'viem'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4001'
const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '').trim() as `0x${string}`

export default function Issue() {
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const [recipient, setRecipient] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [mintedTokenId, setMintedTokenId] = useState<string>('')

  const verifyUrl = useMemo(() => {
    if (!mintedTokenId) return ''
    return `${window.location.origin}/verify?tokenId=${encodeURIComponent(mintedTokenId)}`
  }, [mintedTokenId])

  async function handleUploadAndMint() {
    try {
      setLoading(true)
      setMessage('Uploading file to IPFS via Pinata...')
      setError('')
      setMintedTokenId('')

      if (!isConnected) throw new Error('Connect your wallet')
      if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
      if (!recipient || !file) throw new Error('Recipient and file required')

      // 1) Upload file
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch(`${BACKEND}/api/ipfs/upload`, { method: 'POST', body: fd })
      const up = await upRes.json()
      if (!upRes.ok) throw new Error(up?.error || 'Upload failed')
      const fileCid: string = up.cid
      const fileHash: `0x${string}` = up.file_hash_sha256

      // 2) Create metadata and pin
      setMessage('Pinning metadata JSON to IPFS...')
      const metadata = {
        name: 'Certificate',
        description: 'VeriVault NFT-based certificate',
        animation_url: `ipfs://${fileCid}`,
        file_cid: fileCid,
        file_hash_sha256: fileHash,
        attributes: [
          { trait_type: 'Recipient', value: recipient },
          { trait_type: 'Issuer', value: address },
          { trait_type: 'IssueDate', value: new Date().toISOString() }
        ]
      }
      const metaRes = await fetch(`${BACKEND}/api/ipfs/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      })
      const meta = await metaRes.json()
      if (!metaRes.ok) throw new Error(meta?.error || 'Metadata pin failed')
      const metadataCid: string = meta.cid

      // 3) Mint via MetaMask
      setMessage('Sending mint transaction...')
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VERIVAULT_ABI,
        functionName: 'mintCertificate',
        args: [recipient as `0x${string}`, `ipfs://${metadataCid}`, fileHash]
      })

      setMessage(`Transaction submitted: ${txHash}. Waiting for confirmation...`)

      if (!publicClient) throw new Error('No public client available')
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      let tokenId: string | null = null
      try {
        const parsed = parseEventLogs({
          abi: VERIVAULT_ABI,
          logs: receipt.logs
        })
        const minted = parsed.find((e) => e.eventName === 'CertificateMinted')
        if (minted) tokenId = String((minted.args as any).tokenId)
      } catch {
        // ignore
      }

      if (!tokenId) {
        try {
          const blockLogs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            fromBlock: receipt.blockNumber,
            toBlock: receipt.blockNumber
          })
          const parsed = parseEventLogs({
            abi: VERIVAULT_ABI,
            logs: blockLogs
          })
          const minted = parsed.find((e) => e.eventName === 'CertificateMinted' && (e as any).transactionHash === txHash)
          if (minted) tokenId = String((minted.args as any).tokenId)
        } catch {
          // ignore
        }
      }

      if (!tokenId) {
        setMessage(`Mint confirmed (tx: ${txHash}). Could not decode tokenId from logs.`)
        return
      }

      setMintedTokenId(tokenId)
      setMessage(`Mint confirmed. tokenId: ${tokenId}`)
    } catch (e: any) {
      setError(e.message || 'Issuance failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 sm:py-16 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Issue Certificate</h1>
        <p className="text-sm text-white/60">Upload a file, pin metadata, and mint your certificate NFT.</p>
      </div>

      <div className="card space-y-4">
        <input
          className="input"
          placeholder="Recipient address 0x..."
          value={recipient}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)}
        />
        <input
          className="input"
          type="file"
          accept="application/pdf,image/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
        />
        <button className="btn btn-primary" disabled={!recipient || !file || loading} onClick={handleUploadAndMint}>
          {loading ? 'Processing...' : 'Upload + Mint'}
        </button>
        {message && <p className="text-sm text-white/60">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {mintedTokenId && verifyUrl && (
          <div className="pt-2 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Minted tokenId:</span> {mintedTokenId}
            </div>
            <a className="text-sm text-emerald-400 hover:text-emerald-300 underline" href={`/verify?tokenId=${encodeURIComponent(mintedTokenId)}`}>
              Open verify page
            </a>
            <img
              alt="Verify QR"
              className="w-40 h-40 border border-white/10 rounded"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
