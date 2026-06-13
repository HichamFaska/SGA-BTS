import { useRef, useState } from "react"
import { ExternalLink, FileText, Loader2, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import justificationService from "@/services/justificationService"

export default function JustifyDialog({ absence, open, onOpenChange, onSuccess }) {
    const { success: toastSuccess, error: toastError } = useToast()

    const documentInputRef = useRef(null)
    const justification = absence?.justification ?? null

    const [reason, setReason] = useState(justification?.reason ?? "")
    const [documentFile, setDocumentFile] = useState(null)
    const [removeDocument, setRemoveDocument] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isEdit = !!justification

    const resetState = () => {
        setReason(justification?.reason ?? "")
        setDocumentFile(null)
        setRemoveDocument(false)
        setConfirmDeleteOpen(false)
    }

    const handleOpenChange = (isOpen) => {
        if (!isOpen){
            resetState()
        } 
        onOpenChange(isOpen)
    }

    const handleDocumentChange = (event) => {
        const file = event.target.files?.[0] ?? null
        if (file) {
            setDocumentFile(file)
            setRemoveDocument(false)
        }
    }

    const handleRemoveDocument = () => {
        setDocumentFile(null)
        setRemoveDocument(true)
        if (documentInputRef.current){
            documentInputRef.current.value = ""
        }
    }

    const handleClearFile = () => {
        setDocumentFile(null)
        if (documentInputRef.current){
            documentInputRef.current.value = ""
        } 
    }

    const handleSubmit = async () => {
        if (!reason.trim()){
            return
        }
        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("reason", reason)

            if (documentFile){
                formData.append("document", documentFile)
            }
            if (removeDocument){
                formData.append("remove_document", "1")
            }

            const response = isEdit ? await justificationService.update(justification.id, formData) : await justificationService.create(absence.id, formData)

            toastSuccess(response.message)
            onSuccess()
            handleOpenChange(false)
        } catch (error) {
            toastError(error?.message ?? "Une erreur est survenue.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteJustification = async () => {
        setDeleting(true)
        try {
            const response = await justificationService.remove(justification.id)
            toastSuccess(response.message)
            onSuccess()
            handleOpenChange(false)
        } catch (error) {
            toastError(error?.message ?? "Impossible de supprimer la justification.")
        } finally {
            setDeleting(false)
        }
    }

    if (confirmDeleteOpen) {
        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la justification</DialogTitle>
                        <DialogDescription>
                            Supprimer la justification de{" "}
                            <span className="font-medium text-foreground">
                                {absence?.student?.first_name} {absence?.student?.last_name}
                            </span>{" "}
                            ? L&apos;absence repassera à &quot;non justifiée&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Retour</Button>
                        <Button variant="destructive" onClick={handleDeleteJustification} disabled={deleting}>
                            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier la justification" : "Justifier l'absence"}
                    </DialogTitle>
                    <DialogDescription>
                        {absence?.student?.first_name} {absence?.student?.last_name}
                        {absence?.session?.session_date ? ` · ${absence.session.session_date}` : ""}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Raison */}
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium">
                            Raison <span className="text-destructive">*</span>
                        </p>
                        <Textarea
                            placeholder="Certificat médical, motif familial..."
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Document */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Document{" "}
                            <span className="text-xs font-normal text-muted-foreground">(PDF, JPG ou PNG · max 5 Mo)</span>
                        </p>

                        {/* Lien document existant */}
                        {isEdit && justification.document_url && !removeDocument && !documentFile && (
                            <div className="flex items-center gap-2">
                                <a
                                    href={justification.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-1 items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                        <FileText className="size-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-primary">Voir le document</p>
                                        <p className="text-xs text-muted-foreground">Ouvrir dans un nouvel onglet</p>
                                    </div>
                                    <ExternalLink className="size-4 shrink-0 text-primary/60" />
                                </a>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-destructive hover:text-destructive"
                                    onClick={handleRemoveDocument}
                                    title="Retirer le document"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        )}

                        {/* Fichier sélectionné */}
                        {documentFile && (
                            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <FileText className="size-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {documentFile.name.length > 30
                                            ? documentFile.name.slice(0, 30) + "..."
                                            : documentFile.name}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0 text-destructive hover:text-destructive"
                                    onClick={handleClearFile}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        )}

                        {/* Zone d'upload */}
                        {!documentFile && (
                            <button
                                type="button"
                                onClick={() => documentInputRef.current?.click()}
                                className="w-full rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                            >
                                <UploadCloud className="mx-auto mb-2 size-8 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">
                                    {isEdit && justification.document_url && !removeDocument
                                        ? "Remplacer le document"
                                        : "Choisir un fichier"}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Cliquer pour parcourir
                                </p>
                            </button>
                        )}

                        <input
                            ref={documentInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={handleDocumentChange}
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    {isEdit && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive sm:mr-auto"
                            onClick={() => setConfirmDeleteOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Supprimer la justification
                        </Button>
                    )}
                    <div className="flex gap-2 sm:ml-auto">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Annuler</Button>
                        <Button onClick={handleSubmit} disabled={submitting || !reason.trim()}>
                            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isEdit ? "Enregistrer" : "Justifier"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
