import { z } from "zod"

const STATUSES = ["active", "completed", "redoubling", "abandoned"]

export const enrollmentSchema = z.object({
    student_id: z.coerce.number().min(1, "L'étudiant est obligatoire."),
    class_id: z.coerce.number().min(1, "La classe est obligatoire."),
    academic_year_id: z.coerce.number().min(1, "L'année académique est obligatoire."),
    enrollment_date: z.string().min(1, "La date d'inscription est obligatoire."),
    status: z.enum(STATUSES, { message: "Le statut est obligatoire." }),
})
