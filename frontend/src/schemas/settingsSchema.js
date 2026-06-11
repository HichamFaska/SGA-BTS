import { z } from "zod"

export const profileSchema = z.object({
    first_name: z.string().min(1, "Le prénom est obligatoire."),
    last_name: z.string().min(1, "Le nom est obligatoire."),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})

export const emailSchema = z.object({
    email: z.string().email("L'adresse email doit être valide."),
    current_password: z.string().min(1, "Le mot de passe actuel est obligatoire."),
})

export const passwordSchema = z.object({
    current_password: z.string().min(1, "Le mot de passe actuel est obligatoire."),
    password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    password_confirmation: z.string().min(1, "La confirmation est obligatoire."),
}).refine((data) => data.password === data.password_confirmation, {
    message: "La confirmation du mot de passe ne correspond pas.",
    path: ["password_confirmation"],
})
