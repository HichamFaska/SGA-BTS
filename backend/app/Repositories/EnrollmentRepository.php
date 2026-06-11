<?php

namespace App\Repositories;

use App\Enums\EnrollmentStatusEnum;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EnrollmentRepository {

    public function all(
        ?int $classeId = null,
        ?int $academicYearId = null,
        ?string $status = null,
        ?string $search = null,
    ): LengthAwarePaginator {
        return Enrollment::with(['student', 'classe', 'academicYear'])
            ->when($classeId, fn($q) => $q->where('class_id', $classeId))
            ->when($academicYearId, fn($q) => $q->forYear($academicYearId))
            ->when($status === 'active', fn($q) => $q->active())
            ->when($status && $status !== 'active', fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q->whereHas('student', fn($sq) =>
                $sq->whereLike('first_name', "%{$search}%")
                    ->orWhereLike('last_name', "%{$search}%")
                    ->orWhereLike('matricule', "%{$search}%")
            ))
            ->latest()
            ->paginate(15);
    }

    public function availableStudents(int $classId, int $academicYearId): Collection {
        return Student::select('students.*')
            ->selectSub(
                Enrollment::select('class_id')
                    ->whereColumn('student_id', 'students.id')
                    ->where('academic_year_id', $academicYearId)
                    ->where('status', EnrollmentStatusEnum::Active->value)
                    ->limit(1),
                'active_class_id'
            )
            ->whereNotExists(
                Enrollment::select('id')
                    ->whereColumn('student_id', 'students.id')
                    ->where('class_id', $classId)
                    ->where('academic_year_id', $academicYearId)
            )
            ->orderBy('students.last_name')
            ->orderBy('students.first_name')
            ->get()
            ->map(fn(Student $student) => [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'matricule' => $student->matricule,
                'blocked' => $student->active_class_id !== null,
                'blocked_class_id' => $student->active_class_id,
            ]);
    }

    public function find(int $id): ?Enrollment {
        return Enrollment::with(['student', 'classe', 'academicYear'])->find($id);
    }

    public function create(array $data): Enrollment {
        return Enrollment::create($data);
    }

    public function bulkCreate(int $classId, int $academicYearId, array $studentIds): int {
        $now = now();
        $date = $now->toDateString();

        $rows = array_map(fn (int $id) => [
            'student_id' => $id,
            'class_id' => $classId,
            'academic_year_id' => $academicYearId,
            'enrollment_date' => $date,
            'status' => EnrollmentStatusEnum::Active->value,
            'created_at' => $now,
            'updated_at' => $now,
        ], $studentIds);

        DB::transaction(fn() => Enrollment::insert($rows));

        return count($rows);
    }

    public function update(Enrollment $enrollment, array $data): Enrollment {
        $enrollment->update($data);
        return $enrollment;
    }

    public function delete(Enrollment $enrollment): bool {
        return $enrollment->delete();
    }
}
