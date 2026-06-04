import { Loader2 } from 'lucide-react'

function PageLoader() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Chargement" />
    </main>
  )
}

export default PageLoader
