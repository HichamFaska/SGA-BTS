<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentRepository {

    public function all(
        ?string $search = null,
        ?int $classeId = null,
        ?int $filiereId = null,
        ?int $academicYearId = null,
    ): LengthAwarePaginator {
        return Student::search($search)
            ->inClasse($classeId)
            ->inFiliere($filiereId)
            ->inAcademicYear($academicYearId)
            ->latest()
            ->paginate(10);
    }

    public function find(int $id): ?Student {
        return Student::find($id);
    }

    public function create(array $data): Student {
        return Student::create($data);
    }

    public function update(Student $student, array $data): Student {
        $student->update($data);
        return $student;
    }

    public function delete(Student $student): bool {
        return $student->delete();
    }
}
