import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

function NotFound() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
            <div className="flex w-full max-w-xl flex-col items-center text-center">
                <p className="select-none text-[clamp(7rem,22vw,14rem)] font-black leading-none tracking-[-0.1em] text-foreground/10">
                    404
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Page introuvable
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                    La page que vous cherchez n&apos;existe pas ou a été déplacée.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 size-4" />
                        Revenir en arrière
                    </Button>
                </div>
            </div>
        </main>
    )
}

export default NotFound
