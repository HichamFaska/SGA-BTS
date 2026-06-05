import { Component } from "react"
import { useRouteError } from "react-router-dom"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

function ErrorUI({ message }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
                <div className="rounded-full bg-destructive/10 p-4">
                    <AlertTriangle className="size-8 text-destructive" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Une erreur est survenue
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {message || "Erreur inattendue."}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="gap-2"
                >
                    <RefreshCcw className="size-4" />
                    Recharger la page
                </Button>
            </div>
        </div>
    )
}

export function RouteErrorBoundary() {
    const error = useRouteError()
    const message = error?.message || error?.statusText || "Erreur inattendue."
    return <ErrorUI message={message} />
}

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    render() {
        if (!this.state.hasError) return this.props.children
        return <ErrorUI message={this.state.error?.message} />
    }
}

export default ErrorBoundary
