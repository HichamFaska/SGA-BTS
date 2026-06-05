<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentRepository {

    public function all(?string $search = null, ?int $classId = null): LengthAwarePaginator {
        return Student::with('classe')
            ->search($search)
            ->class($classId)
            ->latest()
            ->paginate(10);
    }

    public function find(int $id): ?Student {
        return Student::with('classe')->find($id);
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
