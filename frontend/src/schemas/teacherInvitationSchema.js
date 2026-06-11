import { z } from "zod"

export const teacherInvitationSchema = z.object({
    email: z.string().email("Veuillez saisir une adresse email valide."),
    matricule: z.string().min(1, "Le matricule est obligatoire."),
    first_name: z.string().min(1, "Le prénom est obligatoire."),
    last_name: z.string().min(1, "Le nom est obligatoire."),
    birth_date: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    avatar: z.string().optional().or(z.literal("")),
    subject_id: z.coerce.number().optional().or(z.literal("")),
})

export const teacherUpdateSchema = z.object({
    matricule: z.string().min(1, "Le matricule est obligatoire."),
    first_name: z.string().min(1, "Le prénom est obligatoire."),
    last_name: z.string().min(1, "Le nom est obligatoire."),
    birth_date: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    subject_id: z.coerce.number().optional().or(z.literal("")),
})
