import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import App from './App'
import Issue from './pages/Issue'
import Verify from './pages/Verify'
import { Layout } from './components/Layout'
import Profile from './pages/Profile'
import './index.css'

const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask()
  ],
  transports: {
    [sepolia.id]: http()
  }
})

export { config }

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <App /> },
      { path: '/issue', element: <Issue /> },
      { path: '/verify', element: <Verify /> },
      { path: '/profile', element: <Profile /> }
    ]
  }
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
