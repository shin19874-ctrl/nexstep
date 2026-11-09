import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Page not found</h1>
      <p className="mt-2">The page you're looking for doesn't exist.</p>
      <div className="mt-6"><Button to="/">Go home</Button></div>
    </div>
  )
}
