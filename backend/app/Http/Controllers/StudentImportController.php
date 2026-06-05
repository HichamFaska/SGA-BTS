<?php

namespace App\Http\Controllers;

use App\Imports\ExcelImport;
use App\Models\Classe;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class StudentImportController extends Controller {

    use ApiResponse;

    public function preview(Request $request): JsonResponse {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $import = new ExcelImport();
        Excel::import($import, $request->file('file'));

        $normalized = $import->rows
            ->map(fn($row) => $this->normalize($row->toArray()))
            ->filter(fn($row) => !empty($row['matricule']))
            ->values();

        return $this->successResponse(
            ['data' => $normalized],
            'Fichier analysé avec succès.'
        );
    }

    public function import(Request $request): JsonResponse {
        $request->validate([
            'data' => ['required', 'array', 'min:1'],
            'data.*.matricule' => ['required', 'string'],
            'data.*.first_name' => ['required', 'string'],
            'data.*.last_name' => ['required', 'string'],
            'data.*.class' => ['nullable', 'string'],
        ]);

        $classes = Classe::all()->mapWithKeys(fn($c) => [strtolower(trim($c->name)) => $c->id]);

        $skipped = [];
        $studentsPayload = [];
        $now = now();

        foreach ($request->data as $row) {
            $classId = $classes[strtolower(trim($row['class'] ?? ''))] ?? null;

            if (!$classId) {
                $skipped[] = [
                    'matricule' => $row['matricule'],
                    'reason' => 'Classe introuvable : ' . ($row['class'] ?? 'non spécifiée'),
                ];
                continue;
            }

            $studentsPayload[] = [
                'matricule' => $row['matricule'],
                'first_name' => $row['first_name'],
                'last_name' => $row['last_name'],
                'birth_date' => $row['birth_date'] ?: null,
                'phone' => $row['phone'] ?: null,
                'address' => $row['address'] ?: null,
                'class_id' => $classId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (empty($studentsPayload)) {
            return $this->successResponse(
                ['inserted' => 0, 'skipped' => $skipped],
                'Aucun étudiant valide à importer.'
            );
        }

        Student::upsert(
            $studentsPayload,
            ['matricule'],
            ['first_name', 'last_name', 'birth_date', 'phone', 'address', 'class_id', 'updated_at']
        );

        $inserted = count($studentsPayload);

        return $this->successResponse(
            ['inserted' => $inserted, 'skipped' => $skipped],
            "{$inserted} étudiant(s) importé(s) avec succès."
        );
    }

    private function normalize(array $row): array {
        return [
            'matricule' => $row['matricule'] ?? $row['id'] ?? null,
            'first_name' => $row['first_name'] ?? $row['prenom'] ?? null,
            'last_name' => $row['last_name'] ?? $row['nom'] ?? null,
            'birth_date' => $row['birth_date'] ?? $row['naissance'] ?? null,
            'phone' => $row['phone'] ?? $row['telephone'] ?? null,
            'address' => $row['address'] ?? $row['adresse'] ?? null,
            'class' => $row['class'] ?? $row['classe'] ?? null,
        ];
    }
}
