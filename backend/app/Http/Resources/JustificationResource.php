<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class JustificationResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'document_url' => $this->document_url ? asset('storage/'.$this->document_url) : null,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
