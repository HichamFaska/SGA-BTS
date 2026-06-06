import { z } from "zod"

export const subjectSchema = z.object({
    name: z.string()
        .min(1, "Le nom de la matière est obligatoire.")
        .max(255, "Le nom ne doit pas dépasser 255 caractères."),
})
