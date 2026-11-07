import { useMemo } from 'react'

interface RouterHooks {
  useParams?: () => { username?: string }
  useNavigate?: () => (path: string) => void
}

/**
 * Public profile rendered for /@username.
 * The app router publishes username via window.__mockRouterHooks.
 */
export function PublicProfilePage() {
  const hooks = (typeof window !== 'undefined' ? (window as Window & { __mockRouterHooks?: RouterHooks }).__mockRouterHooks : undefined)

  const username = useMemo(() => {
    const fromHooks = hooks?.useParams?.().username
    if (fromHooks) return fromHooks
    if (typeof window === 'undefined') return ''
    const match = window.location.pathname.match(/^\/@([a-zA-Z0-9_-]+)/)
    return match?.[1] || ''
  }, [hooks])

  const goHome = () => {
    const navigate = hooks?.useNavigate?.()
    if (navigate) {
      navigate('/')
      return
    }
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={goHome}
          className="text-sm text-cyan-400 hover:text-cyan-300 mb-6"
        >
          Back to AgentForge
        </button>
        <h1 className="text-3xl font-bold">@{username || 'unknown'}</h1>
        <p className="mt-3 text-gray-400">Public agent profile</p>
      </div>
    </main>
  )
}
