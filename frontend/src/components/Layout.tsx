import { Link, NavLink, Outlet } from 'react-router-dom'
import { ConnectButton } from './ConnectButton'

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
      <path
        d="M12 2L20 6V12C20 17.55 16.58 20.74 12 22C7.42 20.74 4 17.55 4 12V6L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Layout() {
  return (
    <div className="min-h-dvh bg-app text-app">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <ShieldIcon />
            <span className="text-emerald-400">VeriVault</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/70">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}
              end
            >
              Home
            </NavLink>
            <NavLink to="/issue" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              Issue
            </NavLink>
            <NavLink to="/verify" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              Verify
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}>
              Profile
            </NavLink>
          </nav>

          <ConnectButton />
        </div>
      </header>

      <main className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_55%),radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
