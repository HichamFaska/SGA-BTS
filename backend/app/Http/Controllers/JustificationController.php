<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJustificationRequest;
use App\Http\Requests\UpdateJustificationRequest;
use App\Http\Resources\JustificationResource;
use App\Models\Absence;
use App\Models\Justification;
use App\Services\JustificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class JustificationController extends Controller {

    use ApiResponse;

    public function __construct(private JustificationService $justificationService) {}

    public function store(StoreJustificationRequest $request, Absence $absence): JsonResponse {
        $this->authorize('manage', Justification::class);

        if ($absence->justification) {
            return $this->errorResponse('Cette absence est déjà justifiée.', 422);
        }

        $justification = $this->justificationService->create(
            $absence,
            $request->reason,
            $request->file('document'),
        );

        return $this->successResponse([
            'justification' => new JustificationResource($justification),
        ], 'Justification ajoutée avec succès.', 201);
    }

    public function update(UpdateJustificationRequest $request, Justification $justification): JsonResponse {
        $this->authorize('manage', $justification);

        $justification = $this->justificationService->update(
            $justification,
            $request->filled('reason') ? $request->reason : null,
            $request->file('document'),
            $request->boolean('remove_document'),
        );

        return $this->successResponse([
            'justification' => new JustificationResource($justification),
        ], 'Justification mise à jour avec succès.');
    }

    public function destroy(Justification $justification): JsonResponse {
        $this->authorize('manage', $justification);

        $this->justificationService->delete($justification);

        return $this->successResponse([], 'Justification supprimée avec succès.');
    }
}
