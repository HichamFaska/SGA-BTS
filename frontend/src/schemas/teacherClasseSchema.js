import { z } from "zod"

export const teacherClasseSchema = z.object({
    teacher_id: z.coerce.number().min(1, "Le professeur est obligatoire."),
    class_id: z.coerce.number().min(1, "La classe est obligatoire."),
    academic_year_id: z.coerce.number().min(1, "L'année académique est obligatoire."),
    start_date: z.string().optional().or(z.literal("")),
    end_date: z.string().optional().or(z.literal("")),
})
