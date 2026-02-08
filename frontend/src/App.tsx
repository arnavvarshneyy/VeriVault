import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="container py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
            <path
              d="M12 2L20 6V12C20 17.55 16.58 20.74 12 22C7.42 20.74 4 17.55 4 12V6L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
          Blockchain Certificates
          <span className="block text-emerald-500">That Can't Be Faked</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-white/60">
          Issue, verify, and manage certificates on-chain with tamper-proof metadata.
          Instant verification, forever accessible.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link className="btn btn-primary w-full sm:w-auto" to="/issue">
            Issue Certificate
          </Link>
          <Link className="btn btn-secondary w-full sm:w-auto" to="/verify">
            Verify Certificate
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-24 grid gap-8 sm:grid-cols-3">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">100% Tamper-Proof</h3>
          <p className="text-sm text-white/60">Certificates are stored on-chain with immutable metadata and cryptographic proofs.</p>
        </div>
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Instant Verification</h3>
          <p className="text-sm text-white/60">Anyone can verify certificate authenticity with a single click—no intermediaries.</p>
        </div>
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Forever Accessible</h3>
          <p className="text-sm text-white/60">Decentralized storage ensures certificates remain accessible as long as the network exists.</p>
        </div>
      </div>

      {/* Why Not Store Everything On-Chain? */}
      <div className="mt-24 space-y-6">
        <h2 className="text-center text-3xl font-semibold">Why Not Store Everything On-Chain?</h2>
        <p className="text-center text-base text-white/60 max-w-2xl mx-auto">
          Combining blockchain verification with decentralized storage gives you the best of both worlds: immutability and affordability.
        </p>

        <div className="mx-auto max-w-2xl">
          <table className="w-full rounded-xl border border-white/10 bg-white/[0.03]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-4 text-left text-sm font-medium text-white/80">Data Type</th>
                <th className="px-8 py-4 text-left text-sm font-medium text-white/80">Cost on Sui</th>
                <th className="px-9 py-4 text-left text-sm font-medium text-white/80">Cost on Walrus</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="px-5 py-4 text-sm">Certificate PDF</td>
                <td className="px-2 py-4 text-sm text-emerald-400">Not stored on-chain</td>
                <td className="px-5 py-4 text-sm text-emerald-400">~$0.0000001–$0.0005</td>
              </tr>
              <tr>
                <td className="px-5 py-4 text-sm">IPFS CID (hash)</td>
                <td className="px-9 py-4 text-sm text-emerald-400">~$0.05</td>
                <td className="px-16 py-4 text-sm text-emerald-400">Free</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-center text-sm text-white/40">
            Storing a 5MB file directly on-chain would cost 100,000x more!
          </p>
        </div>
      </div>
    </div>
  )
}
