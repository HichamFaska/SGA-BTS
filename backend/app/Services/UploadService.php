<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadService {

    public function store(UploadedFile $file, string $folder, string $disk = 'public'): string {
        return $file->store($folder, $disk);
    }

    public function replace(UploadedFile $file, ?string $currentPath, string $folder, string $disk = 'public'): string {
        $this->delete($currentPath, $folder, $disk);
        return $this->store($file, $folder, $disk);
    }

    public function delete(?string $path, string $folder, string $disk = 'public'): void {
        if (!$path) return;

        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }
}
