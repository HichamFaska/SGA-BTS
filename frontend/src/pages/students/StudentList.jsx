import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, Loader2, Plus, Trash2, UserPen, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    FormProvider, FormField, FormItem,
    FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"

import { useToast } from "@/components/ui/use-toast"
import studentService from "@/services/studentService"
import classeService from "@/services/classeService"
import { studentSchema } from "@/schemas/studentSchema"
import { handleApiErrors } from "@/lib/api-errors"

const defaultValues = {
    first_name: "",
    last_name: "",
    matricule: "",
    class_id: "",
    birth_date: "",
    phone: "",
    address: "",
}

export default function StudentList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showTarget, setShowTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [loadingForm, setLoadingForm] = useState(false)

    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues,
    })

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const response = await studentService.list()
            setStudents(response.data.students)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les étudiants.")
        } finally {
            setLoading(false)
        }
    }

    const fetchClasses = async () => {
        try {
            const response = await classeService.list()
            setClasses(response.data.classes ?? [])
        } catch {
            toastError("Impossible de charger les classes.")
        }
    }

    useEffect(() => {
        fetchStudents()
        fetchClasses()
    }, [])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = async (student) => {
        setEditTarget(student)
        setLoadingForm(true)
        setFormOpen(true)
        try {
            const response = await studentService.show(student.id)
            const std = response.data.student
            form.reset({
                first_name: std.first_name,
                last_name: std.last_name,
                matricule: std.matricule,
                class_id: std.class_id,
                birth_date: std.birth_date,
                phone: std.phone,
                address: std.address,
            })
        } catch {
            toastError("Impossible de charger l'étudiant.")
            setFormOpen(false)
        } finally {
            setLoadingForm(false)
        }
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditTarget(null)
        form.reset(defaultValues)
    }

    const onSubmit = async (values) => {
        try {
            if (editTarget) {
                const response = await studentService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await studentService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchStudents()
        } catch (err) {
            if (!handleApiErrors(err, form.setError)){
                toastError(err.message)
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await studentService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchStudents()
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Étudiants</h1>
                        <p className="text-sm text-muted-foreground">
                            {students.length} étudiant{students.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 size-4" />
                    Ajouter un étudiant
                </Button>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Date de naissance</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                    Aucun étudiant pour l&apos;instant.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.matricule}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.classe?.name || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.phone || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.birth_date || "—"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTarget(student)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(student)}>
                                                <UserPen className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(student)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Show */}
            <Dialog open={!!showTarget} onOpenChange={(v) => !v && setShowTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{showTarget?.first_name} {showTarget?.last_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {[
                            ["Matricule",        showTarget?.matricule],
                            ["Classe",           showTarget?.classe?.name],
                            ["Téléphone",        showTarget?.phone],
                            ["Date de naissance",showTarget?.birth_date],
                            ["Adresse",          showTarget?.address],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value || "—"}</span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create / Edit */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "Modifier l'étudiant" : "Ajouter un étudiant"}</DialogTitle>
                        <DialogDescription>
                            {editTarget ? "Modifiez les informations de l'étudiant." : "Remplissez les informations du nouvel étudiant."}
                        </DialogDescription>
                    </DialogHeader>

                    {loadingForm ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField control={form.control} name="first_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl><Input placeholder="Youssef" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="last_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl><Input placeholder="Alaoui" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="matricule" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matricule</FormLabel>
                                            <FormControl><Input placeholder="ETU-001" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="class_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Classe</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ""}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Sélectionner une classe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="birth_date" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de naissance</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl><Input placeholder="06 00 00 00 00" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Adresse</FormLabel>
                                            <FormControl><Input placeholder="Rue, ville..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeForm}>Annuler</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                        {editTarget ? "Enregistrer" : "Ajouter"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </FormProvider>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;étudiant</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <span className="font-medium text-foreground">{deleteTarget?.first_name} {deleteTarget?.last_name}</span>{" "}
                            ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
