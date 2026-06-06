import { z } from "zod"

export const classeSchema = z.object({
    name: z.string()
        .min(1, "Le nom de la classe est obligatoire.")
        .max(255, "Le nom ne doit pas dépasser 255 caractères."),

    level: z.string()
        .min(1, "Le niveau est obligatoire."),

    filiere_id: z.coerce.number({ invalid_type_error: "La filière est obligatoire." })
        .min(1, "La filière est obligatoire."),
})
