import { z } from "zod"

export const createSessionSchema = z.object({
    class_id: z.coerce.number().min(1, "La classe est obligatoire."),
    session_date: z.string().min(1, "La date de la séance est obligatoire."),
    start_time: z.string().min(1, "L'heure de début est obligatoire."),
    end_time: z.string().min(1, "L'heure de fin est obligatoire."),
    comment: z.string().max(500, "Le commentaire ne doit pas dépasser 500 caractères.").optional().or(z.literal("")),
})

export const updateSessionSchema = z.object({
    session_date: z.string().min(1, "La date de la séance est obligatoire."),
    start_time: z.string().min(1, "L'heure de début est obligatoire."),
    end_time: z.string().min(1, "L'heure de fin est obligatoire."),
    comment: z.string().max(500, "Le commentaire ne doit pas dépasser 500 caractères.").optional().or(z.literal("")),
})
