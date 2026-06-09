<?php

namespace App\Repositories;

use App\Models\Filiere;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class FiliereRepository {

    public function list(): Collection {
        return Filiere::orderBy('name')->get();
    }

    public function all(?string $search = null): LengthAwarePaginator {
        return Filiere::search($search)
            ->latest()
            ->paginate(10);
    }

    public function find(int $id): ?Filiere {
        return Filiere::find($id);
    }

    public function create(array $data): Filiere {
        return Filiere::create($data);
    }

    public function update(Filiere $filiere, array $data): Filiere {
        $filiere->update($data);
        return $filiere;
    }

    public function delete(Filiere $filiere): bool {
        return $filiere->delete();
    }
}
