<?php

namespace App\Repositories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AcademicYearRepository {

    public function list(): Collection {
        return AcademicYear::orderByDesc('start_date')->get();
    }

    public function all(?string $search = null): LengthAwarePaginator {
        return AcademicYear::when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderByDesc('start_date')
            ->paginate(10);
    }

    public function find(int $id): ?AcademicYear {
        return AcademicYear::find($id);
    }

    public function create(array $data): AcademicYear {
        return DB::transaction(function () use ($data) {
            if (isset($data['is_current']) && $data['is_current'] === true) {
                AcademicYear::where('is_current', true)->update(['is_current' => false]);
            }
            return AcademicYear::create($data);
        });
    }

    public function update(AcademicYear $academicYear, array $data): AcademicYear {
        return DB::transaction(function () use ($academicYear, $data) {
            if (isset($data['is_current']) && $data['is_current'] === true) {
                AcademicYear::where('is_current', true)
                    ->where('id', '!=', $academicYear->id)
                    ->update(['is_current' => false]);
            }
            $academicYear->update($data);
            return $academicYear;
        });
    }

    public function delete(AcademicYear $academicYear): bool {
        return $academicYear->delete();
    }
}
