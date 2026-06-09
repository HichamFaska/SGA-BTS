import { useRef, useState } from "react"
import { FileUp, Loader2, Upload, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import studentImportService from "@/services/studentImportService"
import teacherImportService from "@/services/teacherImportService"

export default function ImportDialog({ open, onOpenChange, type, onSuccess }) {
    const { success: toastSuccess, error: toastError } = useToast()
    const inputRef = useRef(null)

    const [step, setStep] = useState("upload")
    const [file, setFile] = useState(null)
    const [previewing, setPreviewing] = useState(false)
    const [importing, setImporting] = useState(false)
    const [rows, setRows] = useState([])
    const [skipped, setSkipped] = useState([])
    const [inserted, setInserted] = useState(0)

    const columns = type === "students"
        ? ["matricule", "first_name", "last_name", "email", "birth_date", "phone", "address"]
        : ["matricule", "first_name", "last_name", "email", "birth_date", "phone", "address"]

    const colLabels = {
        matricule: "Matricule",
        first_name: "Prénom",
        last_name: "Nom",
        email: "Email",
        birth_date: "Date de naissance",
        phone: "Téléphone",
        address: "Adresse",
    }

    const reset = () => {
        setStep("upload")
        setFile(null)
        setRows([])
        setSkipped([])
        setInserted(0)
        if (inputRef.current) inputRef.current.value = ""
    }

    const handleClose = (v) => {
        if (!v) reset()
        onOpenChange(v)
    }

    const handleFileChange = (e) => {
        const f = e.target.files?.[0]
        if (f) setFile(f)
    }

    const service = type === "students" ? studentImportService : teacherImportService

    const handlePreview = async () => {
        if (!file) return
        setPreviewing(true)
        try {
            const res = await service.preview(file)
            setRows(res.data.data)
            setStep("preview")
        } catch (err) {
            toastError(err?.message ?? "Impossible d'analyser le fichier.")
        } finally {
            setPreviewing(false)
        }
    }

    const handleImport = async () => {
        setImporting(true)
        try {
            const response = await service.import(rows)
            setInserted(response.data.inserted)
            setSkipped(response.data.skipped ?? [])
            setStep("done")
            toastSuccess(response.message)
            onSuccess?.()
        } catch (err) {
            toastError(err?.message ?? "Erreur lors de l'import.")
        } finally {
            setImporting(false)
        }
    }

    const label = type === "students" ? "étudiants" : "professeurs"

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl flex! flex-col max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Importer des {label}</DialogTitle>
                    <DialogDescription>
                        {step === "upload" && `Sélectionnez un fichier Excel (.xlsx, .xls, .csv) contenant les ${label}.`}
                        {step === "preview" && `Vérifiez les données avant de les importer en base.`}
                        {step === "done" && `Import terminé.`}
                    </DialogDescription>
                </DialogHeader>

                {/* Upload */}
                {step === "upload" && (
                    <div
                        className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        <FileUp className="size-10 text-muted-foreground" />
                        <div className="text-center">
                            <p className="font-medium">{file ? file.name : "Cliquez pour sélectionner un fichier"}</p>
                            <p className="text-sm text-muted-foreground mt-1">xlsx, xls, csv — max 5 Mo</p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {/* Preview */}
                {step === "preview" && (
                    <div className="flex-1 overflow-auto rounded-lg border min-h-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableHead key={col}>{colLabels[col]}</TableHead>
                                    ))}
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + 1} className="py-8 text-center text-muted-foreground">
                                            Aucune donnée trouvée dans le fichier.
                                        </TableCell>
                                    </TableRow>
                                ) : rows.map((row, i) => (
                                    <TableRow key={i}>
                                        {columns.map((col) => (
                                            <TableCell key={col} className="p-1">
                                                <Input
                                                    value={row[col] ?? ""}
                                                    onChange={(e) => {
                                                        const updated = [...rows]
                                                        updated[i] = { ...updated[i], [col]: e.target.value }
                                                        setRows(updated)
                                                    }}
                                                    className={`h-8 text-sm ${!row[col] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Done */}
                {step === "done" && (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 p-4">
                            <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                            <p className="text-sm font-medium">{inserted} enregistrement(s) importé(s) avec succès.</p>
                        </div>
                        {skipped.length > 0 && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    <p className="text-sm font-medium">{skipped.length} ligne(s) ignorée(s)</p>
                                </div>
                                <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                                    {skipped.map((s, i) => (
                                        <li key={i}>{s.matricule} — {s.reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === "upload" && (
                        <>
                            <Button variant="outline" onClick={() => handleClose(false)}>Annuler</Button>
                            <Button onClick={handlePreview} disabled={!file || previewing}>
                                {previewing
                                    ? <Loader2 className="mr-2 size-4 animate-spin" />
                                    : <Upload className="mr-2 size-4" />
                                }
                                Analyser le fichier
                            </Button>
                        </>
                    )}
                    {step === "preview" && (
                        <>
                            <Button variant="outline" onClick={() => setStep("upload")}>Retour</Button>
                            <Button onClick={handleImport} disabled={importing || rows.length === 0}>
                                {importing && <Loader2 className="mr-2 size-4 animate-spin" />}
                                Importer {rows.length} ligne(s)
                            </Button>
                        </>
                    )}
                    {step === "done" && (
                        <Button onClick={() => handleClose(false)}>Fermer</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
