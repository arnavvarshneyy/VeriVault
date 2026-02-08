import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { readContract } from 'wagmi/actions'
import { config } from '../main'
import { CONTRACT_ADDRESS } from '../main'
import { VERIVAULT_ABI } from '../abi/VeriVault'

interface Certificate {
  tokenId: string
  owner: string
  tokenURI: string
  fileHash: string
  revoked: boolean
  metadata?: any
}

export default function Profile() {
  const { address, isConnected } = useAccount()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (isConnected && address) {
      fetchCertificates()
    }
  }, [isConnected, address])

  const fetchCertificates = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const userCerts: Certificate[] = []
      let tokenId = 1
      const maxTokens = 1000 // Safety limit to prevent infinite loops
      
      // Check tokens sequentially starting from 1
      while (tokenId <= maxTokens) {
        try {
          const owner = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: VERIVAULT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          }) as string

          if (owner.toLowerCase() === address.toLowerCase()) {
            const result = await readContract(config, {
              address: CONTRACT_ADDRESS,
              abi: VERIVAULT_ABI,
              functionName: 'verify',
              args: [BigInt(tokenId)],
            }) as [string, string, boolean, string]

            userCerts.push({
              tokenId: tokenId.toString(),
              owner: result[0],
              tokenURI: result[1],
              fileHash: result[3],
              revoked: result[2],
            })
          }
          tokenId++
        } catch (error) {
          // Token doesn't exist, stop searching
          break
        }
      }

      // Fetch metadata for each certificate
      const certsWithMetadata = await Promise.all(
        userCerts.map(async (cert) => {
          try {
            const response = await fetch(cert.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/'))
            const metadata = await response.json()
            return { ...cert, metadata }
          } catch {
            return cert
          }
        })
      )

      setCertificates(certsWithMetadata)
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = searchQuery === '' || 
      cert.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !cert.revoked) ||
      (statusFilter === 'revoked' && cert.revoked)

    return matchesSearch && matchesStatus
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Connect Your Wallet</h2>
          <p className="text-white/60">Please connect your wallet to view your certificates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-white/60">Manage your certificates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Info */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/60">Account</p>
                  <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-sm text-white/60">Certificates</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search certificates...</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
                  placeholder="Search..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              <button
                onClick={fetchCertificates}
                disabled={loading}
                className="w-full btn btn-secondary"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Certificates</h2>
                <span className="text-sm text-white/60">{filteredCertificates.length} certificates</span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-white/60">Loading certificates...</p>
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">No certificates found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredCertificates.map((cert) => (
                    <div key={cert.tokenId} className="bg-white/[0.02] border border-white/10 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold">
                              {cert.metadata?.name || `Certificate #${cert.tokenId}`}
                            </h3>
                            {cert.revoked && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Revoked</span>
                            )}
                          </div>
                          
                          <p className="text-white/60 mb-4">
                            {cert.metadata?.description || 'No description available'}
                          </p>

                          {cert.metadata?.attributes && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              {cert.metadata.attributes.map((attr: any, index: number) => (
                                <div key={index} className="bg-white/[0.04] rounded-lg p-3">
                                  <p className="text-xs text-white/60">{attr.trait_type}</p>
                                  <p className="text-sm font-medium">{attr.value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-white/40">
                            <span>Token ID: {cert.tokenId}</span>
                            <span>•</span>
                            <span>Hash: {cert.fileHash.slice(0, 10)}...</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <a
                            href={`/verify?tokenId=${cert.tokenId}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Verify
                          </a>
                          {cert.metadata?.image && (
                            <a
                              href={cert.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
