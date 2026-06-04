import { z } from "zod"

export const acceptInvitationSchema = z.object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
    password_confirmation: z.string().min(8, "La confirmation du mot de passe est obligatoire."),
})
.refine((data) => data.password === data.password_confirmation, {
    message: "La confirmation du mot de passe ne correspond pas.",
    path: ["password_confirmation"],
})
