<?php

namespace App\Http\Controllers;

use App\Enums\UserRoleEnum;
use App\Imports\ExcelImport;
use App\Jobs\SendInvitationMailJob;
use App\Models\Invitation;
use App\Models\Teacher;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class TeacherImportController extends Controller {

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
            'data.*.email' => ['required', 'email'],
        ]);

        $admin = $request->user();
        $rows = collect($request->data);
        $skipped = [];

        $emails = $rows->pluck('email')->map(fn($e) => strtolower(trim($e)))->unique();
        $existingUsers = User::whereIn('email', $emails)->with('teacher')->get()->keyBy('email');

        $validRows = [];
        $newUsersData = [];

        foreach ($rows as $row) {
            $email = strtolower(trim($row['email']));
            $existing = $existingUsers->get($email);

            if ($existing?->teacher) {
                $skipped[] = [
                    'matricule' => $row['matricule'],
                    'reason' => 'Email déjà utilisé par un enseignant existant.',
                ];
                continue;
            }

            $validRows[] = array_merge($row, ['email' => $email]);

            if (!$existing) {
                $newUsersData[] = [
                    'first_name' => $row['first_name'],
                    'last_name'  => $row['last_name'],
                    'email' => $email,
                    'password' => bcrypt(Str::random(16)),
                    'role' => UserRoleEnum::Teacher->value,
                    'phone' => $row['phone'] ?: null,
                    'address' => $row['address'] ?: null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (empty($validRows)) {
            return $this->successResponse(
                ['inserted' => 0, 'skipped' => $skipped],
                '0 enseignant(s) importé(s) avec succès.'
            );
        }

        $invitations = DB::transaction(function () use ($validRows, $newUsersData, $admin) {
            $now = now();

            if (!empty($newUsersData)) {
                User::insert($newUsersData);
            }

            $validEmails = collect($validRows)->pluck('email')->all();
            $allUsers    = User::whereIn('email', $validEmails)->get()->keyBy('email');

            $teacherRows = collect($validRows)->map(fn($row) => [
                'user_id' => $allUsers[$row['email']]->id,
                'matricule' => $row['matricule'],
                'birth_date' => $row['birth_date'] ?: null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            Teacher::upsert(
                $teacherRows,
                ['matricule'],
                ['user_id', 'birth_date', 'updated_at']
            );

            $userIds = collect($validRows)->map(fn($row) => $allUsers[$row['email']]->id)->all();

            Invitation::whereIn('user_id', $userIds)->delete();

            $invitationRows = collect($validRows)->map(fn($row) => [
                'user_id' => $allUsers[$row['email']]->id,
                'invited_by'  => $admin->id,
                'token' => Str::random(64),
                'expires_at' => $now->copy()->addDays(7),
                'accepted_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            Invitation::insert($invitationRows);

            return Invitation::whereIn('user_id', $userIds)->with('user')->get();
        });

        foreach ($invitations as $invitation) {
            dispatch(new SendInvitationMailJob($invitation->id));
        }

        $inserted = count($validRows);

        return $this->successResponse(
            ['inserted' => $inserted, 'skipped' => $skipped],
            "{$inserted} enseignant(s) importé(s) avec succès."
        );
    }

    private function normalize(array $row): array {
        return [
            'matricule' => $row['matricule'] ?? $row['id'] ?? null,
            'first_name' => $row['first_name'] ?? $row['prenom'] ?? null,
            'last_name' => $row['last_name'] ?? $row['nom'] ?? null,
            'email' => $row['email'] ?? $row['mail'] ?? null,
            'birth_date' => $row['birth_date'] ?? $row['naissance'] ?? null,
            'phone' => $row['phone'] ?? $row['telephone'] ?? null,
            'address' => $row['address'] ?? $row['adresse'] ?? null,
        ];
    }
}
