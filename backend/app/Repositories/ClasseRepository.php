<?php

namespace App\Repositories;

use App\Models\Classe;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ClasseRepository {

    public function all(?string $search = null, ?int $filiereId = null): LengthAwarePaginator {
        return Classe::with('filiere')
            ->search($search)
            ->filiere($filiereId)
            ->orderBy('name')
            ->paginate(10);
    }

    public function list(): Collection {
        return Classe::with('filiere')->orderBy('name')->get();
    }

    public function find(int $id): ?Classe {
        return Classe::with('filiere')->find($id);
    }

    public function create(array $data): Classe {
        return Classe::create($data);
    }

    public function update(Classe $classe, array $data): Classe {
        $classe->update($data);
        return $classe;
    }

    public function delete(Classe $classe): bool {
        return $classe->delete();
    }
}
