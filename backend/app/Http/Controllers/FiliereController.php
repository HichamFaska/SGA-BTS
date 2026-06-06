<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFiliereRequest;
use App\Http\Requests\UpdateFiliereRequest;
use App\Http\Resources\FiliereResource;
use App\Models\Filiere;
use App\Repositories\FiliereRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FiliereController extends Controller {

    use ApiResponse;

    public function __construct(private FiliereRepository $filiereRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', Filiere::class);

        $filieres = $this->filiereRepository->all(
            search: $request->input('search'),
        );

        return $this->successResponse([
            'filieres' => FiliereResource::collection($filieres),
            'meta' => [
                'current_page' => $filieres->currentPage(),
                'last_page' => $filieres->lastPage(),
                'per_page' => $filieres->perPage(),
                'total' => $filieres->total(),
            ],
        ], 'Liste des filières récupérée avec succès.');
    }

    public function store(StoreFiliereRequest $request): JsonResponse {

        $this->authorize('create', Filiere::class);

        $filiere = $this->filiereRepository->create($request->validated());

        return $this->successResponse([
            'filiere' => new FiliereResource($filiere),
        ], 'Filière créée avec succès.', 201);
    }

    public function show(Filiere $filiere): JsonResponse {

        $this->authorize('view', $filiere);

        return $this->successResponse([
            'filiere' => new FiliereResource($filiere),
        ], 'Filière récupérée avec succès.');
    }

    public function update(UpdateFiliereRequest $request, Filiere $filiere): JsonResponse {

        $this->authorize('update', $filiere);

        $filiere = $this->filiereRepository->update($filiere, $request->validated());

        return $this->successResponse([
            'filiere' => new FiliereResource($filiere),
        ], 'Filière mise à jour avec succès.');
    }

    public function destroy(Filiere $filiere): JsonResponse {

        $this->authorize('delete', $filiere);

        $this->filiereRepository->delete($filiere);

        return $this->successResponse([], 'Filière supprimée avec succès.');
    }
}
