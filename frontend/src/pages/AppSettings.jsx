import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Loader2, Settings, Trash2 } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { handleApiErrors } from "@/lib/api-errors"
import profileService from "@/services/profileService"
import { profileSchema, emailSchema, passwordSchema } from "@/schemas/settingsSchema"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    FormProvider, FormField, FormItem,
    FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"

export default function AppSettings() {
    const { user, setUser } = useAuth()
    const { success: toastSuccess, error: toastError } = useToast()
    const avatarInputRef = useRef(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [deletingAvatar, setDeletingAvatar] = useState(false)

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user.first_name ?? "",
            last_name: user.last_name ?? "",
            phone: user?.phone ?? "",
            address: user?.address ?? "",
        },
    })

    const emailForm = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: user.email ?? "", current_password: "" },
    })

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { current_password: "", password: "", password_confirmation: "" },
    })

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file){
             return
        }
        setUploadingAvatar(true)
        try {
            const response = await profileService.updateAvatar(file)
            setUser(response.data.user)
            toastSuccess(response.message)
        } catch (err) {
            toastError(err?.message ?? "Impossible de mettre à jour l'avatar.")
        } finally {
            setUploadingAvatar(false)
            e.target.value = ""
        }
    }

    const handleDeleteAvatar = async () => {
        setDeletingAvatar(true)
        try {
            const response = await profileService.deleteAvatar()
            setUser(response.data.user)
            toastSuccess(response.message)
        } catch (err) {
            toastError(err?.message ?? "Impossible de supprimer l'avatar.")
        } finally {
            setDeletingAvatar(false)
        }
    }

    const onSubmitProfile = async (values) => {
        try {
            const response = await profileService.update(values)
            setUser(response.data.user)
            toastSuccess(response.message)
        } catch (err) {
            if (!handleApiErrors(err, profileForm.setError)) {
                toastError(err?.message)
            }
        }
    }

    const onSubmitEmail = async (values) => {
        try {
            const response = await profileService.updateEmail(values)
            setUser(response.data.user)
            emailForm.reset({ email: response.data.user.email, current_password: "" })
            toastSuccess(response.message)
        } catch (err) {
            if (!handleApiErrors(err, emailForm.setError)) {
                toastError(err?.message)
            }
        }
    }

    const onSubmitPassword = async (values) => {
        try {
            const response = await profileService.updatePassword(values)
            passwordForm.reset()
            toastSuccess(response.message)
        } catch (err) {
            if (!handleApiErrors(err, passwordForm.setError)) {
                toastError(err?.message)
            }
        }
    }

    if (!user){
        return null
    } 

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Settings className="size-6 text-muted-foreground" />
                <div>
                    <h1 className="text-2xl font-bold">Paramètres</h1>
                    <p className="text-sm text-muted-foreground">Gérez votre profil et votre compte.</p>
                </div>
            </div>

            <Tabs defaultValue="profile">
                <TabsList>
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="account">Compte</TabsTrigger>
                </TabsList>

                {/* Profil */}
                <TabsContent value="profile" className="mt-6 space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>Photo de profil</CardTitle>
                            <CardDescription>Cliquez sur l&apos;avatar pour le modifier.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar key={user.avatar} className="size-20">
                                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                        <AvatarFallback className="text-lg">{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        {uploadingAvatar
                                            ? <Loader2 className="size-5 text-white animate-spin" />
                                            : <Camera className="size-5 text-white" />
                                        }
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        <p>Formats acceptés : JPEG, PNG, WebP</p>
                                        <p>Taille maximale : 2 Mo</p>
                                    </div>
                                    {user.avatar && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteAvatar}
                                            disabled={deletingAvatar}
                                        >
                                            {deletingAvatar
                                                ? <Loader2 className="mr-2 size-3.5 animate-spin" />
                                                : <Trash2 className="mr-2 size-3.5" />
                                            }
                                            Supprimer l&apos;avatar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>Modifiez vos informations de base.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={profileForm.control} name="first_name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prénom</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={profileForm.control} name="last_name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={profileForm.control} name="phone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Téléphone</FormLabel>
                                                <FormControl><Input placeholder="06 00 00 00 00" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={profileForm.control} name="address" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Adresse</FormLabel>
                                                <FormControl><Input placeholder="Rue, ville..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                            {profileForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Compte */}
                <TabsContent value="account" className="mt-6 space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle>Adresse email</CardTitle>
                            <CardDescription>Modifiez votre adresse email de connexion.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                                    <FormField control={emailForm.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nouvel email</FormLabel>
                                            <FormControl><Input type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={emailForm.control} name="current_password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe actuel</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                                            {emailForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Mettre à jour l&apos;email
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mot de passe</CardTitle>
                            <CardDescription>Choisissez un mot de passe fort d&apos;au moins 8 caractères.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...passwordForm}>
                                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                                    <FormField control={passwordForm.control} name="current_password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mot de passe actuel</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={passwordForm.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nouveau mot de passe</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={passwordForm.control} name="password_confirmation" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmer le mot de passe</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                            {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                            Changer le mot de passe
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>

                </TabsContent>
            </Tabs>
        </div>
    )
}
