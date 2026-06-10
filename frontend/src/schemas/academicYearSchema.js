import { z } from "zod"

export const academicYearSchema = z.object({
    name: z.string()
        .min(1, "Le nom de l'année académique est obligatoire.")
        .max(100, "Le nom ne doit pas dépasser 100 caractères."),

    start_date: z.string()
        .min(1, "La date de début est obligatoire."),

    end_date: z.string()
        .min(1, "La date de fin est obligatoire."),

    is_current: z.boolean().optional(),
}).refine((data) => {
    if (data.start_date && data.end_date) {
        return new Date(data.end_date) > new Date(data.start_date)
    }
    return true
}, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["end_date"],
})
