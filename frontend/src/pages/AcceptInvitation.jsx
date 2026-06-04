import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Lock, Loader2, CheckCircle2, MailWarning } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    FormProvider, FormField, FormItem,
    FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import invitationService from "@/services/invitationService"
import { acceptInvitationSchema } from "@/schemas/acceptInvitationSchema"
import { handleApiErrors } from "@/lib/api-errors"

export default function AcceptInvitation() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [checking, setChecking] = useState(true)
    const [invalid, setInvalid] = useState(false)
    const [done, setDone] = useState(false)

    const form = useForm({
        resolver: zodResolver(acceptInvitationSchema),
        defaultValues: { password: "", password_confirmation: "" },
    })

    useEffect(() => {
        if (!token) { 
            setInvalid(true);
            setChecking(false);
            return
        }
        invitationService.show(token)
            .then(() => setChecking(false))
            .catch(() => { 
                setInvalid(true);
                setChecking(false)
        })
    }, [token])

    const onSubmit = async (values) => {
        try {
            await invitationService.accept(token, values)
            setDone(true)
        } catch (err) {
            if (!handleApiErrors(err, form.setError)) {
                form.setError("root", { message: err.message ?? "Une erreur est survenue." })
            }
        }
    }

    if (checking) return (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Vérification du lien…</p>
        </div>
    )

    if (invalid) return (
        <div className="w-full max-w-sm space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <MailWarning className="size-6" />
            </div>
            <h1 className="text-xl font-semibold">Lien invalide ou expiré</h1>
            <p className="text-sm text-muted-foreground">Ce lien d&apos;invitation n&apos;est plus valide.</p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login", { replace: true })}>
                Retour à la connexion
            </Button>
        </div>
    )

    if (done) return (
        <div className="w-full max-w-sm space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-6" />
            </div>
            <h1 className="text-xl font-semibold">Compte activé</h1>
            <p className="text-sm text-muted-foreground">Votre mot de passe a été défini. Vous pouvez maintenant vous connecter.</p>
            <Button className="w-full" onClick={() => navigate("/login", { replace: true })}>
                Se connecter
            </Button>
        </div>
    )

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="size-5" />
                </div>
                <h1 className="pt-2 text-2xl font-semibold">Définir mon mot de passe</h1>
                <p className="text-sm text-muted-foreground">Choisissez un mot de passe pour activer votre compte.</p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input type="password" placeholder="Min. 8 caractères" className="pl-9" autoComplete="new-password" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="password_confirmation" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input type="password" placeholder="Répétez le mot de passe" className="pl-9" autoComplete="new-password" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {form.formState.errors.root && (
                        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Activer mon compte
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}
