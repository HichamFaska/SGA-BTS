<?php

namespace App\Repositories;

use App\Models\Teacher;
use Illuminate\Pagination\LengthAwarePaginator;

class TeacherRepository {

    public function all(?string $search = null, ?string $status = null): LengthAwarePaginator {
        return Teacher::with('user', 'subject')
            ->search($search)
            ->status($status)
            ->latest()
            ->paginate(10);
    }

    public function find(int $id): ?Teacher {
        return Teacher::with('user', 'subject')->find($id);
    }

    public function update(Teacher $teacher, array $data): Teacher {
        $teacher->update($data);
        $teacher->user->update($data);
        return $teacher->load('user', 'subject');
    }

    public function delete(Teacher $teacher): bool {
        $teacher->user->delete();
        return $teacher->delete();
    }
}
