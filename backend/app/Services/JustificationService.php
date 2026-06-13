<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Justification;
use Illuminate\Http\UploadedFile;

class JustificationService {

    public function __construct(private UploadService $uploadService) {}

    public function create(Absence $absence, string $reason, ?UploadedFile $document): Justification {
        $documentPath = $document ? $this->uploadService->store($document, 'justifications') : null;

        $justification = $absence->justification()->create([
            'reason' => $reason,
            'document_url' => $documentPath,
        ]);

        $absence->update(['status' => 'justifiée']);

        return $justification;
    }

    public function update(Justification $justification, ?string $reason, ?UploadedFile $document, bool $removeDocument): Justification {
        if ($document) {
            $justification->document_url = $this->uploadService->replace(
                $document,
                $justification->document_url,
                'justifications'
            );
        } elseif ($removeDocument) {
            $this->uploadService->delete($justification->document_url, 'justifications');
            $justification->document_url = null;
        }

        if ($reason !== null) {
            $justification->reason = $reason;
        }

        $justification->save();

        return $justification;
    }

    public function delete(Justification $justification): void {
        $this->uploadService->delete($justification->document_url, 'justifications');
        $justification->absence->update(['status' => 'non justifiée']);
        $justification->delete();
    }
}
