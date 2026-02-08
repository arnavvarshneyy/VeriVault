import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { config } from '../main'
import { VERIVAULT_ABI } from '../abi/VeriVault'
import { keccak256, toHex } from 'viem'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '').trim() as `0x${string}`
const ISSUER_ROLE = keccak256(toHex('ISSUER_ROLE'))

export default function Verify() {
  const [tokenId, setTokenId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [revokeLoading, setRevokeLoading] = useState(false)
  const [revokeError, setRevokeError] = useState<string>('')
  const [certificateFile, setCertificateFile] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)

  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const { data: isIssuer } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VERIVAULT_ABI,
    functionName: 'hasRole',
    args: address ? [ISSUER_ROLE as `0x${string}`, address] : undefined,
    query: { enabled: Boolean(CONTRACT_ADDRESS && address) }
  })

  const verifyUrl = useMemo(() => {
    if (!tokenId) return ''
    return `${window.location.origin}/verify?tokenId=${encodeURIComponent(tokenId)}`
  }, [tokenId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qp = params.get('tokenId')
    if (qp) setTokenId(qp)
  }, [])

  async function onVerify() {
    setLoading(true)
    setError('')
    setResult(null)
    setCertificateFile(null)
    setMetadata(null)
    try {
      // First get tokenURI from contract
      const tokenURI = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: VERIVAULT_ABI,
        functionName: 'verify',
        args: [BigInt(tokenId)]
      }) as [string, string, boolean, string]

      // Fetch metadata from IPFS
      const metadataUrl = tokenURI[1].replace('ipfs://', 'https://ipfs.io/ipfs/')
      const metadataResponse = await fetch(metadataUrl)
      const metadataData = await metadataResponse.json()
      setMetadata(metadataData)

      // Extract certificate file CID from metadata
      if (metadataData.image) {
        const certificateUrl = metadataData.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
        setCertificateFile(certificateUrl)
      }

      // Also get backend verification data for additional info
      const res = await fetch(`${BACKEND}/api/verify/${tokenId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Verification failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onRevoke() {
    try {
      setRevokeLoading(true)
      setRevokeError('')
      if (!isConnected) throw new Error('Connect your wallet')
      if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured')
      if (!tokenId) throw new Error('Token ID required')
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VERIVAULT_ABI,
        functionName: 'revoke',
        args: [BigInt(tokenId)]
      })
      if (!publicClient) throw new Error('No public client available')
      await publicClient.waitForTransactionReceipt({ hash: txHash })
      await onVerify()
    } catch (e: any) {
      setRevokeError(e.message || 'Revoke failed')
    } finally {
      setRevokeLoading(false)
    }
  }

  return (
    <div className="container py-12 sm:py-16 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Verify Certificate</h1>
        <p className="text-sm text-white/60">Paste a tokenId to validate ownership, revocation, and metadata.</p>
      </div>

      <div className="card space-y-4">
        <input
          className="input"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTokenId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onVerify} disabled={!tokenId || loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        {tokenId && verifyUrl && (
          <div className="pt-2 space-y-2">
            <div className="text-sm text-white/60">Share this verification link:</div>
            <a className="text-sm text-emerald-400 hover:text-emerald-300 underline" href={`/verify?tokenId=${encodeURIComponent(tokenId)}`}>
              {`/verify?tokenId=${tokenId}`}
            </a>
            <img
              alt="Verify QR"
              className="w-40 h-40 border border-white/10 rounded"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {revokeError && <p className="text-sm text-red-600">{revokeError}</p>}
        {result && (
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Owner:</span> {result.owner}</div>
              <div><span className="font-medium">Revoked:</span> {String(result.revoked)}</div>
              <div><span className="font-medium">File Hash:</span> {result.fileHash}</div>
              <div><span className="font-medium">Token URI:</span> {result.tokenURI}</div>
            </div>
            
            {Boolean(isIssuer) && (
              <button className="btn btn-secondary" onClick={onRevoke} disabled={revokeLoading || Boolean(result.revoked)}>
                {result.revoked ? 'Already revoked' : revokeLoading ? 'Revoking...' : 'Revoke (Issuer)'}
              </button>
            )}
            
            {metadata && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Certificate Details</h3>
                {metadata.name && <div><span className="font-medium">Name:</span> {metadata.name}</div>}
                {metadata.description && <div><span className="font-medium">Description:</span> {metadata.description}</div>}
                
                {metadata.attributes && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {metadata.attributes.map((attr: any, index: number) => (
                      <div key={index} className="bg-white/[0.04] rounded-lg p-3">
                        <p className="text-xs text-white/60">{attr.trait_type}</p>
                        <p className="text-sm font-medium">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {certificateFile && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Certificate File</h3>
                {certificateFile.match(/\.(pdf|jpe?g|png|gif|webp)$/i) ? (
                  <div className="border border-white/10 rounded-lg overflow-hidden">
                    {certificateFile.includes('.pdf') ? (
                      <div className="p-4 text-center">
                        <a
                          href={certificateFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          View PDF Certificate
                        </a>
                      </div>
                    ) : (
                      <img
                        src={certificateFile}
                        alt="Certificate"
                        className="w-full max-w-2xl mx-auto"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-white/[0.04] rounded-lg p-4">
                    <p className="text-sm text-white/60 mb-2">Certificate file:</p>
                    <a
                      href={certificateFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 underline text-sm"
                    >
                      {certificateFile}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
