import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Veuillez saisir une adresse email valide."),
    password: z.string().min(1, "Le mot de passe est obligatoire."),
})
