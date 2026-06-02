<?php

namespace App\Repositories;

use App\Models\Teacher;
use Illuminate\Pagination\LengthAwarePaginator;

class TeacherRepository {

    public function all(): LengthAwarePaginator {
        return Teacher::with('user')->latest()->paginate(10);
    }

    public function find(int $id): ?Teacher {
        return Teacher::with('user')->find($id);
    }

    public function update(Teacher $teacher, array $data): Teacher {
        $teacher->update($data);
        return $teacher;
    }

    public function delete(Teacher $teacher): bool {
        return $teacher->delete();
    }
}
