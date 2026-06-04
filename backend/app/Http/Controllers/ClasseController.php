<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ClasseController extends Controller {

    use ApiResponse;

    public function index(): JsonResponse {
        $classes = Classe::orderBy('name')->get(['id', 'name', 'level']);

        return $this->successResponse([
            'classes' => $classes,
        ], 'Liste des classes récupérée avec succès.', 200);
    }
}
