import { z } from "zod"

export const studentSchema = z.object({
    first_name: z.string().min(1, "Le prénom est obligatoire."),
    last_name: z.string().min(1, "Le nom est obligatoire."),
    matricule: z.string().min(1, "Le matricule est obligatoire."),
    email: z.string().email("Email invalide.").optional().or(z.literal("")),
    birth_date: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})
