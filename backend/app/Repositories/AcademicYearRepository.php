<?php

namespace App\Repositories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Collection;

class AcademicYearRepository {

    public function list(): Collection {
        return AcademicYear::orderByDesc('start_date')->get();
    }

    public function find(int $id): ?AcademicYear {
        return AcademicYear::find($id);
    }

    public function create(array $data): AcademicYear {
        return AcademicYear::create($data);
    }

    public function update(AcademicYear $academicYear, array $data): AcademicYear {
        $academicYear->update($data);
        return $academicYear;
    }

    public function delete(AcademicYear $academicYear): bool {
        return $academicYear->delete();
    }
}
