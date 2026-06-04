import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/useAuth"
import { handleApiErrors } from "@/lib/api-errors"
import { loginSchema } from "@/schemas/loginSchema"

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values) => {
        try {
            const response = await login(values)
            toast.success(response.message)
            navigate("/dashboard", { replace: true })
        } catch (error) {
            if (!handleApiErrors(error, form.setError)) {
                toast.error(error.message)
            }
        }
    }

    return (
        <div className="w-full max-w-md space-y-10 rounded-2xl border bg-card p-10 shadow-sm">
            <div className="space-y-1.5 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Connexion
                </h1>
                <p className="text-sm text-muted-foreground">
                    Accedez a votre espace de gestion
                </p>
            </div>

            <FormProvider {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse email</FormLabel>
                                <FormControl>
                                    <Input type="email" autoComplete="email" placeholder="exemple@etablissement.fr" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input type="password" autoComplete="current-password" placeholder="Votre mot de passe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            "Connexion..."
                        ) : (
                            <>
                                <LogIn /> Se connecter
                            </>
                        )}
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}

export default Login
