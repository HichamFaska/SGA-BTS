import { z } from "zod"

export const studentSchema = z.object({
    first_name: z.string().min(1, "Le prénom est obligatoire."),
    last_name: z.string().min(1, "Le nom est obligatoire."),
    matricule: z.string().min(1, "Le matricule est obligatoire."),
    class_id: z.coerce.number({ invalid_type_error: "La classe est obligatoire." }).min(1, "La classe est obligatoire."),
    birth_date: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})
