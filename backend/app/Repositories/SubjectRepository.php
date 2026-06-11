<?php

namespace App\Repositories;

use App\Models\Subject;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SubjectRepository {

    public function all(?string $search = null): LengthAwarePaginator {
        return Subject::search($search)
            ->latest()
            ->paginate(10);
    }

    public function list(): Collection {
        return Subject::orderBy('name')->get();
    }

    public function find(int $id): ?Subject {
        return Subject::find($id);
    }

    public function create(array $data): Subject {
        return Subject::create($data);
    }

    public function update(Subject $subject, array $data): Subject {
        $subject->update($data);
        return $subject;
    }

    public function delete(Subject $subject): bool {
        return $subject->delete();
    }
}
