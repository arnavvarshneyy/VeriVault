import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask, injected } from 'wagmi/connectors'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button className="btn btn-secondary" onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)} • Disconnect
      </button>
    )
  }

  return (
    <button className="btn btn-ghost" onClick={() => connect({ connector: metaMask() })} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
