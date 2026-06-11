import { Ban } from "lucide-react"

function Forbidden() {
    return (
        <div className="min-h-screen bg-background px-4 py-12 text-foreground flex items-center justify-center">
            <div className="w-full max-w-md rounded-md p-8">
                <div className="flex flex-col items-center gap-5 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-500/15 text-red-500">
                        <Ban className="h-7 w-7" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm uppercase tracking-[0.35em] text-red-500/80">
                            Erreur 403
                        </p>
                        <h1 className="text-3xl font-semibold text-foreground">
                            Accès refusé
                        </h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Vous n&apos;avez pas les permissions nécessaires pour voir cette page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Forbidden
