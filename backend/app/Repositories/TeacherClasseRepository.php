<?php

namespace App\Repositories;

use App\Models\TeacherClasse;
use Illuminate\Pagination\LengthAwarePaginator;

class TeacherClasseRepository {

    public function all(
        ?int $teacherId = null,
        ?int $classeId = null,
        ?int $academicYearId = null,
    ): LengthAwarePaginator {
        return TeacherClasse::with(['teacher.user', 'teacher.subject', 'classe', 'academicYear'])
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->when($classeId, fn($q) => $q->where('class_id', $classeId))
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->latest()
            ->paginate(15);
    }

    public function create(array $data): TeacherClasse {
        $assignment = TeacherClasse::create($data);
        $assignment->load(['teacher.user', 'teacher.subject', 'classe', 'academicYear']);
        return $assignment;
    }

    public function update(TeacherClasse $teacherClasse, array $data): TeacherClasse {
        $teacherClasse->update($data);
        $teacherClasse->load(['teacher.user', 'teacher.subject', 'classe', 'academicYear']);
        return $teacherClasse;
    }

    public function delete(TeacherClasse $teacherClasse): bool {
        return $teacherClasse->delete();
    }
}
