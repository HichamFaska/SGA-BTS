import { z } from "zod"

export const filiereSchema = z.object({
    name: z.string()
        .min(1, "Le nom de la filière est obligatoire.")
        .max(255, "Le nom ne doit pas dépasser 255 caractères."),

    code: z.string()
        .min(1, "Le code de la filière est obligatoire.")
        .max(50, "Le code ne doit pas dépasser 50 caractères."),
})
