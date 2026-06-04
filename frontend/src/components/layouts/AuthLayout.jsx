import { Outlet } from 'react-router-dom'

const APP_NAME = import.meta.env.VITE_APP_NAME

export function AuthLayout() {
    return (
        <main className="grid min-h-dvh bg-background lg:grid-cols-[0.95fr_1.05fr]">
            <section className="hidden border-r bg-muted/35 p-8 lg:flex lg:flex-col lg:justify-between">
                <div>
                    <div className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-xl font-bold">
                        { APP_NAME }
                    </div>
                </div>

                <div className="max-w-md space-y-4">
                    <h1 className="text-3xl font-semibold tracking-normal">
                        Une gestion académique plus intelligente.
                    </h1>
                    <p className="text-muted-foreground">
                        Contrôlez les présences, suivez les justificatifs d'absence et accédez aux informations essentielles en temps réel.
                    </p>
                </div>
            </section>

            <section className="flex min-h-dvh items-center justify-center px-4 py-8">
                <Outlet />
            </section>
        </main>
    )
}

