<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClasseRequest;
use App\Http\Requests\UpdateClasseRequest;
use App\Http\Resources\ClasseResource;
use App\Models\Classe;
use App\Repositories\ClasseRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClasseController extends Controller {

    use ApiResponse;

    public function __construct(private ClasseRepository $classeRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', Classe::class);

        $classes = $this->classeRepository->all(
            search: $request->input('search'),
            filiereId: $request->integer('filiere_id') ?: null,
        );

        return $this->successResponse([
            'classes' => ClasseResource::collection($classes),
            'meta' => [
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
                'per_page' => $classes->perPage(),
                'total' => $classes->total(),
            ],
        ], 'Liste des classes récupérée avec succès.');
    }

    public function list(): JsonResponse {

        $this->authorize('viewAny', Classe::class);

        $classes = $this->classeRepository->list();

        return $this->successResponse([
            'classes' => ClasseResource::collection($classes),
        ], 'Liste des classes récupérée avec succès.');
    }

    public function store(StoreClasseRequest $request): JsonResponse {

        $this->authorize('create', Classe::class);

        $classe = $this->classeRepository->create($request->validated());
        $classe->load('filiere');

        return $this->successResponse([
            'classe' => new ClasseResource($classe),
        ], 'Classe créée avec succès.', 201);
    }

    public function show(Classe $classe): JsonResponse {

        $this->authorize('view', $classe);

        $classe->load('filiere');

        return $this->successResponse([
            'classe' => new ClasseResource($classe),
        ], 'Classe récupérée avec succès.');
    }

    public function update(UpdateClasseRequest $request, Classe $classe): JsonResponse {

        $this->authorize('update', $classe);

        $classe = $this->classeRepository->update($classe, $request->validated());
        $classe->load('filiere');

        return $this->successResponse([
            'classe' => new ClasseResource($classe),
        ], 'Classe mise à jour avec succès.');
    }

    public function destroy(Classe $classe): JsonResponse {

        $this->authorize('delete', $classe);

        $this->classeRepository->delete($classe);

        return $this->successResponse([], 'Classe supprimée avec succès.');
    }
}
