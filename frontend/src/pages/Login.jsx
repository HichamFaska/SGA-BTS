import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, LogIn, Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/useAuth"
import { handleApiErrors } from "@/lib/api-errors"
import { loginSchema } from "@/schemas/loginSchema"

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    const onSubmit = async (values) => {
        try {
            const response = await login(values)
            toast.success(response.message)
            navigate("/dashboard", { replace: true })
        } catch (error) {
            if (!handleApiErrors(error, form.setError)) {
                toast.error(error.message ?? "Une erreur est survenue.")
            }
        }
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LogIn className="size-5" />
                </div>
                <h1 className="pt-2 text-2xl font-semibold">Connexion</h1>
                <p className="text-sm text-muted-foreground">Accédez à votre espace de gestion.</p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse email</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input type="email" placeholder="exemple@etablissement.fr" className="pl-9" autoComplete="email" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input type="password" placeholder="Votre mot de passe" className="pl-9" autoComplete="current-password" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Se connecter
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}
